import React from 'react';
import { Play } from 'lucide-react';
import { Song } from '../types';
import { useState, useEffect } from 'react';
import { musicService } from '../services/musicService';

interface AlbumCardProps {
  song: Song;
  onPlay: (song: Song) => void;
  autoLoadCover?: boolean;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ song, onPlay, autoLoadCover = false }) => {
  const [cover, setCover] = useState<string | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem(`cover_${song.filename}`);
    if (cached) {
      setCover(cached);
    } else if (autoLoadCover) {
      // Stagger requests to avoid burst failures/rate limits on Cloudflare
      const delay = Math.random() * 3000;
      const timer = setTimeout(loadCover, delay);
      return () => clearTimeout(timer);
    }
  }, [song.filename, autoLoadCover]);

  const loadCover = async () => {
    try {
      const data = await musicService.getSongMetadata(song.filename);
      if (data.cover) {
        const coverData = `data:image/jpeg;base64,${data.cover}`;
        setCover(coverData);
        try {
          localStorage.setItem(`cover_${song.filename}`, coverData);
        } catch (e) {
          console.warn("Storage quota exceeded, could not cache cover locally");
        }
      }
    } catch (e) {
      console.error("Failed to load cover", e);
    }
  };

  const displayCover = (song.isAnimated && song.animatedCoverUrl) 
    ? song.animatedCoverUrl 
    : (song.customCoverUrl || cover);

  return (
    <div className="group flex flex-col gap-3 cursor-pointer" onClick={() => onPlay(song)}>
      <div className="relative overflow-hidden rounded-2xl aspect-square bg-zinc-100 dark:bg-zinc-800 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
        {displayCover ? (
          <img 
            src={displayCover} 
            alt={song.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800">
            <span className="text-zinc-400 dark:text-zinc-500 font-bold text-4xl">{song.title[0]}</span>
          </div>
        )}
        
        <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-full flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-white text-xs font-bold uppercase tracking-widest drop-shadow-md">Music</span>
            </div>
            <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:scale-110 hover:bg-white/40 transition-all shadow-lg">
              <Play size={20} fill="currentColor" className="ml-1" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col px-1">
        <h3 className="font-bold text-inherit truncate leading-tight text-sm">{song.title}</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs truncate font-medium">{song.artist || 'Unknown Artist'}</p>
      </div>
    </div>
  );
}

