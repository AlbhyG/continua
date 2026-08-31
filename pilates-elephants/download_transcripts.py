#!/usr/bin/env python3
"""Download every publisher-provided Pilates Elephants transcript.

The podcast RSS feed is the canonical source for transcript attachments. The
episode archive is fetched only to build a complete inventory of episodes that
do and do not have a published transcript.
"""

from __future__ import annotations

import csv
import html
import re
import time
import unicodedata
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path


BASE_URL = "https://pilates-elephants.breathe-education.com"
FEED_URL = "https://feeds.captivate.fm/pilates-elephants/"
OUTPUT_DIR = Path(__file__).resolve().parent
USER_AGENT = "Pilates-Elephants-transcript-archiver/1.0"
MAX_WORKERS = 8


@dataclass(frozen=True)
class Episode:
    number: int | None
    title: str
    published: str
    url: str


@dataclass(frozen=True)
class Transcript:
    episode: Episode
    source_url: str
    media_type: str


class ParagraphParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._inside_paragraph = False
        self._parts: list[str] = []
        self.paragraphs: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() == "p":
            self._inside_paragraph = True
            self._parts = []

    def handle_data(self, data: str) -> None:
        if self._inside_paragraph:
            self._parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "p" and self._inside_paragraph:
            self.paragraphs.append("".join(self._parts).strip())
            self._inside_paragraph = False
            self._parts = []


def fetch(url: str) -> bytes:
    error: Exception | None = None
    for attempt in range(4):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(request, timeout=60) as response:
                return response.read()
        except urllib.error.HTTPError as exc:
            if 400 <= exc.code < 500 and exc.code != 429:
                raise
            error = exc
            time.sleep(1 + attempt * 2)
        except Exception as exc:  # pragma: no cover - network-dependent retry
            error = exc
            time.sleep(1 + attempt * 2)
    assert error is not None
    raise error


def text_content(fragment: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", fragment)).strip()


def episode_number(title: str) -> int | None:
    match = re.match(r"\s*(\d+)", title)
    return int(match.group(1)) if match else None


def parse_archive_page(page_html: str) -> list[Episode]:
    title_pattern = re.compile(
        r'<h1\s+class="episode-title"><a\s+href="([^"]+)"[^>]*>(.*?)</a>\s*</h1>',
        re.DOTALL,
    )
    date_pattern = re.compile(
        r'<div\s+class="published[^\"]*"[^>]*>\s*Published on:\s*<strong>(.*?)</strong>',
        re.DOTALL,
    )
    titles = title_pattern.findall(page_html)
    dates = [text_content(value) for value in date_pattern.findall(page_html)]
    if len(titles) != len(dates):
        raise RuntimeError(
            f"Archive parse mismatch: found {len(titles)} titles and {len(dates)} dates"
        )
    return [
        Episode(
            number=episode_number(text_content(title)),
            title=text_content(title),
            published=published,
            url=url,
        )
        for (url, title), published in zip(titles, dates, strict=True)
    ]


def load_episode_archive() -> list[Episode]:
    first_page = fetch(f"{BASE_URL}/episodes/1").decode("utf-8", "replace")
    last_match = re.search(r'/episodes/(\d+)#showEpisodes">Last</a>', first_page)
    if not last_match:
        raise RuntimeError("Could not determine the final episode archive page")
    last_page = int(last_match.group(1))

    pages: list[str | None] = [None] * last_page
    pages[0] = first_page
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        page_numbers = range(2, last_page + 1)
        responses = executor.map(
            fetch, (f"{BASE_URL}/episodes/{page}" for page in page_numbers)
        )
        for page_number, body in zip(page_numbers, responses, strict=True):
            pages[page_number - 1] = body.decode("utf-8", "replace")

    episodes: dict[str, Episode] = {}
    for page in pages:
        assert page is not None
        for episode in parse_archive_page(page):
            episodes[episode.url] = episode
    return sorted(
        episodes.values(),
        key=lambda item: (item.number is None, item.number or 0, item.published, item.title),
    )


def cdata_value(item: str, tag: str) -> str:
    match = re.search(
        rf"<{re.escape(tag)}>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</{re.escape(tag)}>",
        item,
        re.DOTALL,
    )
    return html.unescape(match.group(1).strip()) if match else ""


def load_transcripts_from_feed(episodes: list[Episode]) -> list[Transcript]:
    feed = fetch(FEED_URL).decode("utf-8", "replace")
    episodes_by_url = {episode.url.rstrip("/"): episode for episode in episodes}
    episodes_by_title = {episode.title: episode for episode in episodes}
    transcripts: list[Transcript] = []

    for item in re.findall(r"<item>(.*?)</item>", feed, re.DOTALL):
        attachment = re.search(r"<podcast:transcript\s+([^>]+?)/?>", item)
        if not attachment:
            continue
        attributes = dict(re.findall(r'(\w+)="([^"]*)"', attachment.group(1)))
        source_url = attributes.get("url", "")
        media_type = attributes.get("type", "text/plain")
        episode_url = cdata_value(item, "link").rstrip("/")
        title = text_content(cdata_value(item, "title"))
        published = cdata_value(item, "pubDate")
        episode = episodes_by_url.get(episode_url) or episodes_by_title.get(title)
        if episode is None:
            episode = Episode(
                number=episode_number(title),
                title=title,
                published=published,
                url=episode_url,
            )
        if source_url:
            transcripts.append(Transcript(episode, source_url, media_type))

    return sorted(
        transcripts,
        key=lambda item: (
            item.episode.number is None,
            item.episode.number or 0,
            item.episode.title,
        ),
    )


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    value = re.sub(r"^\s*\d+[.:]?\s*", "", value)
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return value[:100] or "untitled"


def transcript_filename(transcript: Transcript) -> str:
    number = (
        f"{transcript.episode.number:03d}"
        if transcript.episode.number is not None
        else "unnumbered"
    )
    return f"{number}-{slugify(transcript.episode.title)}.txt"


def transcript_text(
    transcript: Transcript,
    body: bytes,
    media_type: str,
    retrieved_from: str,
) -> str:
    decoded = body.decode("utf-8-sig", "replace")
    if media_type == "text/html" or "<p" in decoded[:500].lower():
        parser = ParagraphParser()
        parser.feed(decoded)
        content = "\n".join(parser.paragraphs)
        content = re.sub(r"\n{3,}", "\n\n", content).strip()
    else:
        content = decoded.strip()

    header = (
        f"{transcript.episode.title}\n"
        f"Published: {transcript.episode.published}\n"
        f"Episode: {transcript.episode.url}\n"
        f"Transcript source: {retrieved_from}\n"
        f"RSS transcript attachment: {transcript.source_url}\n"
        f"Transcript media type: {media_type}\n"
        "\n"
    )
    return header + content + "\n"


def fallback_transcript(transcript: Transcript) -> tuple[bytes, str, str]:
    page = fetch(transcript.episode.url).decode("utf-8", "replace")
    container = re.search(
        r'<div\s+class="episode-transcripts"[^>]*>(.*?)</div>', page, re.DOTALL
    )
    if not container:
        raise RuntimeError(
            f"Transcript attachment and episode-page fallback both failed for "
            f"{transcript.episode.title}"
        )
    segments = re.findall(
        r"<time>.*?data-timestamp=['\"]([^'\"]+)['\"].*?</time>\s*<p>(.*?)</p>",
        container.group(1),
        re.DOTALL,
    )
    if not segments:
        raise RuntimeError(
            f"Could not parse the episode-page transcript for {transcript.episode.title}"
        )
    content = "\n\n".join(
        f"{timestamp}\n{text_content(paragraph)}" for timestamp, paragraph in segments
    )
    return content.encode("utf-8"), "text/plain", transcript.episode.url


def download_transcript(transcript: Transcript) -> tuple[bytes, str, str]:
    try:
        return fetch(transcript.source_url), transcript.media_type, transcript.source_url
    except Exception:
        return fallback_transcript(transcript)


def write_transcripts(transcripts: list[Transcript]) -> dict[str, str]:
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        downloads = list(executor.map(download_transcript, transcripts))

    files_by_url: dict[str, str] = {}
    for transcript, download in zip(transcripts, downloads, strict=True):
        body, media_type, retrieved_from = download
        filename = transcript_filename(transcript)
        (OUTPUT_DIR / filename).write_text(
            transcript_text(transcript, body, media_type, retrieved_from), encoding="utf-8"
        )
        files_by_url[transcript.episode.url.rstrip("/")] = filename
    return files_by_url


def write_inventory(
    episodes: list[Episode], transcripts: list[Transcript], files_by_url: dict[str, str]
) -> None:
    transcripts_by_url = {
        item.episode.url.rstrip("/"): item for item in transcripts
    }
    with (OUTPUT_DIR / "episodes.csv").open("w", encoding="utf-8", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(
            [
                "episode_number",
                "title",
                "published",
                "episode_url",
                "transcript_available",
                "transcript_file",
                "transcript_source",
            ]
        )
        for episode in episodes:
            key = episode.url.rstrip("/")
            transcript = transcripts_by_url.get(key)
            writer.writerow(
                [
                    episode.number or "",
                    episode.title,
                    episode.published,
                    episode.url,
                    "yes" if transcript else "no",
                    files_by_url.get(key, ""),
                    transcript.source_url if transcript else "",
                ]
            )


def write_readme(episodes: list[Episode], transcripts: list[Transcript]) -> None:
    generated = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    numbers = [
        item.episode.number
        for item in transcripts
        if item.episode.number is not None
    ]
    coverage = f"episodes {min(numbers)}–{max(numbers)} (non-contiguous)" if numbers else "none"
    (OUTPUT_DIR / "README.md").write_text(
        "\n".join(
            [
                "# Pilates Elephants transcripts",
                "",
                f"Downloaded {len(transcripts)} publisher-provided transcripts from the official podcast feed.",
                f"The official archive contained {len(episodes)} episode entries when checked on {generated}.",
                f"Transcript coverage: {coverage}.",
                "",
                "Each `.txt` file contains the episode title, source URLs, and the complete transcript attachment published by the podcast. `episodes.csv` inventories the full archive and marks episodes for which the publisher did not provide a transcript.",
                "",
                f"- Official podcast site: {BASE_URL}",
                f"- Official RSS feed: {FEED_URL}",
                "",
                "To refresh the archive, run:",
                "",
                "```sh",
                "python3 download_transcripts.py",
                "```",
                "",
            ]
        ),
        encoding="utf-8",
    )


def main() -> None:
    episodes = load_episode_archive()
    transcripts = load_transcripts_from_feed(episodes)
    files_by_url = write_transcripts(transcripts)
    write_inventory(episodes, transcripts, files_by_url)
    write_readme(episodes, transcripts)
    print(
        f"Downloaded {len(transcripts)} transcripts and inventoried "
        f"{len(episodes)} episode entries in {OUTPUT_DIR}"
    )


if __name__ == "__main__":
    main()
