"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Monitor, Volume2, VolumeX, LogOut, Eye } from 'lucide-react';
import { signIn, signOut, useSession } from "next-auth/react";
import MatrixRain from '@/components/MatrixRain';

interface Stream {
  uniqueId: string;
  videoId: string;
  title?: string;
  viewCount?: string;
  lastUpdated?: number; 
}

export default function LiveMatrix() {
  const { data: session } = useSession();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [input, setInput] = useState('');
  // ভিউ কাউন্ট বাড়ানোর জন্য ডিফল্ট মিউট False রাখা ভালো, তবে ব্রাউজার পলিসির কারণে অটো-প্লেতে মিউট লাগে।
  const [isMuted, setIsMuted] = useState(false); 

  // লোকাল স্টোরেজ থেকে ডাটা লোড
  useEffect(() => {
    const saved = localStorage.getItem('_streams_v5');
    if (saved) {
      try {
        setStreams(JSON.parse(saved));
      } catch (e) {
        console.error("Storage parse error", e);
      }
    }
  }, []);

  // API থেকে ভিডিও ডাটা আনা
  const fetchVideoData = async (videoId: string) => {
    try {
      const res = await fetch('/api/youtube', {
        method: 'POST',
        body: JSON.stringify({ videoId }),
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store' // ক্যাশ বন্ধ রাখা হলো
      });
      if (!res.ok) throw new Error("API Error");
      return await res.json();
    } catch (error) {
      console.error("Fetch error:", error);
      return { title: "Error Loading", viewCount: "0" };
    }
  };

  // সব ভিডিওর ভিউ আপডেট করার লজিক
  const refreshAllViews = useCallback(async () => {
    if (streams.length === 0) return;

    const updatedStreams = await Promise.all(streams.map(async (stream) => {
      const newData = await fetchVideoData(stream.videoId);
      if (newData) {
        return { 
          ...stream, 
          viewCount: newData.viewCount || stream.viewCount, 
          title: newData.title || stream.title,
          lastUpdated: Date.now() 
        };
      }
      return stream;
    }));

    setStreams(updatedStreams);
    localStorage.setItem('_streams_v5', JSON.stringify(updatedStreams));
  }, [streams]);

  // ১০ মিনিটের অটো-রিফ্রেশ (API Quota বাঁচানোর জন্য সময় বাড়ানো হয়েছে)
  useEffect(() => {
    const interval = setInterval(refreshAllViews, 10 * 60 * 1000); 
    return () => clearInterval(interval);
  }, [refreshAllViews]);

  const addStream = async () => {
    let url = input.trim();
    if (!url) return;

    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);

    if (match && match[1]) {
      const id = match[1];
      const videoData = await fetchVideoData(id);
      
      const newStream: Stream = {
        uniqueId: id + '-' + Date.now(),
        videoId: id,
        title: videoData?.title || 'Loading...',
        viewCount: videoData?.viewCount || '0',
        lastUpdated: Date.now()
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
    <div className="relative min-h-screen bg-[#050505] text-zinc-200 font-sans overflow-x-hidden">
      <MatrixRain />

      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-md border-b border-zinc-800 p-4 shadow-2xl">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row gap-6 items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <Monitor size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Matrix-View</h1>
          </div>

          <div className="flex-1 flex gap-2 w-full max-w-xl">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addStream()}
              placeholder="Paste YouTube Link or Shorts..."
              className="w-full bg-zinc-900/50 border border-zinc-800 px-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-sm backdrop-blur-sm"
            />
            <button onClick={addStream} className="bg-blue-600 hover:bg-blue-500 px-6 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg">
              <Plus size={18} /> <span>ADD</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${isMuted ? 'bg-zinc-800 text-zinc-400' : 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]'}`}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <span className="text-xs uppercase">{isMuted ? 'Muted' : 'Live Audio'}</span>
            </button>
            
            {!session ? (
              <button onClick={() => signIn('google')} className="bg-white text-black px-4 py-2 rounded-lg font-bold text-xs uppercase hover:bg-zinc-200 transition-colors">
                Login
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-zinc-900/50 p-1 pr-3 rounded-full border border-zinc-800 backdrop-blur-md">
                {session.user?.image && (
                  <img 
                    src={session.user.image} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full border border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                  />
                )}
                <span className="text-[10px] font-bold uppercase hidden sm:block tracking-widest text-zinc-300">
                  {session.user?.name?.split(' ')[0]}
                </span>
                <button onClick={() => signOut()} className="text-zinc-500 hover:text-red-500 transition-colors ml-1">
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {streams.map((stream) => {
          const isHighViews = Number(stream.viewCount) >= 1000;
          const isUpdating = stream.lastUpdated && (Date.now() - stream.lastUpdated < 15000);
          const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
          
          // ভিউ বাড়াতে সাহায্য করবে এমন প্যারামিটার যুক্ত করা হয়েছে
          const embedUrl = `https://www.youtube.com/embed/${stream.videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&enablejsapi=1&rel=0&modestbranding=1&controls=1&showinfo=0&origin=${originUrl}`;

          return (
            <div 
              key={stream.uniqueId} 
              className={`group relative bg-zinc-900/80 backdrop-blur-sm rounded-xl overflow-hidden border-2 transition-all duration-700 ${
                isUpdating 
                  ? 'border-green-500 scale-105 z-10 shadow-[0_0_25px_rgba(34,197,94,0.6)]' 
                  : isHighViews 
                  ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                  : 'border-zinc-800 hover:border-blue-500/50'
              }`}
            >
              <div className="aspect-video relative bg-black">
                <iframe
                  src={embedUrl}
                  className="w-full h-full border-0"
                  allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
                <button 
                  onClick={() => removeStream(stream.uniqueId)} 
                  className="absolute top-2 right-2 p-1.5 bg-red-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              <div className={`p-2 transition-colors ${isUpdating ? 'bg-green-500/10' : isHighViews ? 'bg-yellow-500/10' : 'bg-black/60'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Eye size={12} className={isUpdating ? 'text-green-400' : isHighViews ? 'text-yellow-500' : 'text-blue-400'} />
                    <span className={`text-[11px] font-bold font-mono ${isUpdating ? 'text-green-400' : isHighViews ? 'text-yellow-500' : 'text-blue-400'}`}>
                      {(Number(stream.viewCount) || 0).toLocaleString()} Views
                    </span>
                  </div>
                  {isUpdating && <span className="text-[9px] text-green-500 font-black animate-pulse">LIVE UPDATE</span>}
                </div>
                <h3 className={`text-[10px] truncate mt-1 uppercase font-medium ${isHighViews ? 'text-yellow-200/70' : 'text-zinc-500'}`}>
                  {stream.title}
                </h3>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}