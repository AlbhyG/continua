// Podcast launch: show About, the first-chapter request, the individual
// assessment (with saved results), and sign-in. Relationships and the orb
// generator stay hidden. Set to false to restore everything.
export const LAUNCH_LITE = true

// Turned back on during podcast launch so listeners can take the
// assessment and sign in to keep their results.
export const SHOW_ASSESSMENT = true
export const SHOW_ACCOUNT = true

// Turns on My Relationships (add people, groups, compare members) without
// turning off LAUNCH_LITE. While off, the menu link is hidden and the pages,
// actions, and assess-another-person flow are blocked. Off until legal
// review: users enter assessments about other people, who have not consented.
export const SHOW_RELATIONSHIPS = false

// True when the relationships pages and the assess-someone-else flow are usable.
export const RELATIONSHIPS_ENABLED = !LAUNCH_LITE || SHOW_RELATIONSHIPS
