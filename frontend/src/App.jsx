import { Layers } from 'lucide-react'

export default function App() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-6">
      <div className="max-w-md w-full bg-slate-800/80 border border-slate-700/60 rounded-2xl p-8 shadow-2xl backdrop-blur-sm text-center">
        <div className="inline-flex p-3 rounded-xl bg-indigo-500/10 text-indigo-400 mb-4 ring-1 ring-indigo-500/20">
          <Layers className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
          Homesphere Frontend
        </h1>
        <p className="text-sm text-slate-400">
          Vite + React + Tailwind CSS setup is ready.
        </p>
      </div>
    </main>
  )
}
