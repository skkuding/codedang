export type MediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REELS' | 'STORY'

export interface Post {
  id: string
  caption: string
  media_url: string
  permalink: string
  timestamp: string
  media_type: MediaType
}

export interface Paging {
  cursors: {
    before: string
    after: string
  }
}

export interface InstagramApiResponse {
  data: Post[]
  paging: Paging
}
