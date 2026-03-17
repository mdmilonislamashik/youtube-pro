import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    // ইউটিউব আইডি বের করার জন্য সবচেয়ে শক্তিশালী Regex
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      return NextResponse.json({ title: 'Invalid Link', viewCount: '0' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    
    // snippet এবং statistics দুইটাই কল করা হচ্ছে
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;
    
    const res = await fetch(apiUrl, {
      headers: {
        // আপনার গুগল কনসোলে দেওয়া ডোমেইনটির সাথে হুবহু মিল থাকতে হবে
        'Referer': 'https://mdmilonislamashik-youtube-pro.vercel.app/',
      },
      // revalidate: 0 মানে হলো প্রতিবার তাজা ডাটা আসবে (ক্যাশ হবে না)
      next: { revalidate: 0 } 
    });
    
    const data = await res.json();

    // ডাটা সাকসেসফুলি আসলে
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return NextResponse.json({
        title: video.snippet.title,
        viewCount: video.statistics.viewCount || '0',
      });
    }

    // যদি এপিআই কোনো এরর দেয় তবে সার্ভার কনসোলে দেখাবে
    if (data.error) {
      console.error('YouTube API Backend Error:', data.error.message);
    }

    return NextResponse.json({ title: 'Video Not Found/Private', viewCount: '0' });

  } catch (error) {
    console.error('Final Route Error:', error);
    return NextResponse.json({ title: 'System Error', viewCount: '0' });
  }
}