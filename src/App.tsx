import { useState } from 'react'

export default function App() {
  const [stats, setStats] = useState({
    carName: "McLaren GT3 Evo",
    trackName: "Spa-Francorchamps",
    sessionType: "Practice",
    currentOdometer: 1240.5,
    sessionLaps: 14,
    challengeProgress: 64,
  })

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white font-sans p-4 flex flex-col justify-between">

      {/* NAGŁÓWEK */}
      <header className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Live Connection</span>
        </div>
        <div className="text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded font-mono">
          v1.0.0-beta
        </div>
      </header>

      {/* GŁÓWNY PANEL */}
      <main className="my-auto py-6 flex flex-col gap-5">

        {/* LICZNIK */}
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-1">Total Distance</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent font-mono">
              {stats.currentOdometer.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-pink-500 uppercase tracking-wider">KM</span>
          </div>
        </div>

        {/* INFO O SESJI */}
        <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">Active Car</p>
              <h2 className="text-sm font-bold text-zinc-200 mt-0.5">{stats.carName}</h2>
            </div>
            <span className="text-[10px] bg-pink-500/10 text-pink-400 font-bold border border-pink-500/20 px-2 py-0.5 rounded-full">
              {stats.sessionType}
            </span>
          </div>

          <div className="border-t border-zinc-800/50 pt-2.5">
            <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">Location</p>
            <p className="text-xs font-medium text-zinc-300 mt-0.5">{stats.trackName}</p>
          </div>
        </div>

        {/* PROGRES CHALLENGE */}
        <div className="bg-zinc-900/20 border border-zinc-800/60 p-3 rounded-lg">
          <div className="flex justify-between text-[10px] font-semibold mb-1.5">
            <span className="text-zinc-400">1000 Laps Challenge</span>
            <span className="text-pink-500 font-bold">{stats.challengeProgress}%</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-pink-600 to-pink-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${stats.challengeProgress}%` }}
            ></div>
          </div>
        </div>

      </main>

      {/* STOPKA */}
      <footer className="text-center text-[9px] text-zinc-600 border-t border-zinc-900/50 pt-3">
        Kukasz Crew • Designed for iRacing
      </footer>

    </div>
  )
}