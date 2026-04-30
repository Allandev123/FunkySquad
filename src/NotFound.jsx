import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-10rem)] flex-col items-center justify-center bg-[#0b0b0b] px-4 py-16 text-center text-zinc-200">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Error</p>
      <h1 className="mt-3 text-6xl font-bold text-white sm:text-7xl">404</h1>
      <p className="mt-4 max-w-md text-sm text-zinc-400 sm:text-base">
        This page doesn&apos;t exist or was moved.
      </p>
      <Link
        to="/"
        className="mt-10 inline-flex rounded-full bg-[#ff8c00] px-8 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
      >
        Go Home
      </Link>
    </div>
  )
}
