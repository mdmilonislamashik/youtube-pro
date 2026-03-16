"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Monitor, LayoutPanelLeft, Volume2, VolumeX, LogIn, LogOut } from 'lucide-react';
import { signIn, signOut, useSession } from "next-auth/react";

export default function LiveMatrix() {
  const { data: session } = useSession();
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

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4 shadow-2xl">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row gap-6 items-center">
          
          {/* লোগো ও ইউজার ইনফো */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
              <Monitor size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Matrix-View</h1>
              <div className="flex items-center gap-2 mt-1">
                {session ? (
                  <span className="text-[10px] text-green-500 font-mono uppercase">Online: {session.user?.name}</span>
                ) : (
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">System Offline</span>
                )}
              </div>
            </div>
          </div>

          {/* ইনপুট সেকশন */}
          <div className="flex-1 flex gap-2 w-full max-w-xl">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addStream()}
              placeholder="Paste YouTube Link..."
              className="w-full bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
            />
            <button 
              onClick={addStream}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
            >
              <Plus size={18} /> <span>ADD</span>
            </button>
          </div>

          {/* কন্ট্রোল বাটনসমূহ */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${isMuted ? 'bg-zinc-800 text-zinc-400' : 'bg-green-600 text-white shadow-lg shadow-green-900/20'}`}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <span className="text-xs uppercase">{isMuted ? 'Unmute' : 'Muted'}</span>
            </button>

            {/* গুগল লগইন/লগআউট বাটন */}
            {!session ? (
              <button 
                onClick={() => signIn('google')}
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-zinc-200 transition-all text-xs uppercase"
              >
                <LogIn size={16} /> Login
              </button>
            ) : (
              <div className="flex items-center gap-3 pl-3 border-l border-zinc-800">
                {session.user?.image && (
                  <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full border border-zinc-700" />
                )}
                <button 
                  onClick={() => signOut()}
                  className="text-zinc-500 hover:text-red-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ভিডিও গ্রিড */}
      <main className="p-2 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5">
        {streams.map((stream) => (
          <div key={stream.uniqueId} className="group relative aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-blue-500/50 transition-all shadow-xl shadow-black">
            <iframe
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