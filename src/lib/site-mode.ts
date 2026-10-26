// Switches for features that are built but not yet announced.
//
// The podcast-launch switches (LAUNCH_LITE, SHOW_ASSESSMENT, SHOW_ACCOUNT,
// SHOW_RELATIONSHIPS) were folded into the code in the October 2026 cleanup:
// the assessment and accounts are simply on, and My Relationships was removed.

// Comparing results with people you know (invite by email; both must accept).
// While off, the buttons that lead there are hidden, but /compare/people and
// invitation links still work for anyone signed in, so it can be tried
// privately (for example, with family) before it is announced.
export const SHOW_PEOPLE_COMPARISON = true
