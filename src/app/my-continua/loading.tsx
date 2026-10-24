// Shown immediately when someone opens My Continua, while the server loads
// their account and results, so the click visibly does something.
export default function MyInfoLoading() {
  return (
    <main className="mx-auto max-w-[960px] px-6 py-16" aria-busy="true">
      <h1 className="text-4xl font-bold text-white md:text-5xl">My Continua</h1>
      <p className="mt-3 max-w-2xl text-lg text-white/80">
        Return to the personality snapshots you’ve taken over time.
      </p>
      <div className="glass-card mt-8 flex items-center gap-3 p-6" role="status">
        <span
          className="h-5 w-5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground/70"
          aria-hidden="true"
        />
        <span className="text-foreground/70">Loading your results…</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2" aria-hidden="true">
        <div className="glass-card h-56 animate-pulse" />
        <div className="glass-card h-56 animate-pulse" />
      </div>
    </main>
  )
}
