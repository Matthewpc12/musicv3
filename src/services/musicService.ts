import { SERVER_URL } from '../constants';
import { Song, DownloadStatus, Registries } from '../types';

export const musicService = {
  async getAllMetadata(): Promise<Song[]> {
    const response = await fetch(`${SERVER_URL}/api/all-metadata`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'application/json',
      }
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json();
  },

  async getSongMetadata(filename: string): Promise<Song> {
    const response = await fetch(`${SERVER_URL}/api/metadata/${encodeURIComponent(filename)}`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'application/json',
      }
    });
    if (!response.ok) throw new Error(`Metadata error: ${response.status}`);
    return response.json();
  },

  getAudioUrl(filename: string): string {
    return `${SERVER_URL}/music/${encodeURIComponent(filename)}`;
  },

  async uploadFile(file: File): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${SERVER_URL}/upload`, {
      method: "POST",
      body: formData
    });
    if (!response.ok) throw new Error('Upload failed');
  },

  async downloadFromYoutube(url: string): Promise<{ status: string; task: string }> {
    const response = await fetch(`${SERVER_URL}/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    if (!response.ok) throw new Error('Download request failed');
    return response.json();
  },

  async getDownloadStatus(taskId: string): Promise<DownloadStatus> {
    const response = await fetch(`${SERVER_URL}/api/download-status/${taskId}`);
    if (!response.ok) throw new Error('Status check failed');
    return response.json();
  },

  async getRegistries(): Promise<Registries> {
    const files = [
      'albums.json',
      'animated_covers.json',
      'custom_covers.json',
      'custom_metadata.json',
      'lyrics_registry.json',
      'video_registry.json'
    ];
    
    const results = await Promise.all(
      files.map(file => 
        fetch(`${SERVER_URL}/${file}`)
          .then(r => r.ok ? r.json() : {})
          .catch(() => ({}))
      )
    );

    return {
      albums: results[0],
      animatedCovers: results[1],
      customCovers: results[2],
      customMetadata: results[3],
      lyrics: results[4],
      videos: results[5]
    };
  },

  async updateRegistry(file: string, data: any): Promise<void> {
    // Assuming the server has a generic endpoint for updating these files
    // If not, this is a placeholder for the dev mode functionality
    const response = await fetch(`${SERVER_URL}/api/update-registry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, data })
    });
    if (!response.ok) throw new Error(`Failed to update ${file}`);
  }
};
