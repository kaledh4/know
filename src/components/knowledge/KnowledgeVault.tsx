'use client';

import { useState, useEffect } from 'react';
import type { KnowledgeEntry } from '@/lib/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import KnowledgeList from './KnowledgeList';
import EntryDialog from './EntryDialog';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles } from 'lucide-react';
import { AuthDialog } from '@/components/auth/AuthDialog';
import DashboardGrid from './DashboardGrid';
import ReadingModeView from './ReadingModeView';
import { AnimatePresence } from 'framer-motion';

export default function KnowledgeVault() {
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [analysisContent, setAnalysisContent] = useState('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [searchResults, setSearchResults] = useState<KnowledgeEntry[] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [allEntries, setAllEntries] = useState<KnowledgeEntry[]>([]);

  const supabase = getSupabaseClient();
  const { user } = useAuth();

  useEffect(() => {
    if (user && supabase) {
      const fetchAllEntries = async () => {
        const { data, error } = await supabase
          .from('entries')
          .select('*')
          .order('created_at', { ascending: false });

        if (data) setAllEntries(data as KnowledgeEntry[]);
      };
      fetchAllEntries();
    }
  }, [user, refreshKey, supabase]);

  const handleSearch = (results: KnowledgeEntry[] | null) => {
    setSearchResults(results);
    if (results) {
      // Scroll to list if searching
      document.getElementById('knowledge-list')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  const fetchLatestAnalysis = async () => {
    if (!supabase || !user) {
      setIsAuthDialogOpen(true);
      return;
    }

    setIsAnalysisOpen(true);
    setIsLoadingAnalysis(true);
    setAnalysisContent('');

    try {
      const { data, error } = await supabase
        .from('insights')
        .select('content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setAnalysisContent(data.content);
      } else {
        setAnalysisContent('No analysis generated yet. Check back tomorrow!');
      }
    } catch (error: any) {
      console.error('Failed to fetch analysis:', error);
      setAnalysisContent('Failed to load analysis.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isReadingMode && (
          <ReadingModeView
            entries={allEntries}
            onClose={() => setIsReadingMode(false)}
          />
        )}
      </AnimatePresence>

      <EntryDialog
        isOpen={isEntryDialogOpen}
        setIsOpen={setIsEntryDialogOpen}
        onSuccess={handleDataChange}
      />

      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        onSuccess={handleDataChange}
      />

      <Dialog open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col bg-surface/95 backdrop-blur-2xl border-white/10 text-white rounded-[2.5rem] overflow-hidden p-0 shadow-2xl">
          <DialogHeader className="p-10 pb-6 border-b border-white/5">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-accentPink/20 p-3 rounded-2xl border border-accentPink/30">
                <Sparkles className="text-accentPink h-6 w-6" />
              </div>
              <DialogTitle className="text-3xl font-bold tracking-tight">Daily Knowledge Analysis</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-lg">
              AI-generated insights and flashcards based on your recent activity.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 px-10 py-8">
            {isLoadingAnalysis ? (
              <div className="flex flex-col items-center justify-center h-full space-y-6 py-20">
                <div className="relative">
                  <div className="absolute inset-0 blur-2xl bg-accentPink/20 rounded-full animate-pulse" />
                  <Spinner size="large" className="text-accentPink relative z-10" />
                </div>
                <p className="text-muted-foreground text-xl font-medium animate-pulse">Synthesizing your knowledge...</p>
              </div>
            ) : (
              <div className="whitespace-pre-wrap font-sans text-xl leading-relaxed text-muted-foreground/90 selection:bg-accentPink/30">
                {analysisContent}
              </div>
            )}
          </ScrollArea>
          <div className="p-8 border-t border-white/5 bg-black/20 flex justify-end">
            <Button
              variant="outline"
              size="lg"
              onClick={fetchLatestAnalysis}
              className="border-white/10 hover:bg-white/5 rounded-xl px-8 font-bold transition-all active:scale-95"
            >
              <RefreshCw className="mr-3 h-5 w-5" /> Refresh Analysis
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex min-h-screen flex-col bg-background text-white selection:bg-accentBlue/30">
        <Header
          onNewEntry={() => setIsEntryDialogOpen(true)}
          onSearch={handleSearch}
          onAnalyze={fetchLatestAnalysis}
        />
        <main className="flex-1">
          <div className="container mx-auto max-w-7xl px-6 py-12">
            {!user ? (
              <div className="flex flex-col items-center justify-center py-32 text-center relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accentBlue/10 rounded-full blur-[120px] -z-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accentPurple/10 rounded-full blur-[100px] -z-10" />

                <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                  Knowledge<span className="text-accentBlue">Verse</span>
                </h2>
                <p className="text-muted-foreground mb-12 max-w-2xl text-xl md:text-2xl leading-relaxed">
                  Your premium personal knowledge base. Securely capture, organize, and synthesize your thoughts with AI-powered insights.
                </p>
                <div className="flex flex-col sm:flex-row gap-6">
                  <Button
                    onClick={() => setIsAuthDialogOpen(true)}
                    className="bg-accentBlue hover:bg-accentBlue/80 text-white px-12 py-8 text-xl font-black rounded-2xl shadow-2xl shadow-accentBlue/30 transition-all hover:scale-105 active:scale-95"
                  >
                    Get Started Free
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/10 hover:bg-white/5 text-white px-12 py-8 text-xl font-bold rounded-2xl transition-all active:scale-95"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                <DashboardGrid
                  onStartReading={() => setIsReadingMode(true)}
                  onNewEntry={() => setIsEntryDialogOpen(true)}
                  onSearch={() => document.getElementById('search-input')?.focus()}
                  onAnalyze={fetchLatestAnalysis}
                  onViewHistory={() => { }}
                  onViewTags={() => { }}
                  entryCount={allEntries.length}
                />

                <div id="knowledge-list" className="pt-8">
                  <div className="flex items-center justify-between mb-8 px-4">
                    <h2 className="text-2xl font-bold">Your Knowledge Vault</h2>
                    {searchResults && (
                      <Button variant="ghost" onClick={() => setSearchResults(null)} className="text-accentPink">
                        Clear Search
                      </Button>
                    )}
                  </div>
                  <KnowledgeList
                    searchResults={searchResults}
                    onDataChange={handleDataChange}
                    refreshKey={refreshKey}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
