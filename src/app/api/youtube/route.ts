import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Frontend থেকে link (url) বা সরাসরি videoId - যেকোনোটা আসলে কাজ করবে
    let videoId = body.videoId;

    if (body.url) {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = body.url.match(regex);
      if (match) videoId = match[1];
    }

    if (!videoId) {
      return NextResponse.json({ title: 'Invalid Video ID/Link', viewCount: '0' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    
    // API Key না থাকলে error handle করা
    if (!apiKey) {
      console.error("YOUTUBE_API_KEY is missing in environment variables!");
      return NextResponse.json({ title: 'API Key Missing', viewCount: '0' });
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;
    
    // cache: 'no-store' ব্যবহার করা হয়েছে যাতে সবসময় লেটেস্ট ডাটা আসে
    const res = await fetch(apiUrl, {
      headers: {
        'Referer': 'https://mdmilonislamashik-youtube-pro.vercel.app/',
      },
      cache: 'no-store' 
    });
    
    const data = await res.json();

    // Data ঠিকমতো আসলে return করবে
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return NextResponse.json({
        title: video.snippet.title,
        viewCount: video.statistics.viewCount || '0',
      });
    }

    // API error handle করা (যেমন quota শেষ হয়ে গেলে)
    if (data.error) {
      console.error('YouTube API Error:', data.error.message);
      return NextResponse.json({ title: 'API Error/Limit', viewCount: '0' });
    }

    return NextResponse.json({ title: 'Video Private/Not Found', viewCount: '0' });

  } catch (error) {
    console.error('Final Route Error:', error);
    return NextResponse.json({ title: 'System Error', viewCount: '0' });
  }
}