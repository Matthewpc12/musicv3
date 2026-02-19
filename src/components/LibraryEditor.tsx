import React, { useState, useEffect } from 'react';
import { Song, Registries } from '../types';
import { musicService } from '../services/musicService';
import { Save, Loader2, Music, Type, Video, Image as ImageIcon, Film } from 'lucide-react';

interface LibraryEditorProps {
  songs: Song[];
  onRefresh: () => void;
}

export function LibraryEditor({ songs, onRefresh }: LibraryEditorProps) {
  const [selectedFilename, setSelectedFilename] = useState<string>('');
  const [registries, setRegistries] = useState<Registries | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [customCover, setCustomCover] = useState('');
  const [animatedCover, setAnimatedCover] = useState('');
  const [albumAnimatedCover, setAlbumAnimatedCover] = useState('');

  useEffect(() => {
    loadRegistries();
  }, []);

  const loadRegistries = async () => {
    setLoading(true);
    try {
      const data = await musicService.getRegistries();
      setRegistries(data);
    } catch (e) {
      console.error("Failed to load registries", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFilename && registries) {
      const song = songs.find(s => s.filename === selectedFilename);
      const customMeta = registries.customMetadata[selectedFilename] || {};
      
      const currentTitle = customMeta.title || song?.title || '';
      const currentArtist = customMeta.artist || song?.artist || '';
      const currentAlbum = customMeta.album || song?.album || '';

      setTitle(currentTitle);
      setArtist(currentArtist);
      setAlbum(currentAlbum);
      setLyrics(registries.lyrics[selectedFilename] || '');
      setVideoUrl(registries.videos[selectedFilename] || '');
      setCustomCover(registries.customCovers[`track:${selectedFilename}`] || '');
      
      // Track-specific animated cover
      setAnimatedCover(registries.animatedCovers[`track:${selectedFilename}`] || '');
      
      // Album-level animated cover
      const albumKey = `album:${currentArtist}|${currentAlbum}`;
      setAlbumAnimatedCover(registries.animatedCovers[albumKey] || '');
    }
  }, [selectedFilename, registries, songs]);

  const handleSave = async () => {
    if (!selectedFilename || !registries) return;
    setSaving(true);
    setStatus('Saving changes...');

    try {
      // Prepare updates
      const updatedMetadata = { ...registries.customMetadata };
      updatedMetadata[selectedFilename] = { title, artist, album };

      const updatedLyrics = { ...registries.lyrics };
      if (lyrics) updatedLyrics[selectedFilename] = lyrics;
      else delete updatedLyrics[selectedFilename];

      const updatedVideos = { ...registries.videos };
      if (videoUrl) updatedVideos[selectedFilename] = videoUrl;
      else delete updatedVideos[selectedFilename];

      const updatedCustomCovers = { ...registries.customCovers };
      if (customCover) updatedCustomCovers[`track:${selectedFilename}`] = customCover;
      else delete updatedCustomCovers[`track:${selectedFilename}`];

      const updatedAnimatedCovers = { ...registries.animatedCovers };
      
      // Save track-level
      if (animatedCover) updatedAnimatedCovers[`track:${selectedFilename}`] = animatedCover;
      else delete updatedAnimatedCovers[`track:${selectedFilename}`];
      
      // Save album-level
      if (albumAnimatedCover) {
        const albumKey = `album:${artist}|${album}`;
        updatedAnimatedCovers[albumKey] = albumAnimatedCover;
      }

      // Send updates to server
      await Promise.all([
        musicService.updateRegistry('custom_metadata.json', updatedMetadata),
        musicService.updateRegistry('lyrics_registry.json', updatedLyrics),
        musicService.updateRegistry('video_registry.json', updatedVideos),
        musicService.updateRegistry('custom_covers.json', updatedCustomCovers),
        musicService.updateRegistry('animated_covers.json', updatedAnimatedCovers)
      ]);

      setStatus('All changes saved successfully!');
      onRefresh();
      await loadRegistries();
      setTimeout(() => setStatus(null), 3000);
    } catch (e) {
      console.error("Save failed", e);
      setStatus('Failed to save some changes');
      setTimeout(() => setStatus(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-red-500" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold uppercase tracking-wider text-zinc-500">Select Track to Edit</label>
        <select 
          value={selectedFilename}
          onChange={(e) => setSelectedFilename(e.target.value)}
          className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
        >
          <option value="">Choose a song...</option>
          {songs.map(song => (
            <option key={song.filename} value={song.filename}>{song.title} ({song.filename})</option>
          ))}
        </select>
      </div>

      {selectedFilename && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
          {/* Basic Metadata */}
          <div className="glass p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Music size={16} />
              <h4 className="text-xs font-bold uppercase tracking-widest">Metadata</h4>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} className="bg-black/5 dark:bg-white/5 rounded-lg p-2 text-sm border-none focus:ring-1 focus:ring-red-500/30" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Artist</label>
                <input value={artist} onChange={e => setArtist(e.target.value)} className="bg-black/5 dark:bg-white/5 rounded-lg p-2 text-sm border-none focus:ring-1 focus:ring-red-500/30" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Album</label>
                <input value={album} onChange={e => setAlbum(e.target.value)} className="bg-black/5 dark:bg-white/5 rounded-lg p-2 text-sm border-none focus:ring-1 focus:ring-red-500/30" />
              </div>
            </div>
          </div>

          {/* Media Links */}
          <div className="glass p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Video size={16} />
              <h4 className="text-xs font-bold uppercase tracking-widest">Media & Covers</h4>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Music Video URL</label>
                <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://..." className="bg-black/5 dark:bg-white/5 rounded-lg p-2 text-sm border-none focus:ring-1 focus:ring-red-500/30" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Custom Cover Filename</label>
                <input value={customCover} onChange={e => setCustomCover(e.target.value)} placeholder="image.png" className="bg-black/5 dark:bg-white/5 rounded-lg p-2 text-sm border-none focus:ring-1 focus:ring-red-500/30" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Animated Cover (Track GIF)</label>
                <input value={animatedCover} onChange={e => setAnimatedCover(e.target.value)} placeholder="track_cover.gif" className="bg-black/5 dark:bg-white/5 rounded-lg p-2 text-sm border-none focus:ring-1 focus:ring-red-500/30" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500">Animated Cover (Album GIF)</label>
                <input value={albumAnimatedCover} onChange={e => setAlbumAnimatedCover(e.target.value)} placeholder="album_cover.gif" className="bg-black/5 dark:bg-white/5 rounded-lg p-2 text-sm border-none focus:ring-1 focus:ring-red-500/30" />
              </div>
            </div>
          </div>

          {/* Lyrics Editor */}
          <div className="md:col-span-2 glass p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Type size={16} />
              <h4 className="text-xs font-bold uppercase tracking-widest">Lyrics (LRC Format)</h4>
            </div>
            <textarea 
              value={lyrics} 
              onChange={e => setLyrics(e.target.value)} 
              placeholder="[00:12.34] Lyric text here..."
              className="w-full h-48 bg-black/5 dark:bg-white/5 rounded-xl p-4 text-sm font-mono border-none focus:ring-1 focus:ring-red-500/30 custom-scrollbar"
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-between pt-4">
            <div className="text-sm font-medium text-zinc-500">
              {status && <span className="animate-pulse">{status}</span>}
            </div>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-red-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-600 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              Save Library Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
