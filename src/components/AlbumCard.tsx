import React, { useState, useEffect, useRef } from 'react';
import { Play, Plus, Edit2, MoreHorizontal } from 'lucide-react';
import { Song } from '../types';
import { musicService } from '../services/musicService';
import { cacheService } from '../services/cacheService';

interface AlbumCardProps {
  song: Song;
  onPlay: (song: Song) => void;
  autoLoadCover?: boolean;
  isDevMode?: boolean;
  onEdit?: (song: Song) => void;
  onAddToPlaylist?: (e: React.MouseEvent, song: Song) => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ 
  song, 
  onPlay, 
  autoLoadCover = false,
  isDevMode = false,
  onEdit,
  onAddToPlaylist
}) => {
  const [cover, setCover] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setImageError(false);
    return () => {
      mountedRef.current = false;
    };
  }, [song.filename, song.animatedCoverUrl, song.customCoverUrl]);

  useEffect(() => {
    if (autoLoadCover && !song.customCoverUrl && !song.animatedCoverUrl) {
      loadCover();
    }
  }, [song.filename, autoLoadCover, song.customCoverUrl, song.animatedCoverUrl]);

  const loadCover = async () => {
    try {
      // Try cache first
      const cached = await cacheService.getCover(song.filename);
      if (cached && mountedRef.current) {
        setCover(cached);
        return;
      }

      // Fetch if not cached
      const data = await musicService.getSongMetadata(song.filename);
      if (data.cover && mountedRef.current) {
        const coverData = `data:image/jpeg;base64,${data.cover}`;
        setCover(coverData);
        // Cache it asynchronously
        cacheService.saveCover(song.filename, coverData).catch(console.warn);
      }
    } catch (e) {
      console.warn('Failed to load cover', e);
    }
  };

  // Prioritize animated cover, then custom cover (from server URL), then embedded cover
  const displayCover = !imageError && (
    (song.isAnimated && song.animatedCoverUrl) 
      ? song.animatedCoverUrl 
      : (song.customCoverUrl ? song.customCoverUrl : cover)
  );

  return (
    <div className="group flex flex-col gap-3 cursor-pointer relative" onClick={() => onPlay(song)}>
      <div className="relative overflow-hidden rounded-2xl aspect-square bg-zinc-100 dark:bg-zinc-800 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
        {displayCover ? (
          <img 
            src={displayCover} 
            alt={song.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800">
            <span className="text-zinc-400 dark:text-zinc-500 font-bold text-4xl">{song.title[0]}</span>
          </div>
        )}
        
        <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
          <div className="flex justify-end gap-2">
             {/* Edit Button (Dev Mode) */}
             {isDevMode && onEdit && (
               <button 
                 onClick={(e) => { e.stopPropagation(); onEdit(song); }}
                 className="w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                 title="Edit Metadata"
               >
                 <Edit2 size={14} />
               </button>
             )}
             {/* Add to Playlist Button */}
             {onAddToPlaylist && (
               <button 
                 onClick={(e) => { e.stopPropagation(); onAddToPlaylist(e, song); }}
                 className="w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                 title="Add to Playlist"
               >
                 <Plus size={16} />
               </button>
             )}
          </div>
          
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

