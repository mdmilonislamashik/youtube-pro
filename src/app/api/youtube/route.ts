import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Frontend theke link (url) ba shorasori videoId - jekonota asle eita kaj korbe
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
    
    // API Key na thakle error handle kora
    if (!apiKey) {
      console.error("YOUTUBE_API_KEY is missing in environment variables!");
      return NextResponse.json({ title: 'API Key Missing', viewCount: '0' });
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;
    
    const res = await fetch(apiUrl, {
      headers: {
        // Vercel domain-er sathe mil rekhe Referer set kora
        'Referer': 'https://mdmilonislamashik-youtube-pro.vercel.app/',
      },
      next: { revalidate: 0 } // Cache bondho rakhar jonno
    });
    
    const data = await res.json();

    // Data thikmoto asle return korbe
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return NextResponse.json({
        title: video.snippet.title,
        viewCount: video.statistics.viewCount || '0',
      });
    }

    // API error handle kora (jemon quota sesh hoye gele)
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