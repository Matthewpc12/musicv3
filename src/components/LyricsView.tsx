import { useState, useEffect, useRef } from 'react';

interface LyricLine {
  time: number;
  text: string;
}

interface LyricsViewProps {
  lrc: string;
  currentTime: number;
  onClose: () => void;
}

export function LyricsView({ lrc, currentTime, onClose }: LyricsViewProps) {
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parsedLines: LyricLine[] = [];
    const regex = /\[(\d+):(\d+\.\d+)\](.*)/;
    
    lrc.split('\n').forEach(line => {
      const match = line.match(regex);
      if (match) {
        const mins = parseInt(match[1]);
        const secs = parseFloat(match[2]);
        const text = match[3].trim();
        parsedLines.push({ time: mins * 60 + secs, text });
      } else if (line.trim() && !line.startsWith('[')) {
        // Fallback for non-timestamped lines
        parsedLines.push({ time: -1, text: line.trim() });
      }
    });
    
    setLines(parsedLines);
  }, [lrc]);

  useEffect(() => {
    const index = lines.findIndex((line, i) => {
      const nextLine = lines[i + 1];
      return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
    });
    if (index !== -1) {
      setActiveIndex(index);
      const activeElement = document.getElementById(`lyric-${index}`);
      if (activeElement && scrollRef.current) {
        scrollRef.current.scrollTo({
          top: activeElement.offsetTop - scrollRef.current.clientHeight / 2 + 20,
          behavior: 'smooth'
        });
      }
    }
  }, [currentTime, lines]);

  return (
    <div className="fixed inset-0 z-[60] glass flex flex-col p-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-2xl font-black tracking-tight">Lyrics</h2>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <span className="text-2xl">×</span>
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pb-40 px-4"
      >
        {lines.length > 0 ? lines.map((line, i) => (
          <p 
            key={i}
            id={`lyric-${i}`}
            className={`text-3xl md:text-5xl font-bold transition-all duration-500 cursor-default ${
              i === activeIndex 
                ? 'text-zinc-900 dark:text-white scale-100 opacity-100' 
                : 'text-zinc-400 dark:text-zinc-600 scale-95 opacity-40 hover:opacity-60'
            }`}
          >
            {line.text}
          </p>
        )) : (
          <div className="h-full flex items-center justify-center text-zinc-400 italic">
            No lyrics available for this track.
          </div>
        )}
      </div>
    </div>
  );
}
