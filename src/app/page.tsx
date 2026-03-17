"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Monitor, Volume2, VolumeX, LogIn, LogOut, Eye } from 'lucide-react';
import { signIn, signOut, useSession } from "next-auth/react";

// ভিডিও স্ট্রীমের টাইপ ডিফাইন করা
interface Stream {
  uniqueId: string;
  videoId: string;
  title?: string;
  viewCount?: string;
}

export default function LiveMatrix() {
  const { data: session } = useSession();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [input, setInput] = useState('');
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('_streams_v5');
    if (saved) setStreams(JSON.parse(saved));
  }, []);

  // ভিডিওর ডিটেইলস (ভিউ কাউন্ট) আনার ফাংশন
  const fetchVideoData = async (url: string) => {
    try {
      const res = await fetch('/api/youtube', {
        method: 'POST',
        body: JSON.stringify({ url }),
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch (error) {
      console.error("Error fetching views:", error);
      return null;
    }
  };

  const addStream = async () => {
    let url = input.trim();
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    
    if (match) {
      const id = match[1];
      // এপিআই থেকে ডাটা আনা
      const videoData = await fetchVideoData(url);

      const newStream: Stream = {
        uniqueId: id + '-' + Date.now(),
        videoId: id,
        title: videoData?.title || 'YouTube Video',
        viewCount: videoData?.viewCount || '0'
      };

      const updated = [newStream, ...streams];
      setStreams(updated);
      localStorage.setItem('_streams_v5', JSON.stringify(updated));
      setInput('');
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
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
              <Monitor size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Matrix-View</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-green-500 font-mono uppercase">
                  {session ? `Online: ${session.user?.name}` : 'System Offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex gap-2 w-full max-w-xl">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addStream()}
              placeholder="Paste YouTube Link or Shorts..."
              className="w-full bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl focus:outline-none text-sm"
            />
            <button onClick={addStream} className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all">
              <Plus size={18} /> <span>ADD</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${isMuted ? 'bg-zinc-800 text-zinc-400' : 'bg-green-600 text-white'}`}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <span className="text-xs uppercase">{isMuted ? 'Unmute' : 'Muted'}</span>
            </button>

            {!session ? (
              <button onClick={() => signIn('google')} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold text-xs uppercase">
                <LogIn size={16} /> Login
              </button>
            ) : (
              <div className="flex items-center gap-3 pl-3 border-l border-zinc-800">
                {session.user?.image && <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full border border-zinc-700" />}
                <button onClick={() => signOut()} className="text-zinc-500 hover:text-red-500"><LogOut size={18} /></button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {streams.map((stream) => (
          <div key={stream.uniqueId} className="group relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-blue-500/50 transition-all">
            <div className="aspect-video relative">
              <iframe
                src={`https://www.youtube.com/embed/${stream.videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&modestbranding=1&rel=0`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
              <button 
                onClick={() => removeStream(stream.uniqueId)}
                className="absolute top-2 right-2 p-1.5 bg-red-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
            
            {/* ভিউ কাউন্ট সেকশন - যা আপনি চেয়েছিলেন */}
            <div className="p-2 bg-black/40 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-blue-400">
                  <Eye size={12} />
                  <span className="text-[11px] font-bold font-mono">
                    {Number(stream.viewCount).toLocaleString()} Views
                  </span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="Live Tracking" />
              </div>
              <h3 className="text-[10px] text-zinc-500 truncate mt-1 uppercase font-medium">{stream.title}</h3>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}