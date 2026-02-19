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
import { AlbumsView } from './components/AlbumsView';
import { ArtistsView } from './components/ArtistsView';
import { PlaylistsView } from './components/PlaylistsView';
import { MetadataEditor } from './components/MetadataEditor';
import { musicService } from './services/musicService';
import { Song, Playlist } from './types';
import { SERVER_URL } from './constants';
import { ChevronLeft, ChevronRight, Loader2, Plus, Check, Edit2 } from 'lucide-react';

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
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, song: Song } | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  
  // Detect mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('playlists');
    if (saved) {
      setPlaylists(JSON.parse(saved));
    }
  }, []);

  const addToPlaylist = (playlistId: string, songFilename: string) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        if (p.songs.includes(songFilename)) return p;
        return { ...p, songs: [...p.songs, songFilename] };
      }
      return p;
    });
    setPlaylists(updated);
    localStorage.setItem('playlists', JSON.stringify(updated));
    setContextMenu(null);
  };

  const fetchSongs = useCallback(async (retries = 3) => {
    try {
      setLoading(true);
      const [rawSongs, registries] = await Promise.all([
        musicService.getAllMetadata(),
        musicService.getRegistries()
      ]);

      const processedSongs = rawSongs.map(song => {
        // Helper to find value by key or track:key
        const getValue = (registry: Record<string, any> | undefined, key: string) => {
          if (!registry) return undefined;
          return registry[key] || registry[`track:${key}`];
        };

        const customMeta = getValue(registries.customMetadata, song.filename) || {};
        const lyrics = getValue(registries.lyrics, song.filename);
        const videoUrl = getValue(registries.videos, song.filename);
        
        // Apply metadata overrides first so they can be used for key matching
        const finalTitle = customMeta.title || song.title;
        const finalArtist = customMeta.artist || song.artist;
        const finalAlbum = customMeta.album || song.album;

        // Helper to construct URL (handle absolute vs relative)
        const getUrl = (path: string | undefined) => {
          if (!path) return '';
          if (path.startsWith('http://') || path.startsWith('https://')) return path;
          return `${SERVER_URL}/${path}`;
        };

        // Animated cover check
        let isAnimated = false;
        let animatedCoverUrl = '';
        
        if (animatedCoversEnabled) {
          const animatedPath = getValue(registries.animatedCovers, song.filename);
          if (animatedPath) {
            isAnimated = true;
            animatedCoverUrl = getUrl(animatedPath);
          } else {
            // Check album pattern: album:Artist|Album (using final metadata)
            const albumKey = `album:${finalArtist.trim()}|${finalAlbum.trim()}`;
            if (registries.animatedCovers[albumKey]) {
              isAnimated = true;
              animatedCoverUrl = getUrl(registries.animatedCovers[albumKey]);
            }
          }
        }

        // Custom cover check
        let customCoverUrl = '';
        const customPath = getValue(registries.customCovers, song.filename);
        if (customPath) {
          customCoverUrl = getUrl(customPath);
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

  const handleContextMenu = (e: React.MouseEvent, song: Song) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, song });
  };

  const handleEditMetadata = () => {
    if (contextMenu) {
      setEditingSong(contextMenu.song);
      setContextMenu(null);
    }
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="min-h-screen transition-colors duration-500 selection:bg-red-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <MetadataEditor 
        song={editingSong}
        isOpen={!!editingSong}
        onClose={() => setEditingSong(null)}
        onSave={() => {
          fetchSongs();
          setEditingSong(null);
        }}
      />

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-[100] bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-2 w-56 animate-in fade-in zoom-in-95 duration-200"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={handleEditMetadata}
            className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2 mb-2 font-medium"
          >
            <Edit2 size={14} />
            Edit Metadata
          </button>

          <div className="px-3 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 mb-1">
            Add to Playlist
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            {playlists.length === 0 ? (
              <div className="px-3 py-2 text-sm text-zinc-500 italic">No playlists created</div>
            ) : (
              playlists.map(p => (
                <button
                  key={p.id}
                  onClick={() => addToPlaylist(p.id, contextMenu.song.filename)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-lg transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">{p.name}</span>
                  {p.songs.includes(contextMenu.song.filename) && <Check size={14} className="text-red-500" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="md:pl-72 pb-40 min-h-screen">
        {/* Header / Top Bar */}
        <div className="sticky top-0 z-40 bg-white/30 dark:bg-black/20 backdrop-blur-xl px-4 md:px-8 py-4 md:py-6 flex items-center justify-between transition-colors duration-500">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 text-zinc-400">
              <button className="hover:text-inherit transition-colors p-1">
                <ChevronLeft size={24} />
              </button>
              <button className="hover:text-inherit transition-colors p-1">
                <ChevronRight size={24} />
              </button>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight capitalize">{activeTab}</h1>
          </div>
          
          <div className="md:hidden text-lg font-bold text-red-500">
            Music
          </div>
        </div>

        <div className="px-4 md:px-8 py-4 md:py-8">
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
          ) : activeTab === 'albums' ? (
            <AlbumsView 
              songs={songs} 
              onPlay={handlePlay} 
              autoLoadCovers={autoLoadCovers && !isMobile}
              isDevMode={isDevMode}
              onEdit={(song) => setEditingSong(song)}
              onAddToPlaylist={(e, song) => handleContextMenu(e, song)}
              isMobile={isMobile}
            />
          ) : activeTab === 'artists' ? (
            <ArtistsView 
              songs={songs} 
              onPlay={handlePlay} 
              autoLoadCovers={autoLoadCovers && !isMobile}
              isDevMode={isDevMode}
              onEdit={(song) => setEditingSong(song)}
              onAddToPlaylist={(e, song) => handleContextMenu(e, song)}
              isMobile={isMobile}
            />
          ) : activeTab === 'playlists' ? (
            <PlaylistsView 
              songs={songs} 
              onPlay={handlePlay} 
              autoLoadCovers={autoLoadCovers && !isMobile}
              isMobile={isMobile}
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
                  {/* Top Picks Section */}
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold tracking-tight">Top Picks for You</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {songs.slice(0, 4).map((song) => (
                        <div key={song.filename} onContextMenu={(e) => handleContextMenu(e, song)}>
                          <AlbumCard 
                            song={song} 
                            onPlay={handlePlay} 
                            autoLoadCover={autoLoadCovers && !isMobile}
                            isDevMode={isDevMode}
                            onEdit={() => setEditingSong(song)}
                            onAddToPlaylist={(e) => handleContextMenu(e, song)}
                            isMobile={isMobile}
                          />
                        </div>
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
                        <div key={song.filename} onContextMenu={(e) => handleContextMenu(e, song)}>
                          <AlbumCard 
                            song={song} 
                            onPlay={handlePlay} 
                            autoLoadCover={autoLoadCovers && !isMobile}
                            isDevMode={isDevMode}
                            onEdit={() => setEditingSong(song)}
                            onAddToPlaylist={(e) => handleContextMenu(e, song)}
                            isMobile={isMobile}
                          />
                        </div>
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




