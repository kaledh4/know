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
import { RefreshCw } from 'lucide-react';
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
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col bg-surface border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Daily Knowledge Analysis</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              AI-generated insights and flashcards based on your recent activity.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 p-6 border border-white/10 rounded-2xl bg-black/50">
            {isLoadingAnalysis ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Spinner size="large" />
                <p className="text-muted-foreground">Loading latest insights...</p>
              </div>
            ) : (
              <div className="whitespace-pre-wrap font-sans text-lg leading-relaxed text-muted-foreground">
                {analysisContent}
              </div>
            )}
          </ScrollArea>
          <div className="flex justify-end pt-4">
            <Button variant="outline" size="sm" onClick={fetchLatestAnalysis} className="border-white/10 hover:bg-white/5">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex min-h-screen flex-col bg-background text-white">
        <Header
          onNewEntry={() => setIsEntryDialogOpen(true)}
          onSearch={handleSearch}
          onAnalyze={fetchLatestAnalysis}
        />
        <main className="flex-1">
          <div className="container mx-auto max-w-7xl px-4 py-8">
            {!user ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-accentBlue to-accentPurple">
                  Welcome to KnowledgeVerse
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md text-lg">
                  Your premium personal knowledge base. Sign in to start building your legacy.
                </p>
                <Button
                  onClick={() => setIsAuthDialogOpen(true)}
                  className="bg-accentBlue hover:bg-accentBlue/80 text-white px-8 py-6 text-lg rounded-2xl shadow-lg shadow-accentBlue/20"
                >
                  Get Started
                </Button>
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
