/**
 * Search YouTube for relevant videos and return the video ID
 */
export async function searchYouTubeVideos(query: string): Promise<string | undefined> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY;
    
    if (!apiKey) {
      console.warn("YouTube API key is missing");
      return undefined;
    }
    
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodedQuery}&type=video&maxResults=1&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`YouTube API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items[0].id.videoId;
    }
    
    return undefined;
  } catch (error) {
    console.error("YouTube API Error:", error);
    return undefined;
  }
}
