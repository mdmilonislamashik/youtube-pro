import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    // ইউটিউব লিঙ্ক থেকে আইডি বের করার লজিক
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^?&"'>]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Vercel-এ YOUTUBE_API_KEY নামে এটি সেভ করতে হবে
    const apiKey = process.env.YOUTUBE_API_KEY; 
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;

    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const video = data.items[0];
    return NextResponse.json({
      id: videoId,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.high.url,
      viewCount: video.statistics.viewCount, // ভিউ কাউন্ট ডাটা
      likeCount: video.statistics.likeCount,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}