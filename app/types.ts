export interface AudioTrack {
  codec: string
  language?: string
  channels?: number
}

export interface SubtitleTrack {
  codec: string
  language?: string
}

export interface MediaFile {
  name: string
  path: string
  size: number
  sizeGB: number
  format: string
  duration: number
  audioTracks: AudioTrack[]
  subtitleTracks: SubtitleTrack[]
}
