import { getVersion } from '@/lib/versions'

const version = getVersion('v1')!

export default function V1Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed top-[57px] inset-x-0 z-40 bg-amber-500/90 backdrop-blur-sm text-black text-center text-xs font-semibold py-1.5 tracking-wide">
        Viewing snapshot: {version.name} ({version.slug}) — {version.date}
      </div>
      <div className="pt-8">
        {children}
      </div>
    </>
  )
}
