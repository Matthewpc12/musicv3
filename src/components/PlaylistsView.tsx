import React, { useState, useEffect } from 'react';
import { Song, Playlist } from '../types';
import { Plus, Music, Play, Trash2, MoreHorizontal } from 'lucide-react';
import { AlbumCard } from './AlbumCard';

interface PlaylistsViewProps {
  songs: Song[];
  onPlay: (song: Song) => void;
  autoLoadCovers: boolean;
}

export function PlaylistsView({ songs, onPlay, autoLoadCovers }: PlaylistsViewProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('playlists');
    if (saved) {
      setPlaylists(JSON.parse(saved));
    }
  }, []);

  const savePlaylists = (updated: Playlist[]) => {
    setPlaylists(updated);
    localStorage.setItem('playlists', JSON.stringify(updated));
  };

  const handleCreate = () => {
    if (!newPlaylistName.trim()) return;
    
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName,
      songs: [],
      createdAt: Date.now()
    };
    
    savePlaylists([...playlists, newPlaylist]);
    setNewPlaylistName('');
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      const updated = playlists.filter(p => p.id !== id);
      savePlaylists(updated);
      if (selectedPlaylist?.id === id) setSelectedPlaylist(null);
    }
  };

  const getPlaylistCover = (playlist: Playlist) => {
    if (playlist.songs.length > 0) {
      const firstSong = songs.find(s => s.filename === playlist.songs[0]);
      if (firstSong) {
        return (firstSong.isAnimated && firstSong.animatedCoverUrl) 
          ? firstSong.animatedCoverUrl 
          : (firstSong.customCoverUrl || firstSong.cover);
      }
    }
    return null;
  };

  if (selectedPlaylist) {
    const playlistSongs = selectedPlaylist.songs
      .map(filename => songs.find(s => s.filename === filename))
      .filter((s): s is Song => !!s);

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <button 
          onClick={() => setSelectedPlaylist(null)}
          className="mb-6 text-sm font-bold text-zinc-500 hover:text-red-500 transition-colors uppercase tracking-wider"
        >
          ← Back to Playlists
        </button>

        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="w-48 h-48 md:w-64 md:h-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
             {getPlaylistCover(selectedPlaylist) ? (
               <img 
                 src={getPlaylistCover(selectedPlaylist)!} 
                 alt={selectedPlaylist.name}
                 className="w-full h-full object-cover"
               />
             ) : (
               <Music size={64} className="text-zinc-400" />
             )}
          </div>
          <div className="flex flex-col justify-end">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Playlist</span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">{selectedPlaylist.name}</h1>
            <p className="text-zinc-500 font-medium mb-6">{playlistSongs.length} songs</p>
            <div className="flex gap-4">
              <button 
                onClick={() => playlistSongs.length > 0 && onPlay(playlistSongs[0])}
                className="bg-red-500 text-white w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-red-500/30"
              >
                <Play size={24} fill="currentColor" className="ml-1" />
              </button>
              <button 
                onClick={() => handleDelete(selectedPlaylist.id)}
                className="w-14 h-14 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-red-500"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {playlistSongs.map((song, index) => (
            <div 
              key={`${song.filename}-${index}`}
              onClick={() => onPlay(song)}
              className="group flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              <span className="w-8 text-center text-sm font-mono text-zinc-400 group-hover:text-red-500">{index + 1}</span>
              <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                {(song.isAnimated && song.animatedCoverUrl) || song.customCoverUrl || song.cover ? (
                  <img 
                    src={song.animatedCoverUrl || song.customCoverUrl || song.cover} 
                    className="w-full h-full object-cover" 
                    alt="" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold text-xs">
                    {song.title[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold truncate">{song.title}</h4>
                <p className="text-xs text-zinc-500 truncate">{song.artist}</p>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {Math.floor(song.duration / 60)}:{Math.floor(song.duration % 60).toString().padStart(2, '0')}
              </span>
            </div>
          ))}
          {playlistSongs.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              This playlist is empty. Right-click songs in your library to add them!
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Your Playlists</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-full transition-colors"
        >
          <Plus size={18} />
          NEW PLAYLIST
        </button>
      </div>

      {isCreating && (
        <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-2xl flex gap-2 animate-in slide-in-from-top-2">
          <input 
            autoFocus
            value={newPlaylistName}
            onChange={e => setNewPlaylistName(e.target.value)}
            placeholder="Playlist Name"
            className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-lg placeholder:text-zinc-500"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <button onClick={handleCreate} className="text-red-500 font-bold text-sm px-4">CREATE</button>
          <button onClick={() => setIsCreating(false)} className="text-zinc-500 font-bold text-sm px-4">CANCEL</button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {playlists.map(playlist => (
          <div 
            key={playlist.id}
            onClick={() => setSelectedPlaylist(playlist)}
            className="group cursor-pointer flex flex-col gap-3"
          >
            <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-300 relative">
              {getPlaylistCover(playlist) ? (
                <img 
                  src={getPlaylistCover(playlist)!} 
                  alt={playlist.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music size={48} className="text-zinc-300 dark:text-zinc-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play size={32} className="text-white drop-shadow-lg" fill="currentColor" />
              </div>
            </div>
            <div>
              <h3 className="font-bold truncate">{playlist.name}</h3>
              <p className="text-xs text-zinc-500 font-medium">{playlist.songs.length} songs</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
