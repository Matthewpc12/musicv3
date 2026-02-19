import React, { useState, useEffect } from 'react';
import { Song } from '../types';
import { musicService } from '../services/musicService';
import { X, Save, Loader2 } from 'lucide-react';

interface MetadataEditorProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function MetadataEditor({ song, isOpen, onClose, onSave }: MetadataEditorProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist);
      setAlbum(song.album);
      setVideoUrl(song.videoUrl || '');
    }
  }, [song]);

  if (!isOpen || !song) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update metadata
      await musicService.saveTrackMetadata(song.filename, {
        title,
        artist,
        album
      });

      // Update video mapping
      await musicService.saveVideoMapping(song.filename, videoUrl || null);

      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save metadata:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 m-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight">Edit Song Info</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-red-500/20 transition-all"
              placeholder="Song Title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Artist</label>
              <input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-red-500/20 transition-all"
                placeholder="Artist Name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Album</label>
              <input
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-red-500/20 transition-all"
                placeholder="Album Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Music Video URL</label>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-red-500/20 transition-all"
              placeholder="https://youtube.com/..."
            />
            <p className="text-[10px] text-zinc-400 mt-1.5 font-medium">
              Paste a YouTube URL to link a music video to this song.
            </p>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-6 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
