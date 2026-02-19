import React from 'react';
import { Home, LayoutGrid, Radio, Library, Search, Settings } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 h-16 glass rounded-2xl flex items-center justify-around px-2 z-50 shadow-2xl transition-all duration-500">
      <MobileNavItem icon={<Home size={22} />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
      <MobileNavItem icon={<LayoutGrid size={22} />} label="New" active={activeTab === 'new'} onClick={() => setActiveTab('new')} />
      <MobileNavItem icon={<Radio size={22} />} label="Radio" active={activeTab === 'radio'} onClick={() => setActiveTab('radio')} />
      <MobileNavItem icon={<Library size={22} />} label="Library" active={activeTab === 'library'} onClick={() => setActiveTab('library')} />
      <MobileNavItem icon={<Settings size={22} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
    </div>
  );
}

function MobileNavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${active ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'}`}
    >
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-tighter">{label}</span>
    </div>
  );
}


