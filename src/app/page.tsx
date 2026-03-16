"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Monitor, LayoutPanelLeft } from 'lucide-react';

export default function LiveMatrix() {
  const [streams, setStreams] = useState<{uniqueId: string, videoId: string}[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('_streams_v4');
    if (saved) setStreams(JSON.parse(saved));
  }, []);

  const addStream = () => {
    let id = input.trim();
    // YouTube URL/Shorts থেকে ID বের করার উন্নত রেজেক্স
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = id.match(regex);
    if (match) id = match[1];

    if (id.length === 11) {
      const newStream = {
        uniqueId: id + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        videoId: id
      };
      
      const updated = [newStream, ...streams];
      setStreams(updated);
      localStorage.setItem('_streams_v4', JSON.stringify(updated));
      // ইনপুট বক্স খালি করছি না যাতে আপনি চাইলে আবার সাথে সাথে ক্লিক করে আরেকটা যোগ করতে পারেন
    }
  };

  const removeStream = (uniqueId: string) => {
    const updated = streams.filter(s => s.uniqueId !== uniqueId);
    setStreams(updated);
    localStorage.setItem('_streams_v4', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4 shadow-2xl">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row gap-6 items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/40">
              <Monitor size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Matrix-View</h1>
              <span className="text-[10px] text-zinc-500 font-mono">ACTIVE: {streams.length}</span>
            </div>
          </div>

          <div className="flex-1 flex gap-2 w-full max-w-3xl">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addStream()}
              placeholder="Paste YouTube/Shorts link here..."
              className="w-full bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm"
            />
            <button 
              onClick={addStream}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
            >
              <Plus size={18} /> <span>ADD VIDEO</span>
            </button>
          </div>

          <button 
            onClick={() => {if(confirm('Clear all?')) { setStreams([]); localStorage.removeItem('_streams_v4'); }}}
            className="text-zinc-500 hover:text-red-500 text-xs font-mono uppercase transition-colors"
          >
            Reset_System
          </button>
        </div>
      </header>

      <main className="p-2 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5">
        {streams.map((stream) => (
          <div key={stream.uniqueId} className="group relative aspect-[9/16] sm:aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-blue-500/50 transition-all shadow-xl shadow-black">
            <iframe
              // autoplay=1 (অটো প্লে), mute=1 (মিউট না করলে অটো প্লে হবে না), loop=1 (বারবার চলবে), playlist=ID (লুপের জন্য দরকারি)
              src={`https://www.youtube.com/embed/${stream.videoId}?autoplay=1&mute=1&loop=1&playlist=${stream.videoId}&modestbranding=1&rel=0`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
            <button 
              onClick={() => removeStream(stream.uniqueId)}
              className="absolute top-2 right-2 p-1.5 bg-red-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {streams.length === 0 && (
          <div className="col-span-full h-[60vh] flex flex-col items-center justify-center text-zinc-600">
            <LayoutPanelLeft size={64} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="font-mono text-sm uppercase tracking-[0.2em]">Ready for Action</p>
          </div>
        )}
      </main>
    </div>
  );
}