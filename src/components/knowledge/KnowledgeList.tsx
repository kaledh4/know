'use client';

import { useState, useEffect, useCallback } from 'react';
import { KnowledgeEntry } from '@/lib/types';
import { getSupabaseClient } from '@/lib/supabase';
import KnowledgeCard from './KnowledgeCard';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { Inbox, ChevronLeft, ChevronRight, RefreshCw, Sparkles } from 'lucide-react';
import { getTagColors, TagColor } from '@/lib/tagService';
import { cn } from '@/lib/utils';

type KnowledgeListProps = {
  searchResults: KnowledgeEntry[] | null;
  onDataChange: () => void;
  refreshKey: number;
};

const PAGE_SIZE = 24;

interface UsePaginatedEntriesResult {
  entries: KnowledgeEntry[];
  isLoading: boolean;
  error: Error | null;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  totalCount: number;
}

function usePaginatedEntries(refreshKey: number): UsePaginatedEntriesResult {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = getSupabaseClient();

  const loadEntries = useCallback(async () => {
    if (!supabase) return;

    try {
      setIsLoading(true);

      // Get total count first
      const { count, error: countError } = await supabase
        .from('entries')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setTotalCount(count || 0);

      // Get paginated data
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error: dataError } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (dataError) throw dataError;
      setEntries(data as KnowledgeEntry[]);
      setError(null);
    } catch (err: any) {
      console.error('Error loading entries:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshKey, currentPage, supabase]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    entries,
    isLoading,
    error,
    currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    goToPage,
    nextPage,
    prevPage,
    totalCount,
  };
}

export default function KnowledgeList({ searchResults, onDataChange, refreshKey }: KnowledgeListProps) {
  const {
    entries,
    isLoading,
    error,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage,
    totalCount
  } = usePaginatedEntries(refreshKey);

  const [userTagColors, setUserTagColors] = useState<Record<string, TagColor>>({});

  useEffect(() => {
    const loadColors = async () => {
      try {
        const colors = await getTagColors();
        setUserTagColors(colors);
      } catch (error) {
        console.error('Failed to load tag colors:', error);
      }
    };
    loadColors();
  }, [refreshKey]);

  if (isLoading && entries.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  if (error && entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-destructive/50 py-20 text-center">
        <h2 className="mt-4 font-headline text-2xl font-semibold text-destructive">Error Loading Entries</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  const entriesToShow = searchResults ?? entries;

  if (entriesToShow.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-white/10 py-32 text-center bg-surface/20 backdrop-blur-xl">
        <div className="bg-white/5 p-8 rounded-3xl mb-6">
          <Inbox className="h-20 w-20 text-muted-foreground/30" />
        </div>
        <h2 className="font-headline text-3xl font-bold text-white mb-3">Your Vault is Empty</h2>
        <p className="text-muted-foreground text-xl max-w-md">
          {searchResults === null ? "Add your first piece of knowledge to get started on your journey." : "No results found for your search. Try different keywords or tags."}
        </p>
      </div>
    );
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {entriesToShow.map(entry => (
          <KnowledgeCard
            key={entry.id}
            entry={entry}
            onUpdate={onDataChange}
            onDelete={onDataChange}
            tagColors={userTagColors}
          />
        ))}
      </div>

      {/* Pagination Controls - only show for non-search results and when there are multiple pages */}
      {searchResults === null && totalPages > 1 && (
        <div className="flex flex-col items-center gap-6 pt-8 border-t border-white/5">
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={prevPage}
              disabled={!hasPrevPage}
              className="flex items-center gap-2 rounded-xl border-white/10 hover:bg-white/5 px-6"
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {getPageNumbers().map(pageNum => (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="lg"
                  onClick={() => goToPage(pageNum)}
                  className={cn(
                    "min-w-[50px] rounded-xl font-bold transition-all",
                    pageNum === currentPage ? "bg-accentBlue text-white shadow-lg shadow-accentBlue/20" : "border-white/10 hover:bg-white/5"
                  )}
                >
                  {pageNum}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={nextPage}
              disabled={!hasNextPage}
              className="flex items-center gap-2 rounded-xl border-white/10 hover:bg-white/5 px-6"
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="text-sm font-medium text-muted-foreground bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
            Showing {((currentPage - 1) * PAGE_SIZE) + 1}-{Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} entries
          </div>
        </div>
      )}
    </div>
  );
}
