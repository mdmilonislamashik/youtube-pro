import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) return NextResponse.json({ title: 'Invalid Link', viewCount: '0' });

    const apiKey = process.env.YOUTUBE_API_KEY;
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;
    
    const res = await fetch(apiUrl, {
      headers: {
        // আপনার গুগল কনসোলের ডোমেইনের সাথে এটি এখন হুবহু মিলবে
        'Referer': 'https://mdmilonislamashik-youtube-pro.vercel.app/',
      }
    });
    
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      return NextResponse.json({
        title: data.items[0].snippet.title,
        viewCount: data.items[0].statistics.viewCount,
      });
    }

    return NextResponse.json({ title: 'Video Private/Not Found', viewCount: '0' });
  } catch (error) {
    return NextResponse.json({ title: 'Server Error', viewCount: '0' });
  }
}