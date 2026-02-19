/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Player } from './components/Player';
import { AlbumCard } from './components/AlbumCard';
import { MobileNav } from './components/MobileNav';
import { SettingsView } from './components/SettingsView';
import { musicService } from './services/musicService';
import { Song } from './types';
import { SERVER_URL } from './constants';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [autoLoadCovers, setAutoLoadCovers] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [animatedCoversEnabled, setAnimatedCoversEnabled] = useState(true);
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSongs = useCallback(async (retries = 3) => {
    try {
      setLoading(true);
      const [rawSongs, registries] = await Promise.all([
        musicService.getAllMetadata(),
        musicService.getRegistries()
      ]);

      const processedSongs = rawSongs.map(song => {
        const customMeta = registries.customMetadata[song.filename] || {};
        const lyrics = registries.lyrics[song.filename];
        const videoUrl = registries.videos[song.filename];
        
        // Apply metadata overrides first so they can be used for key matching
        const finalTitle = customMeta.title || song.title;
        const finalArtist = customMeta.artist || song.artist;
        const finalAlbum = customMeta.album || song.album;

        // Animated cover check
        let isAnimated = false;
        let animatedCoverUrl = '';
        
        if (animatedCoversEnabled) {
          // Check track pattern: track:Filename
          const trackKey = `track:${song.filename}`;
          if (registries.animatedCovers[trackKey]) {
            isAnimated = true;
            animatedCoverUrl = `${SERVER_URL}/${registries.animatedCovers[trackKey]}`;
          } else {
            // Check album pattern: album:Artist|Album (using final metadata)
            const albumKey = `album:${finalArtist.trim()}|${finalAlbum.trim()}`;
            if (registries.animatedCovers[albumKey]) {
              isAnimated = true;
              animatedCoverUrl = `${SERVER_URL}/${registries.animatedCovers[albumKey]}`;
            }
          }
        }

        // Custom cover check
        let customCoverUrl = '';
        const customCoverKey = `track:${song.filename}`;
        if (registries.customCovers[customCoverKey]) {
          customCoverUrl = `${SERVER_URL}/${registries.customCovers[customCoverKey]}`;
        }

        return {
          ...song,
          title: finalTitle,
          artist: finalArtist,
          album: finalAlbum,
          lyrics,
          videoUrl,
          isAnimated,
          animatedCoverUrl,
          customCoverUrl
        };
      });

      setSongs(processedSongs);
    } catch (e) {
      console.error("Failed to fetch songs or registries", e);
      if (retries > 0) {
        console.log(`Retrying fetch... (${retries} attempts left)`);
        setTimeout(() => fetchSongs(retries - 1), 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [animatedCoversEnabled]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handlePlay = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (!currentSong || songs.length === 0) return;
    const index = songs.findIndex(s => s.filename === currentSong.filename);
    const nextIndex = (index + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
  };

  const handlePrev = () => {
    if (!currentSong || songs.length === 0) return;
    const index = songs.findIndex(s => s.filename === currentSong.filename);
    const prevIndex = (index - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
  };

  return (
    <div className="min-h-screen transition-colors duration-500 selection:bg-red-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content */}
      <main className="md:pl-72 pb-40 min-h-screen">
        {/* Header / Top Bar */}
        <div className="sticky top-0 z-40 bg-white/30 dark:bg-black/20 backdrop-blur-xl px-8 py-6 flex items-center justify-between transition-colors duration-500">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-zinc-400">
              <button className="hover:text-inherit transition-colors p-1">
                <ChevronLeft size={24} />
              </button>
              <button className="hover:text-inherit transition-colors p-1">
                <ChevronRight size={24} />
              </button>
            </div>
            <h1 className="text-4xl font-black tracking-tight capitalize">{activeTab}</h1>
          </div>
          
          <div className="md:hidden text-lg font-bold text-red-500">
            Music
          </div>
        </div>

        <div className="px-8 py-8">
          {activeTab === 'settings' ? (
            <SettingsView 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
              autoLoadCovers={autoLoadCovers}
              setAutoLoadCovers={setAutoLoadCovers}
              isDevMode={isDevMode}
              setIsDevMode={setIsDevMode}
              animatedCoversEnabled={animatedCoversEnabled}
              setAnimatedCoversEnabled={setAnimatedCoversEnabled}
              songs={songs}
              onRefresh={fetchSongs}
            />
          ) : (
            <div className="space-y-12 animate-in fade-in duration-500">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 size={48} className="animate-spin text-red-500" />
                  <p className="text-zinc-500 font-medium">Loading your library...</p>
                </div>
              ) : songs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <p className="text-zinc-500 font-medium">No songs found. Go to Settings to upload or download music!</p>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold"
                  >
                    Go to Settings
                  </button>
                </div>
              ) : (
                <>
                  {/* Top Picks Section (Just first 4 for visual) */}
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold tracking-tight">Top Picks for You</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {songs.slice(0, 4).map((song) => (
                        <AlbumCard 
                          key={song.filename} 
                          song={song} 
                          onPlay={handlePlay} 
                          autoLoadCover={autoLoadCovers}
                        />
                      ))}
                    </div>
                  </section>

                  {/* All Songs */}
                  <section>
                    <div className="flex items-center gap-2 mb-6 group cursor-pointer">
                      <h2 className="text-xl font-bold tracking-tight">Library</h2>
                      <ChevronRight size={20} className="text-zinc-400 group-hover:text-inherit transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {songs.map((song) => (
                        <AlbumCard 
                          key={song.filename} 
                          song={song} 
                          onPlay={handlePlay} 
                          autoLoadCover={autoLoadCovers}
                        />
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <Player 
        currentSong={currentSong} 
        isPlaying={isPlaying} 
        onPlayPause={setIsPlaying}
        onNext={handleNext}
        onPrev={handlePrev}
      />
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}




