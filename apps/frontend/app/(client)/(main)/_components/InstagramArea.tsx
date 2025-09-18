import { fetchInstagramMedia } from '@/libs/instagram'
import { InstagramCards } from './InstagramCards'

export async function HomePage() {
  let mediaData
  try {
    mediaData = await fetchInstagramMedia()
  } catch (error) {
    return <div>Failed to load Instagram media.</div>
  }

  if (!mediaData || !mediaData.data || mediaData.data.length === 0) {
    return <div>No Instagram media found.</div>
  }
  console.log('Fetched Instagram media data:', mediaData)
  return <InstagramCards />
}
