interface VideoPlayerProps {
  url: string;
  onClose: () => void;
}

export function VideoPlayer({ url, onClose }: VideoPlayerProps) {
  return (
    <div className="fixed inset-0 z-[70] bg-black flex flex-col animate-in fade-in duration-300">
      <div className="absolute top-8 right-8 z-[80]">
        <button 
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <span className="text-3xl">×</span>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <video 
          src={url} 
          controls 
          autoPlay 
          className="max-w-full max-h-full shadow-2xl"
        />
      </div>
    </div>
  );
}
