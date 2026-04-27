import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    
    // Basic regex extraction for Open Graph tags
    const getMetaTag = (property: string) => {
      const regex = new RegExp(`<meta(?:\\s+[^>]*?)?(?:property|name)=["']${property}["'][^>]*?content=["']([^"']*)["']`, 'i');
      const match = html.match(regex);
      if (match) return match[1];
      
      // Try reversed attribute order
      const regexReversed = new RegExp(`<meta(?:\\s+[^>]*?)?content=["']([^"']*)["'][^>]*?(?:property|name)=["']${property}["']`, 'i');
      const matchReversed = html.match(regexReversed);
      return matchReversed ? matchReversed[1] : null;
    };

    // Also look for title tag if og:title is missing
    const getTitleTag = () => {
      const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return match ? match[1] : null;
    };

    const title = getMetaTag('og:title') || getMetaTag('twitter:title') || getTitleTag() || '';
    const description = getMetaTag('og:description') || getMetaTag('twitter:description') || getMetaTag('description') || '';
    const image = getMetaTag('og:image') || getMetaTag('twitter:image') || '';
    const domain = new URL(url).hostname;

    return NextResponse.json({
      title,
      description,
      image,
      domain,
      url
    });

  } catch (error: any) {
    console.error('Link preview error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch link preview' }, { status: 500 });
  }
}
