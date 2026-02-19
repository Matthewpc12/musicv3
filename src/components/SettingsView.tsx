import { Moon, Sun, Monitor, Bell, Shield, User, Globe, Download, Upload, Loader2, CheckCircle2, XCircle, Edit3 } from 'lucide-react';
import React, { useState } from 'react';
import { musicService } from '../services/musicService';
import { LibraryEditor } from './LibraryEditor';
import { Song } from '../types';

interface SettingsViewProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  autoLoadCovers: boolean;
  setAutoLoadCovers: (val: boolean) => void;
  isDevMode: boolean;
  setIsDevMode: (val: boolean) => void;
  animatedCoversEnabled: boolean;
  setAnimatedCoversEnabled: (val: boolean) => void;
  songs: Song[];
  onRefresh: () => void;
}

export function SettingsView({ 
  isDarkMode, 
  setIsDarkMode, 
  autoLoadCovers, 
  setAutoLoadCovers, 
  isDevMode, 
  setIsDevMode,
  animatedCoversEnabled,
  setAnimatedCoversEnabled,
  songs,
  onRefresh 
}: SettingsViewProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showEditor, setShowEditor] = useState(false);

  const handleDevModeToggle = () => {
    if (isDevMode) {
      setIsDevMode(false);
    } else {
      if (password === 'Admin123') {
        setIsDevMode(true);
        setPassword('');
      } else {
        setStatus('Invalid password');
        setTimeout(() => setStatus(null), 3000);
      }
    }
  };

  const handleYoutubeDownload = async () => {
    if (!youtubeUrl) return;
    setDownloading(true);
    setStatus('Starting download...');
    try {
      const { task } = await musicService.downloadFromYoutube(youtubeUrl);
      setYoutubeUrl('');
      
      const poll = setInterval(async () => {
        const { status: taskStatus } = await musicService.getDownloadStatus(task);
        if (taskStatus === 'done') {
          clearInterval(poll);
          setDownloading(false);
          setStatus('Download finished!');
          onRefresh();
          setTimeout(() => setStatus(null), 3000);
        } else if (taskStatus === 'error') {
          clearInterval(poll);
          setDownloading(false);
          setStatus('Download failed');
          setTimeout(() => setStatus(null), 3000);
        } else {
          setStatus('Downloading...');
        }
      }, 3000);
    } catch (e) {
      setDownloading(false);
      setStatus('Error starting download');
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatus('Uploading...');
    try {
      await musicService.uploadFile(file);
      setUploading(false);
      setStatus('Upload successful!');
      onRefresh();
      setTimeout(() => setStatus(null), 3000);
    } catch (e) {
      setUploading(false);
      setStatus('Upload failed');
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        
        <div className="glass rounded-3xl overflow-hidden divide-y divide-black/5 dark:divide-white/5">
          {/* Appearance */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
              <Sun size={18} />
              <h3 className="text-sm font-bold uppercase tracking-wider">Appearance</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-semibold">Dark Mode</span>
                <span className="text-xs text-zinc-500">Switch between light and dark themes</span>
              </div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-12 h-6 rounded-full transition-all relative ${isDarkMode ? 'bg-red-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-semibold">Auto-load Covers</span>
                <span className="text-xs text-zinc-500">Automatically fetch and cache album art</span>
              </div>
              <button 
                onClick={() => setAutoLoadCovers(!autoLoadCovers)}
                className={`w-12 h-6 rounded-full transition-all relative ${autoLoadCovers ? 'bg-red-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${autoLoadCovers ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-semibold">Animated Covers</span>
                <span className="text-xs text-zinc-500">Show GIF covers when available</span>
              </div>
              <button 
                onClick={() => setAnimatedCoversEnabled(!animatedCoversEnabled)}
                className={`w-12 h-6 rounded-full transition-all relative ${animatedCoversEnabled ? 'bg-red-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${animatedCoversEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Dev Mode */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
              <Shield size={18} />
              <h3 className="text-sm font-bold uppercase tracking-wider">Developer Mode</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col flex-1 mr-4">
                <span className="font-semibold">Dev Access</span>
                <span className="text-xs text-zinc-500">Unlock library editing features</span>
                {!isDevMode && (
                  <input 
                    type="password" 
                    placeholder="Enter password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 bg-black/5 dark:bg-white/5 border-none rounded-lg py-1 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-red-500/20"
                  />
                )}
              </div>
              <button 
                onClick={handleDevModeToggle}
                className={`w-12 h-6 rounded-full transition-all relative ${isDevMode ? 'bg-red-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isDevMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Music Management (Only in Dev Mode) */}
          {isDevMode && (
            <div className="p-6 space-y-4 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
                <Download size={18} />
                <h3 className="text-sm font-bold uppercase tracking-wider">Music Management</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Download from YouTube</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="https://youtube.com/watch?v=..." 
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="flex-1 bg-black/5 dark:bg-white/5 border-none rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                    />
                    <button 
                      onClick={handleYoutubeDownload}
                      disabled={downloading || !youtubeUrl}
                      className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                      Download
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Upload Audio File</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden" 
                      id="file-upload"
                    />
                    <label 
                      htmlFor="file-upload"
                      className="flex items-center justify-center gap-2 w-full bg-black/5 dark:bg-white/5 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl py-6 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                    >
                      {uploading ? <Loader2 size={24} className="animate-spin text-red-500" /> : <Upload size={24} className="text-zinc-400" />}
                      <span className="text-sm font-medium text-zinc-500">Click to upload MP3, WAV, etc.</span>
                    </label>
                  </div>
                </div>

                {status && (
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 animate-in fade-in slide-in-from-top-2">
                    {status.includes('fail') || status.includes('Error') || status.includes('Invalid') ? <XCircle size={16} className="text-red-500" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
                    {status}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Library Editor (Only in Dev Mode) */}
          {isDevMode && (
            <div className="p-6 space-y-4 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
                  <Edit3 size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Library Editor</h3>
                </div>
                <button 
                  onClick={() => setShowEditor(!showEditor)}
                  className="text-xs font-bold text-red-500 uppercase tracking-widest hover:underline"
                >
                  {showEditor ? 'Hide Editor' : 'Show Editor'}
                </button>
              </div>
              
              {showEditor && (
                <LibraryEditor songs={songs} onRefresh={onRefresh} />
              )}
            </div>
          )}

          {/* Account */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
              <User size={18} />
              <h3 className="text-sm font-bold uppercase tracking-wider">Account</h3>
            </div>
            
            <div className="flex items-center justify-between group cursor-pointer">
              <div className="flex flex-col">
                <span className="font-semibold">Profile Information</span>
                <span className="text-xs text-zinc-500">Danny Rico • danny@example.com</span>
              </div>
              <button className="text-red-500 text-sm font-bold">Edit</button>
            </div>
          </div>
        </div>
      </section>

      <section className="text-center pb-12">
        <p className="text-xs text-zinc-500 font-medium">Music Markup App v1.0.0</p>
        <p className="text-[10px] text-zinc-400 mt-1">© 2026 Apple Music Style Markup</p>
      </section>
    </div>
  );
}
