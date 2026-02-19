import React, { useState } from 'react';
import { Song } from '../types';
import { AlbumCard } from './AlbumCard';
import { Play } from 'lucide-react';

interface AlbumsViewProps {
  songs: Song[];
  onPlay: (song: Song) => void;
  autoLoadCovers: boolean;
  isDevMode?: boolean;
  onEdit?: (song: Song) => void;
  onAddToPlaylist?: (e: React.MouseEvent, song: Song) => void;
  isMobile?: boolean;
}

export function AlbumsView({ 
  songs, 
  onPlay, 
  autoLoadCovers,
  isDevMode,
  onEdit,
  onAddToPlaylist,
  isMobile
}: AlbumsViewProps) {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  // Group songs by album
  const albums = React.useMemo(() => {
    const map = new Map<string, Song[]>();
    songs.forEach(song => {
      const key = song.album || 'Unknown Album';
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(song);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [songs]);

  if (selectedAlbum) {
    const albumSongs = albums.find(([name]) => name === selectedAlbum)?.[1] || [];
    const firstSong = albumSongs[0];
    const displayCover = (firstSong.isAnimated && firstSong.animatedCoverUrl) 
      ? firstSong.animatedCoverUrl 
      : (firstSong.customCoverUrl || firstSong.cover);

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <button 
          onClick={() => setSelectedAlbum(null)}
          className="mb-6 text-sm font-bold text-zinc-500 hover:text-red-500 transition-colors uppercase tracking-wider"
        >
          ← Back to Albums
        </button>

        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="w-48 h-48 md:w-64 md:h-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
             {displayCover ? (
               <img 
                 src={displayCover} 
                 alt={selectedAlbum}
                 className="w-full h-full object-cover"
               />
             ) : (
               <div className="text-4xl font-bold text-zinc-400">{selectedAlbum[0]}</div>
             )}
          </div>
          <div className="flex flex-col justify-end">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Album</span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">{selectedAlbum}</h1>
            <p className="text-2xl font-bold text-red-500 mb-2">{firstSong?.artist}</p>
            <p className="text-zinc-500 font-medium mb-6">{albumSongs.length} songs • {new Set(albumSongs.map(s => s.artist)).size > 1 ? 'Various Artists' : firstSong?.artist}</p>
            <button 
              onClick={() => albumSongs.length > 0 && onPlay(albumSongs[0])}
              className="bg-red-500 text-white w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-red-500/30"
            >
              <Play size={24} fill="currentColor" className="ml-1" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-1">
          {albumSongs.map((song, index) => (
            <div 
              key={song.filename}
              onClick={() => onPlay(song)}
              className="group flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              <span className="w-8 text-center text-sm font-mono text-zinc-400 group-hover:text-red-500">{index + 1}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold truncate">{song.title}</h4>
                <p className="text-xs text-zinc-500 truncate">{song.artist}</p>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {Math.floor(song.duration / 60)}:{Math.floor(song.duration % 60).toString().padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-in fade-in duration-500">
      {albums.map(([name, albumSongs]) => {
        const song = albumSongs[0];
        return (
          <div key={name} onClick={() => setSelectedAlbum(name)}>
            <AlbumCard 
              song={{...song, title: name, artist: song.artist}} // Hack to reuse AlbumCard for album display
              onPlay={() => setSelectedAlbum(name)}
              autoLoadCover={autoLoadCovers}
              isDevMode={isDevMode}
              onEdit={onEdit}
              onAddToPlaylist={onAddToPlaylist}
              isMobile={isMobile}
            />
          </div>
        );
      })}
    </div>
  );
}
