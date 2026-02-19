import React from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  ListMusic, 
  MoreHorizontal,
  Shuffle,
  Quote,
  SkipBack,
  Tv,
  Maximize2
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Song } from '../types';
import { musicService } from '../services/musicService';
import { LyricsView } from './LyricsView';
import { VideoPlayer } from './VideoPlayer';
import { FullscreenPlayer } from './FullscreenPlayer';

import { cacheService } from '../services/cacheService';

interface PlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Player({ currentSong, isPlaying, onPlayPause, onNext, onPrev }: PlayerProps) {
  const [volume, setVolume] = useState(0.75);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [cover, setCover] = useState<string | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [imageError, setImageError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setImageError(false);
  }, [currentSong?.filename]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (!isVideoMode) setProgress(audio.currentTime);
    };
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => onNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onNext, isVideoMode]);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      const url = musicService.getAudioUrl(currentSong.filename);
      if (audioRef.current.src !== url) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
      
      // If video mode is active, we mute the audio player so video can play sound
      // Or we pause it. Pausing is better but syncing is harder.
      // Let's try muting for perfect sync if we run both? 
      // No, running both is waste of bandwidth.
      // If video mode, pause audio.
      
      if (isPlaying && !isVideoMode) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            if (error.name !== 'AbortError') {
              console.error('Playback failed:', error);
            }
          });
        }
      } else {
        audioRef.current.pause();
      }

      // Load cover
      const loadCover = async () => {
        setCover(null);
        try {
          const cached = await cacheService.getCover(currentSong.filename);
          if (cached) {
            setCover(cached);
          } else {
            const data = await musicService.getSongMetadata(currentSong.filename);
            if (data.cover) {
              const coverData = `data:image/jpeg;base64,${data.cover}`;
              setCover(coverData);
              cacheService.saveCover(currentSong.filename, coverData).catch(console.warn);
            }
          }
        } catch (e) {
          console.warn('Failed to load cover', e);
        }
      };
      
      loadCover();
    }
  }, [currentSong, isPlaying, isVideoMode]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Reset video mode when song changes
  useEffect(() => {
    setIsVideoMode(false);
  }, [currentSong?.filename]);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleSeekEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    handleSeek(percent * duration);
  };

  if (!currentSong) return null;

  return (
    <>
      {showFullscreen && (
        <FullscreenPlayer 
          song={currentSong}
          currentTime={progress}
          duration={duration}
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onNext={onNext}
          onPrev={onPrev}
          onSeek={handleSeek}
          onClose={() => setShowFullscreen(false)}
          cover={cover}
          volume={volume}
          onVolumeChange={setVolume}
          isVideoMode={isVideoMode}
          setIsVideoMode={setIsVideoMode}
        />
      )}

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-50 transition-all duration-500">
        <div className="glass rounded-2xl px-4 py-2 flex flex-col gap-1 shadow-2xl border-white/60 dark:border-white/10">
          <div className="flex items-center justify-between">
            {/* Playback Controls */}
            <div className="flex items-center gap-4">
              <button className="text-zinc-400 hover:text-inherit transition-colors">
                <Shuffle size={16} />
              </button>
              <button className="text-zinc-600 dark:text-zinc-400 hover:text-inherit transition-colors" onClick={onPrev}>
                <SkipBack size={20} fill="currentColor" />
              </button>
              <button 
                className="text-inherit hover:scale-110 transition-transform p-1"
                onClick={() => onPlayPause(!isPlaying)}
              >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
              </button>
              <button className="text-zinc-600 dark:text-zinc-400 hover:text-inherit transition-colors" onClick={onNext}>
                <SkipForward size={20} fill="currentColor" />
              </button>
            </div>

            {/* Now Playing Info */}
            <div className="flex items-center gap-3 flex-1 justify-center px-8 cursor-pointer group" onClick={() => setShowFullscreen(true)}>
              <div className="w-10 h-10 rounded-lg overflow-hidden shadow-md flex-shrink-0 bg-zinc-200 dark:bg-zinc-800 relative">
                {!imageError && currentSong.isAnimated && currentSong.animatedCoverUrl ? (
                  <img 
                    src={currentSong.animatedCoverUrl} 
                    alt={currentSong.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                  />
                ) : !imageError && cover ? (
                  <img 
                    src={cover} 
                    alt={currentSong.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold">
                    {currentSong.title[0]}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 size={16} className="text-white" />
                </div>
              </div>
              <div className="flex flex-col overflow-hidden max-w-[200px]">
                <h4 className="text-sm font-bold truncate group-hover:text-red-500 transition-colors">{currentSong.title}</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate font-medium">{currentSong.artist || 'Unknown Artist'}</p>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4">
              {currentSong.videoUrl && (
                <button 
                  className={`transition-colors ${showVideo ? 'text-red-500' : 'text-zinc-400 hover:text-inherit'}`}
                  onClick={() => setShowVideo(!showVideo)}
                >
                  <Tv size={18} />
                </button>
              )}
              {currentSong.lyrics && (
                <button 
                  className={`transition-colors ${showLyrics ? 'text-red-500' : 'text-zinc-400 hover:text-inherit'}`}
                  onClick={() => setShowLyrics(!showLyrics)}
                >
                  <Quote size={18} />
                </button>
              )}
              <button className="text-zinc-400 hover:text-inherit">
                <ListMusic size={18} />
              </button>
              <div className="flex items-center gap-2 group">
                <Volume2 size={18} className="text-zinc-400" />
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={volume} 
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-zinc-400"
                />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-[10px] text-zinc-400 font-mono w-8">{formatTime(progress)}</span>
            <div 
              className="h-1 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden cursor-pointer relative"
              onClick={handleSeekEvent}
            >
              <div 
                className="h-full bg-red-500 transition-all duration-100" 
                style={{ width: `${(progress / duration) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-400 font-mono w-8">{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </>
  );
}
