import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, X, Volume2, Maximize2, Minimize2, Quote } from 'lucide-react';
import { Song } from '../types';

interface LyricLine {
  time: number;
  text: string;
}

interface FullscreenPlayerProps {
  song: Song;
  currentTime: number;
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  cover: string | null;
}

export function FullscreenPlayer({ 
  song, 
  currentTime, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrev, 
  onClose,
  cover
}: FullscreenPlayerProps) {
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showLyrics, setShowLyrics] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!song.lyrics) {
      setLines([]);
      return;
    }

    const parsedLines: LyricLine[] = [];
    const regex = /\[(\d+):(\d+\.\d+)\](.*)/;
    
    song.lyrics.split('\n').forEach(line => {
      const match = line.match(regex);
      if (match) {
        const mins = parseInt(match[1]);
        const secs = parseFloat(match[2]);
        const text = match[3].trim();
        parsedLines.push({ time: mins * 60 + secs, text });
      } else if (line.trim() && !line.startsWith('[')) {
        parsedLines.push({ time: -1, text: line.trim() });
      }
    });
    
    setLines(parsedLines);
  }, [song.lyrics]);

  useEffect(() => {
    const index = lines.findIndex((line, i) => {
      const nextLine = lines[i + 1];
      return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
    });
    
    if (index !== -1 && index !== activeIndex) {
      setActiveIndex(index);
      const activeElement = document.getElementById(`fs-lyric-${index}`);
      if (activeElement && scrollRef.current) {
        scrollRef.current.scrollTo({
          top: activeElement.offsetTop - scrollRef.current.clientHeight / 2 + 40,
          behavior: 'smooth'
        });
      }
    }
  }, [currentTime, lines, activeIndex]);

  const displayCover = (song.isAnimated && song.animatedCoverUrl) 
    ? song.animatedCoverUrl 
    : (song.customCoverUrl || cover);

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white overflow-hidden flex flex-col animate-in fade-in duration-500">
      {/* Background Blur */}
      <div className="absolute inset-0 z-0 opacity-40">
        {displayCover && (
          <img 
            src={displayCover} 
            alt="" 
            className="w-full h-full object-cover blur-[100px] scale-110"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-8">
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Playing From Library</span>
          <h2 className="text-lg font-bold truncate max-w-md">{song.album}</h2>
        </div>
        <div className="flex items-center gap-4">
          {song.lyrics && (
            <button 
              onClick={() => setShowLyrics(!showLyrics)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all backdrop-blur-md ${showLyrics ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <Quote size={20} />
            </button>
          )}
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all backdrop-blur-md"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center px-8 md:px-20 gap-12 md:gap-24 overflow-hidden">
        {/* Left: Album Art */}
        <div className={`w-full aspect-square relative group transition-all duration-1000 ${showLyrics && song.lyrics ? 'max-w-[300px] md:max-w-[500px]' : 'max-w-[400px] md:max-w-[700px]'}`}>
          <div className="w-full h-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-[1.02]">
            {displayCover ? (
              <img 
                src={displayCover} 
                alt={song.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600 text-9xl font-black">
                {song.title[0]}
              </div>
            )}
          </div>
          
          {(!showLyrics || !song.lyrics) && (
            <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2">{song.title}</h1>
              <p className="text-xl md:text-2xl font-bold text-white/60">{song.artist}</p>
            </div>
          )}
        </div>

        {/* Right: Lyrics */}
        {showLyrics && song.lyrics && (
          <div className="flex-1 w-full h-full max-h-[60vh] md:max-h-none flex flex-col animate-in fade-in slide-in-from-right-8 duration-700">
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto custom-scrollbar space-y-8 py-20 mask-fade-edges"
            >
              {lines.length > 0 ? lines.map((line, i) => (
                <p 
                  key={i}
                  id={`fs-lyric-${i}`}
                  className={`text-3xl md:text-5xl lg:text-6xl font-black transition-all duration-700 cursor-default leading-tight ${
                    i === activeIndex 
                      ? 'text-white scale-100 opacity-100' 
                      : 'text-white/20 scale-95 opacity-20 hover:opacity-40'
                  }`}
                >
                  {line.text}
                </p>
              )) : (
                <div className="h-full flex flex-col justify-center items-start space-y-4">
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter">{song.title}</h1>
                  <p className="text-2xl md:text-3xl font-bold text-white/40">{song.artist}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="relative z-10 p-8 md:p-12 bg-gradient-to-t from-black/60 to-transparent">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {/* Song Info (Mobile only, hidden on desktop if lyrics are present) */}
          <div className="md:hidden flex flex-col gap-1">
            <h1 className="text-2xl font-bold truncate">{song.title}</h1>
            <p className="text-lg text-white/60 truncate">{song.artist}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-12">
            <button 
              onClick={onPrev}
              className="text-white/60 hover:text-white transition-colors"
            >
              <SkipBack size={40} fill="currentColor" />
            </button>
            <button 
              onClick={() => onPlayPause(!isPlaying)}
              className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
            >
              {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
            </button>
            <button 
              onClick={onNext}
              className="text-white/60 hover:text-white transition-colors"
            >
              <SkipForward size={40} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .mask-fade-edges {
          mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
        }
      `}} />
    </div>
  );
}
