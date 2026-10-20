'use client'

import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import {
  createGroup,
  createPerson,
  deleteGroup,
  deletePerson,
} from '@/app/actions/relationships'

export type RelationshipPerson = {
  id: string
  name: string
  email: string | null
  isSelf: boolean
  latestResult: {
    id: number
    score: number
    takenAt: string
  } | null
}

export type RelationshipGroup = {
  id: string
  name: string
  kind: string
  memberCount: number
}

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-[80]">
      <DialogBackdrop className="fixed inset-0 bg-black/35 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
        <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default function RelationshipManager({
  people,
  groups,
}: {
  people: RelationshipPerson[]
  groups: RelationshipGroup[]
}) {
  const searchParams = useSearchParams()
  const [personOpen, setPersonOpen] = useState(false)
  const [groupOpen, setGroupOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [personName, setPersonName] = useState('')
  const [personEmail, setPersonEmail] = useState('')
  const [groupName, setGroupName] = useState('')
  const [groupKind, setGroupKind] = useState('family')
  const [memberIds, setMemberIds] = useState<string[]>([])

  useEffect(() => {
    if (searchParams.get('add') === 'person') setPersonOpen(true)
    if (searchParams.get('add') === 'group') setGroupOpen(true)
  }, [searchParams])

  function run(action: () => Promise<void>, onSuccess?: () => void) {
    setError(null)
    startTransition(async () => {
      try {
        await action()
        onSuccess?.()
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Something went wrong.')
      }
    })
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setError(null)
            setPersonOpen(true)
          }}
          className="rounded-xl bg-white/90 px-5 py-2.5 text-sm font-bold transition hover:bg-white"
        >
          Add a person
        </button>
        <button
          type="button"
          onClick={() => {
            setError(null)
            setGroupOpen(true)
          }}
          className="rounded-xl border border-white/45 bg-white/15 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/25"
        >
          Add a group
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-white">People</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {people.map((person) => (
            <article key={person.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold">{person.name}</h3>
                    {person.isSelf && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
                        You
                      </span>
                    )}
                  </div>
                  {person.email && !person.isSelf && (
                    <p className="mt-1 text-sm text-foreground/55">{person.email}</p>
                  )}
                </div>
                {!person.isSelf && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (window.confirm(`Remove ${person.name} and their saved results?`)) {
                        run(() => deletePerson(person.id))
                      }
                    }}
                    className="text-xs font-semibold text-red-700/70 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              {person.latestResult ? (
                <Link
                  href={`/quiz/results/${person.latestResult.id}`}
                  className="mt-4 block rounded-xl bg-white/60 p-3 text-sm transition hover:bg-white"
                >
                  Latest score: <strong>{person.latestResult.score}</strong>
                </Link>
              ) : (
                <p className="mt-4 text-sm text-foreground/55">No assessment yet.</p>
              )}
              <Link
                href={`/quiz?person=${person.id}&name=${encodeURIComponent(person.name)}`}
                className="mt-4 inline-block text-sm font-bold text-accent underline underline-offset-2"
              >
                Take an assessment for {person.isSelf ? 'yourself' : person.name}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-white">Groups</h2>
        {groups.length === 0 ? (
          <div className="glass-card mt-4 p-6 text-foreground/65">
            Create a family, friend group, or team to see its combined personality
            profile.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {groups.map((group) => (
              <article key={group.id} className="glass-card-interactive p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-foreground/45">
                      {group.kind}
                    </p>
                    <h3 className="mt-1 text-xl font-bold">{group.name}</h3>
                    <p className="mt-1 text-sm text-foreground/55">
                      {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (window.confirm(`Remove the group “${group.name}”?`)) {
                        run(() => deleteGroup(group.id))
                      }
                    }}
                    className="text-xs font-semibold text-red-700/70 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <Link
                  href={`/my-relationships/groups/${group.id}`}
                  className="mt-5 inline-block text-sm font-bold text-accent underline underline-offset-2"
                >
                  View group profile
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={personOpen}
        onClose={() => !pending && setPersonOpen(false)}
        title="Add a person"
      >
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            run(
              () => createPerson({ name: personName, email: personEmail }),
              () => {
                setPersonName('')
                setPersonEmail('')
                setPersonOpen(false)
              }
            )
          }}
        >
          <div>
            <label htmlFor="person-name" className="mb-1 block text-sm font-semibold">
              Name
            </label>
            <input
              id="person-name"
              required
              value={personName}
              onChange={(event) => setPersonName(event.target.value)}
              className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="person-email" className="mb-1 block text-sm font-semibold">
              Email <span className="font-normal text-foreground/50">(optional)</span>
            </label>
            <input
              id="person-email"
              type="email"
              value={personEmail}
              onChange={(event) => setPersonEmail(event.target.value)}
              className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-accent px-5 py-3 font-bold text-white disabled:opacity-60"
          >
            {pending ? 'Adding…' : 'Add person'}
          </button>
        </form>
      </Modal>

      <Modal
        open={groupOpen}
        onClose={() => !pending && setGroupOpen(false)}
        title="Add a group"
      >
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            run(
              () =>
                createGroup({
                  name: groupName,
                  kind: groupKind,
                  memberIds,
                }),
              () => {
                setGroupName('')
                setGroupKind('family')
                setMemberIds([])
                setGroupOpen(false)
              }
            )
          }}
        >
          <div>
            <label htmlFor="group-name" className="mb-1 block text-sm font-semibold">
              Group name
            </label>
            <input
              id="group-name"
              required
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="group-kind" className="mb-1 block text-sm font-semibold">
              Type
            </label>
            <select
              id="group-kind"
              value={groupKind}
              onChange={(event) => setGroupKind(event.target.value)}
              className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-accent"
            >
              <option value="family">Family</option>
              <option value="friend">Friends</option>
              <option value="team">Team</option>
              <option value="other">Other</option>
            </select>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Members</legend>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl bg-black/[0.03] p-3">
              {people.map((person) => (
                <label key={person.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={memberIds.includes(person.id)}
                    onChange={() =>
                      setMemberIds((current) =>
                        current.includes(person.id)
                          ? current.filter((id) => id !== person.id)
                          : [...current, person.id]
                      )
                    }
                  />
                  {person.name} {person.isSelf ? '(You)' : ''}
                </label>
              ))}
            </div>
          </fieldset>
          <button
            type="submit"
            disabled={pending || memberIds.length === 0}
            className="w-full rounded-xl bg-accent px-5 py-3 font-bold text-white disabled:opacity-60"
          >
            {pending ? 'Creating…' : 'Create group'}
          </button>
        </form>
      </Modal>
    </>
  )
}
