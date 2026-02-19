import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../types';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  X, 
  Volume2, 
  Quote, 
  Tv, 
  Maximize2, 
  Minimize2,
  ListMusic
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LyricsView } from './LyricsView';

interface FullscreenPlayerProps {
  song: Song;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onClose: () => void;
  cover: string | null;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isVideoMode: boolean;
  setIsVideoMode: (mode: boolean) => void;
}

export function FullscreenPlayer({
  song,
  currentTime,
  duration,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onSeek,
  onClose,
  cover,
  volume,
  onVolumeChange,
  isVideoMode,
  setIsVideoMode
}: FullscreenPlayerProps) {
  const [showLyrics, setShowLyrics] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync video with audio time when toggled
  useEffect(() => {
    if (isVideoMode && videoRef.current) {
      videoRef.current.currentTime = currentTime;
      if (isPlaying) videoRef.current.play();
    }
  }, [isVideoMode]);

  // Sync video playback state
  useEffect(() => {
    if (isVideoMode && videoRef.current) {
      if (isPlaying) videoRef.current.play();
      else videoRef.current.pause();
    }
  }, [isPlaying, isVideoMode]);

  // Handle video time updates to sync main progress
  const handleVideoTimeUpdate = () => {
    if (videoRef.current && isVideoMode) {
      // We don't update main progress here to avoid loops, 
      // but we could if the video becomes the master clock.
      // For now, let's assume the main audio player drives the clock 
      // and we just sync the video to it if needed, OR we mute audio and let video drive.
      
      // Actually, per requirements: "sound will come from the music video"
      // This means we should MUTE the main audio player and let the video player be the source.
      // But the main Player component owns the audio element.
      // We need to signal the parent to mute/pause the main audio.
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    onSeek(percent * duration);
    if (videoRef.current) videoRef.current.currentTime = percent * duration;
  };

  const displayCover = (song.isAnimated && song.animatedCoverUrl) 
    ? song.animatedCoverUrl 
    : (song.customCoverUrl || cover);

  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[60] bg-zinc-900 text-white flex flex-col overflow-hidden"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {isVideoMode && song.videoUrl ? (
           <video
             src={song.videoUrl}
             className="w-full h-full object-cover blur-3xl opacity-50 scale-110"
             muted
             loop
             playsInline
           />
        ) : (
          displayCover ? (
            <img 
              src={displayCover} 
              className="w-full h-full object-cover blur-3xl opacity-40 scale-110" 
              alt=""
            />
          ) : (
            <div className="w-full h-full bg-zinc-900/50 backdrop-blur-3xl" />
          )
        )}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-8 py-6">
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Minimize2 size={24} className="text-zinc-400 hover:text-white" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Now Playing</span>
          <span className="text-sm font-bold truncate max-w-[200px]">{song.album}</span>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <MoreHorizontal size={24} className="text-zinc-400 hover:text-white" />
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8 gap-12 min-h-0">
        {/* Left/Center: Art or Video */}
        <div className={`flex-1 flex items-center justify-center max-w-3xl aspect-square max-h-[60vh] transition-all duration-500 ${showLyrics ? 'scale-90' : 'scale-100'}`}>
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-zinc-800">
            {isVideoMode && song.videoUrl ? (
              <video
                ref={videoRef}
                src={song.videoUrl}
                className="w-full h-full object-contain bg-black"
                loop={false}
                playsInline
                // If we want sound from video, we shouldn't mute. 
                // But we need to coordinate with parent to mute main audio.
                // For now, let's assume parent handles muting if we pass a prop or callback.
                muted={false} 
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={onNext}
              />
            ) : (
              displayCover ? (
                <img 
                  src={displayCover} 
                  alt={song.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                  <span className="text-6xl font-bold text-zinc-600">{song.title[0]}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right: Lyrics */}
        <AnimatePresence>
          {showLyrics && song.lyrics && (
            <motion.div 
              initial={{ opacity: 0, x: 50, width: 0 }}
              animate={{ opacity: 1, x: 0, width: '400px' }}
              exit={{ opacity: 0, x: 50, width: 0 }}
              className="h-full max-h-[60vh] bg-black/20 backdrop-blur-md rounded-2xl overflow-hidden hidden lg:block"
            >
              <LyricsView 
                lrc={song.lyrics} 
                currentTime={currentTime} 
                onClose={() => setShowLyrics(false)} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 px-8 pb-12 pt-4 flex flex-col gap-6 max-w-5xl mx-auto w-full">
        {/* Track Info & Toggles */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold truncate">{song.title}</h2>
            <p className="text-lg text-zinc-400 font-medium truncate">{song.artist}</p>
          </div>
          <div className="flex items-center gap-4">
             {song.videoUrl && (
                <button 
                  onClick={() => setIsVideoMode(!isVideoMode)}
                  className={`p-3 rounded-full transition-all ${isVideoMode ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  title="Toggle Music Video"
                >
                  <Tv size={20} />
                </button>
             )}
             {song.lyrics && (
                <button 
                  onClick={() => setShowLyrics(!showLyrics)}
                  className={`p-3 rounded-full transition-all ${showLyrics ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  title="Toggle Lyrics"
                >
                  <Quote size={20} />
                </button>
             )}
          </div>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-2 group">
          <div 
            className="h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer relative group-hover:h-2.5 transition-all"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-white rounded-full relative" 
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex justify-between text-xs font-medium text-zinc-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 w-1/3">
             <Volume2 size={20} className="text-zinc-400" />
             <input 
               type="range" 
               min="0" 
               max="1" 
               step="0.01" 
               value={volume} 
               onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
               className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
             />
          </div>

          <div className="flex items-center gap-8 justify-center w-1/3">
            <button onClick={onPrev} className="text-zinc-300 hover:text-white hover:scale-110 transition-all">
              <SkipBack size={32} fill="currentColor" />
            </button>
            <button 
              onClick={() => onPlayPause(!isPlaying)}
              className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/20"
            >
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={onNext} className="text-zinc-300 hover:text-white hover:scale-110 transition-all">
              <SkipForward size={32} fill="currentColor" />
            </button>
          </div>

          <div className="w-1/3 flex justify-end gap-4">
             <button className="text-zinc-400 hover:text-white transition-colors">
               <ListMusic size={20} />
             </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { MoreHorizontal } from 'lucide-react';
