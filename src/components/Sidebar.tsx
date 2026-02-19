import React from 'react';
import { 
  Home, 
  LayoutGrid, 
  Radio, 
  Search, 
  Clock, 
  Mic2, 
  Library, 
  PlaySquare, 
  User,
  Tv,
  Pin,
  Store,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="w-64 h-[calc(100vh-32px)] fixed left-4 top-4 bottom-4 glass rounded-3xl flex flex-col py-6 px-4 hidden md:flex z-50 transition-all duration-500">
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
      </div>

      <div className="space-y-6 overflow-y-auto custom-scrollbar flex-1 pr-1">
        {/* Search */}
        <div className="px-2 mb-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl py-2 pl-9 pr-3 text-sm text-inherit placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
            />
          </div>
        </div>

        {/* Main Nav */}
        <nav className="space-y-0.5">
          <NavItem icon={<Home size={18} />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem icon={<LayoutGrid size={18} />} label="New" active={activeTab === 'new'} onClick={() => setActiveTab('new')} />
          <NavItem icon={<Radio size={18} />} label="Radio" active={activeTab === 'radio'} onClick={() => setActiveTab('radio')} />
        </nav>

        {/* Library */}
        <div>
          <h3 className="px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Library</h3>
          <nav className="space-y-0.5">
            <NavItem icon={<Pin size={18} />} label="Pins" active={activeTab === 'pins'} onClick={() => setActiveTab('pins')} />
            <NavItem icon={<Clock size={18} />} label="Recently Added" active={activeTab === 'recent'} onClick={() => setActiveTab('recent')} />
            <NavItem icon={<Mic2 size={18} />} label="Artists" active={activeTab === 'artists'} onClick={() => setActiveTab('artists')} />
            <NavItem icon={<Library size={18} />} label="Albums" active={activeTab === 'albums'} onClick={() => setActiveTab('albums')} />
            <NavItem icon={<PlaySquare size={18} />} label="Songs" active={activeTab === 'songs'} onClick={() => setActiveTab('songs')} />
            <NavItem icon={<Tv size={18} />} label="Music Videos" active={activeTab === 'videos'} onClick={() => setActiveTab('videos')} />
            <NavItem icon={<User size={18} />} label="Made For You" active={activeTab === 'foryou'} onClick={() => setActiveTab('foryou')} />
          </nav>
        </div>

        {/* Store */}
        <div>
          <h3 className="px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Store</h3>
          <nav className="space-y-0.5">
            <NavItem icon={<Store size={18} />} label="iTunes Store" active={activeTab === 'store'} onClick={() => setActiveTab('store')} />
          </nav>
        </div>

        {/* Settings */}
        <div>
          <h3 className="px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">System</h3>
          <nav className="space-y-0.5">
            <NavItem icon={<Settings size={18} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </nav>
        </div>
      </div>
      
      <div className="mt-auto pt-4">
        <div className="flex items-center gap-3 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-all group">
          <div className="w-9 h-9 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700 transition-colors overflow-hidden">
            <img src="https://picsum.photos/seed/user/100/100" alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Danny Rico</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`
      flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 group
      ${active 
        ? 'bg-red-500/10 text-red-600 shadow-sm font-semibold' 
        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5'}
    `}>
      <span className={`${active ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-inherit'}`}>
        {icon}
      </span>
      <span className="text-sm">{label}</span>
    </div>
  );
}


