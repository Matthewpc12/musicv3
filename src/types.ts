export interface Song {
  filename: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  cover?: string; // base64
  lyrics?: string; // LRC format
  videoUrl?: string;
  isAnimated?: boolean;
  animatedCoverUrl?: string;
  customCoverUrl?: string;
}

export interface DownloadStatus {
  status: 'downloading' | 'done' | 'error';
  task?: string;
}

export interface Registries {
  albums: Record<string, string[]>;
  animatedCovers: Record<string, string>;
  customCovers: Record<string, string>;
  customMetadata: Record<string, Partial<Song>>;
  lyrics: Record<string, string>;
  videos: Record<string, string>;
}
