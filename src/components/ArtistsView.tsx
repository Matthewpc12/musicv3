import React, { useState } from 'react';
import { Song } from '../types';
import { Play, Mic2 } from 'lucide-react';

interface ArtistsViewProps {
  songs: Song[];
  onPlay: (song: Song) => void;
  autoLoadCovers: boolean;
}

export function ArtistsView({ songs, onPlay, autoLoadCovers }: ArtistsViewProps) {
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  // Group songs by artist
  const artists = React.useMemo(() => {
    const map = new Map<string, Song[]>();
    songs.forEach(song => {
      const key = song.artist || 'Unknown Artist';
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(song);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [songs]);

  if (selectedArtist) {
    const artistSongs = artists.find(([name]) => name === selectedArtist)?.[1] || [];
    const firstSong = artistSongs[0];
    const displayCover = (firstSong.isAnimated && firstSong.animatedCoverUrl) 
      ? firstSong.animatedCoverUrl 
      : (firstSong.customCoverUrl || firstSong.cover);

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <button 
          onClick={() => setSelectedArtist(null)}
          className="mb-6 text-sm font-bold text-zinc-500 hover:text-red-500 transition-colors uppercase tracking-wider"
        >
          ← Back to Artists
        </button>

        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="w-48 h-48 md:w-64 md:h-64 bg-zinc-200 dark:bg-zinc-800 rounded-full shadow-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
             {displayCover ? (
               <img 
                 src={displayCover} 
                 alt={selectedArtist}
                 className="w-full h-full object-cover"
               />
             ) : (
               <div className="text-4xl font-bold text-zinc-400">{selectedArtist[0]}</div>
             )}
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Artist</span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">{selectedArtist}</h1>
            <p className="text-zinc-500 font-medium mb-6">{artistSongs.length} songs • {new Set(artistSongs.map(s => s.album)).size} albums</p>
            <button 
              onClick={() => artistSongs.length > 0 && onPlay(artistSongs[0])}
              className="bg-red-500 text-white w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-red-500/30"
            >
              <Play size={24} fill="currentColor" className="ml-1" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-1">
          {artistSongs.map((song, index) => (
            <div 
              key={song.filename}
              onClick={() => onPlay(song)}
              className="group flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
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
                <p className="text-xs text-zinc-500 truncate">{song.album}</p>
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
      {artists.map(([name, artistSongs]) => {
        const song = artistSongs[0];
        const displayCover = (song.isAnimated && song.animatedCoverUrl) 
          ? song.animatedCoverUrl 
          : (song.customCoverUrl || song.cover);

        return (
          <div 
            key={name} 
            onClick={() => setSelectedArtist(name)}
            className="group flex flex-col gap-3 cursor-pointer items-center text-center"
          >
            <div className="w-full aspect-square rounded-full bg-zinc-100 dark:bg-zinc-800 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:scale-105 overflow-hidden relative">
              {displayCover ? (
                <img 
                  src={displayCover} 
                  alt={name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800">
                  <Mic2 size={48} className="text-zinc-400 dark:text-zinc-500" />
                </div>
              )}
            </div>
            <div className="flex flex-col px-1">
              <h3 className="font-bold text-inherit truncate leading-tight text-sm">{name}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs truncate font-medium">{artistSongs.length} Songs</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
