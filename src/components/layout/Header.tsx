'use client';

import { useState } from 'react';
import Logo from './Logo';
import { Button } from '../ui/button';
import { PlusCircle, Search as SearchIcon, Menu, X, BrainCircuit } from 'lucide-react';
import type { KnowledgeEntry } from '@/lib/types';
import Search from '../knowledge/Search';
import { cn } from '@/lib/utils';

type HeaderProps = {
  onNewEntry: () => void;
  onSearch: (results: KnowledgeEntry[] | null) => void;
  onAnalyze: () => void;
};

export default function Header({ onNewEntry, onSearch, onAnalyze }: HeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (showSearch) setShowSearch(false);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (isExpanded) setIsExpanded(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-background/40 backdrop-blur-2xl shadow-2xl">
      <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Logo />

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 items-center justify-center px-12">
          <div className="w-full max-w-2xl">
            <Search onSearch={onSearch} />
          </div>
        </div>

        {/* Mobile Search (Expandable) */}
        <div
          className={cn(
            'md:hidden absolute left-0 right-0 top-20 bg-background/90 backdrop-blur-xl border-b border-white/10 transition-all duration-300 ease-in-out',
            showSearch ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
          )}
        >
          <div className="container mx-auto px-6 py-6">
            <Search onSearch={onSearch} />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              size="lg"
              onClick={onNewEntry}
              className="bg-accentBlue hover:bg-accentBlue/80 text-white rounded-xl px-6 font-bold shadow-lg shadow-accentBlue/20 transition-all active:scale-95"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              ADD
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={onAnalyze}
              className="border-white/10 hover:bg-white/5 rounded-xl px-6 font-bold transition-all active:scale-95"
            >
              <BrainCircuit className="mr-2 h-5 w-5" />
              Analyze
            </Button>
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden relative flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleSearch}
              className={cn('h-11 w-11 rounded-xl transition-colors', showSearch && 'bg-white/10 text-white')}
            >
              <SearchIcon className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={toggleExpanded}
              className={cn('h-11 w-11 rounded-xl transition-colors', isExpanded && 'bg-white/10 text-white')}
            >
              {isExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Mobile Menu */}
            <div
              className={cn(
                'absolute right-0 top-14 bg-surface/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 ease-in-out min-w-[200px] z-50 p-2',
                isExpanded
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
              )}
            >
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  onClick={() => {
                    onNewEntry();
                    setIsExpanded(false);
                  }}
                  className="w-full justify-start rounded-xl h-12 font-bold"
                >
                  <PlusCircle className="mr-3 h-5 w-5 text-accentBlue" />
                  ADD NEW
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => {
                    onAnalyze();
                    setIsExpanded(false);
                  }}
                  className="w-full justify-start rounded-xl h-12 font-bold"
                >
                  <BrainCircuit className="mr-3 h-5 w-5 text-accentPink" />
                  AI ANALYZE
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
