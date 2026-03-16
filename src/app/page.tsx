"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Monitor, Grid, LayoutPanelLeft } from 'lucide-react';

export default function LiveMatrix() {
  const [streams, setStreams] = useState<string[]>([]);
  const [input, setInput] = useState('');

  // LocalStorage থেকে ভিডিও লোড করা
  useEffect(() => {
    const saved = localStorage.getItem('_streams_v2');
    if (saved) setStreams(JSON.parse(saved));
  }, []);

  const addStream = () => {
    let id = input.trim();
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = id.match(regex);
    if (match) id = match[1];

    if (id.length === 11 && !streams.includes(id)) {
      const updated = [id, ...streams];
      setStreams(updated);
      localStorage.setItem('_streams_v2', JSON.stringify(updated));
      setInput('');
    }
  };

  const removeStream = (id: string) => {
    const updated = streams.filter(s => s !== id);
    setStreams(updated);
    localStorage.setItem('_streams_v2', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200">
      {/* কন্ট্রোল প্যানেল */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4 shadow-2xl">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row gap-6 items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/40">
              <Monitor size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Matrix-View</h1>
              <span className="text-[10px] text-zinc-500 font-mono">STREAMS_ACTIVE: {streams.length}</span>
            </div>
          </div>

          <div className="flex-1 flex gap-2 w-full max-w-3xl">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addStream()}
              placeholder="Paste YouTube Link or Video ID..."
              className="w-full bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-zinc-600 text-sm"
            />
            <button 
              onClick={addStream}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
            >
              <Plus size={18} /> <span className="hidden sm:inline">DEPLOY</span>
            </button>
          </div>

          <button 
            onClick={() => {if(confirm('Clear all?')) setStreams([]); localStorage.clear();}}
            className="text-zinc-500 hover:text-red-500 text-xs font-mono uppercase tracking-widest transition-colors"
          >
            Reset_System
          </button>
        </div>
      </header>

      {/* ভিডিও ম্যাট্রিক্স */}
      <main className="p-2 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5">
        {streams.map((id) => (
          <div key={id} className="group relative aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-blue-500/50 transition-all shadow-xl shadow-black">
            <iframe
              src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&modestbranding=1&rel=0&iv_load_policy=3`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <button 
              onClick={() => removeStream(id)}
              className="absolute top-2 right-2 p-1.5 bg-red-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 shadow-lg"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {streams.length === 0 && (
          <div className="col-span-full h-[60vh] flex flex-col items-center justify-center text-zinc-600">
            <LayoutPanelLeft size={64} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="font-mono text-sm uppercase tracking-[0.2em]">System Idle - Awaiting Stream Input</p>
          </div>
        )}
      </main>
    </div>
  );
}