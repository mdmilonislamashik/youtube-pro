"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Monitor, LayoutPanelLeft, Volume2, VolumeX } from 'lucide-react';

export default function LiveMatrix() {
  const [streams, setStreams] = useState<{uniqueId: string, videoId: string}[]>([]);
  const [input, setInput] = useState('');
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('_streams_v5');
    if (saved) setStreams(JSON.parse(saved));
  }, []);

  const addStream = () => {
    let id = input.trim();
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
      localStorage.setItem('_streams_v5', JSON.stringify(updated));
    }
  };

  const removeStream = (uniqueId: string) => {
    const updated = streams.filter(s => s.uniqueId !== uniqueId);
    setStreams(updated);
    localStorage.setItem('_streams_v5', JSON.stringify(updated));
  };

  const toggleMasterMute = () => {
    setIsMuted(!isMuted);
    // সাউন্ড পরিবর্তন করলে আইফ্রেমগুলো রিলোড হবে নতুন প্যারামিটার সহ
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4 shadow-2xl">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row gap-6 items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
              <Monitor size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Matrix-View</h1>
              <span className="text-[10px] text-zinc-500 font-mono">ACTIVE: {streams.length}</span>
            </div>
          </div>

          <div className="flex-1 flex gap-2 w-full max-w-2xl">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addStream()}
              placeholder="Paste YouTube/Shorts link..."
              className="w-full bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
            />
            <button 
              onClick={addStream}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus size={18} /> <span>ADD</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* সাউন্ড কন্ট্রোল বাটন */}
            <button 
              onClick={toggleMasterMute}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${isMuted ? 'bg-zinc-800 text-zinc-400' : 'bg-green-600 text-white shadow-lg shadow-green-900/20'}`}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <span className="text-xs uppercase">{isMuted ? 'Unmute All' : 'Muted All'}</span>
            </button>

            <button 
              onClick={() => {if(confirm('Clear all?')) { setStreams([]); localStorage.removeItem('_streams_v5'); }}}
              className="text-zinc-500 hover:text-red-500 text-xs font-mono uppercase transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="p-2 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5">
        {streams.map((stream) => (
          <div key={stream.uniqueId} className="group relative aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-blue-500/50 transition-all shadow-xl shadow-black">
            <iframe
              // mute=${isMuted ? 1 : 0} অংশটি সাউন্ড কন্ট্রোল করছে
              src={`https://www.youtube.com/embed/${stream.videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${stream.videoId}&modestbranding=1&rel=0`}
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
      </main>
    </div>
  );
}