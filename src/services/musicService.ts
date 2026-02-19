import { SERVER_URL } from '../constants';
import { Song, DownloadStatus, Registries } from '../types';
import { get, set } from 'idb-keyval';

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

  async getRegistry(filename: string): Promise<any> {
    const CACHE_KEY = `registry_${filename}`;
    try {
      // 1. Fetch the JSON file from the server
      const response = await fetch(`${SERVER_URL}/${filename}?t=${Date.now()}`);
      if (response.ok) {
        const registry = await response.json();
        // 2. Cache it locally
        await set(CACHE_KEY, registry);
        return registry;
      }
    } catch (e) {
      console.warn(`Failed to fetch ${filename}, falling back to cache`);
    }
    // 3. Return cached version if fetch fails
    return (await get(CACHE_KEY)) || {};
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
      files.map(file => this.getRegistry(file))
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

  async updateRegistry(filename: string, data: any): Promise<void> {
    const CACHE_KEY = `registry_${filename}`;
    
    // 1. Save to local cache immediately (Optimistic UI)
    await set(CACHE_KEY, data);
    
    // 2. Create a new file from the JSON string
    const jsonContent = JSON.stringify(data, null, 2);
    const file = new File([jsonContent], filename, { type: "application/json" });
    
    // 3. Upload the file to overwrite the one on the server
    await this.uploadFile(file);
  }
};
