'use client';

import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Loader2, Tags as TagsIcon } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { KnowledgeEntry } from '@/lib/types';
import { getSupabaseClient } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getUserTags, getTagColors, TagColor } from '@/lib/tagService';
import { getTagColorClasses } from '@/lib/tag-utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type SearchProps = {
  onSearch: (results: KnowledgeEntry[] | null) => void;
};

export default function Search({ onSearch }: SearchProps) {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [userTagColors, setUserTagColors] = useState<Record<string, TagColor>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [tagInputValue, setTagInputValue] = useState('');
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const supabase = getSupabaseClient();

  // Load existing tags and colors
  useEffect(() => {
    const loadTagsAndColors = async () => {
      try {
        const [tags, colors] = await Promise.all([
          getUserTags(),
          getTagColors()
        ]);
        setAllTags(tags.map(t => t.name));
        setUserTagColors(colors);
      } catch (error) {
        console.error('Failed to load tags data:', error);
      }
    };
    loadTagsAndColors();
  }, []);

  const filteredTags = allTags.filter(tag =>
    tag.toLowerCase().includes(tagInputValue.toLowerCase()) &&
    !selectedTags.includes(tag)
  );

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!query.trim() && selectedTags.length === 0) {
      onSearch(null);
      return;
    }

    if (!supabase) return;

    setIsLoading(true);
    try {
      let queryBuilder = supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (query.trim()) {
        // Simple case-insensitive search on title or content
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
      }

      if (selectedTags.length > 0) {
        queryBuilder = queryBuilder.contains('tags', selectedTags);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      onSearch(data as KnowledgeEntry[]);
    } catch (error: any) {
      console.error('Search failed:', error);
      toast({
        variant: 'destructive',
        title: 'Search Error',
        description: error.message || 'Could not perform search.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSelectedTags([]);
    setTagInputValue('');
    onSearch(null);
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setTagInputValue('');
      setTagPopoverOpen(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const showClearButton = query || selectedTags.length > 0;

  return (
    <div className="w-full search-container font-body">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search-input"
                  ref={searchInputRef}
                  placeholder="Search your knowledge..."
                  className="w-full bg-white/5 border-white/10 pl-12 pr-12 h-12 rounded-xl transition-all focus:ring-2 focus:ring-accentBlue/20 focus:border-accentBlue/50 text-lg"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {isLoading ? (
                  <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-muted-foreground" />
                ) : (
                  showClearButton && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )
                )}
              </div>
            </form>
          </div>

          <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="lg" className="h-12 px-5 border-white/10 bg-white/5 hover:bg-white/10 rounded-xl font-bold">
                <TagsIcon className="h-5 w-5 mr-3 text-muted-foreground" />
                <span className="mr-2">Tags</span>
                {selectedTags.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-2 py-0.5 text-xs bg-accentBlue text-white border-none rounded-lg">
                    {selectedTags.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-4 border-white/10 bg-surface/95 backdrop-blur-2xl rounded-2xl shadow-2xl" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white">Filter by Tags</h4>
                  {selectedTags.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTags([])} className="text-xs h-7 px-2 hover:bg-white/5">
                      Clear All
                    </Button>
                  )}
                </div>

                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pb-2 border-b border-white/5">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className={cn(
                          "flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-lg border-white/10 bg-white/5",
                          getTagColorClasses(tag, userTagColors)
                        )}
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Find tags..."
                    value={tagInputValue}
                    onChange={(e) => setTagInputValue(e.target.value)}
                    className="bg-white/5 border-white/10 pl-9 h-10 rounded-lg focus:ring-accentBlue/20"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {filteredTags.length > 0 ? (
                    <div className="grid grid-cols-1 gap-1">
                      {filteredTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => addTag(tag)}
                          className="w-full text-left px-3 py-2.5 text-sm hover:bg-white/5 rounded-lg transition-colors flex items-center gap-3 group"
                        >
                          <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", userTagColors[tag]?.background_color?.replace('bg-', 'bg-') || 'bg-accentBlue')} />
                          <span className="text-muted-foreground group-hover:text-white transition-colors">{tag}</span>
                        </button>
                      ))}
                    </div>
                  ) : tagInputValue ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No tags match your search</p>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-6">Start typing to find tags</p>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            onClick={() => handleSearch()}
            size="lg"
            className="h-12 px-8 font-bold bg-accentBlue hover:bg-accentBlue/80 text-white rounded-xl shadow-lg shadow-accentBlue/20 transition-all active:scale-95"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Search'}
          </Button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden space-y-4">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="w-full bg-white/5 border-white/10 pl-12 pr-12 h-12 rounded-xl"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {showClearButton && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </form>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {allTags.slice(0, 8).map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={cn(
                "whitespace-nowrap cursor-pointer px-4 py-2 rounded-xl border-white/10 transition-all",
                selectedTags.includes(tag) ? "bg-accentBlue text-white" : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10"
              )}
              onClick={() => selectedTags.includes(tag) ? removeTag(tag) : addTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>

        <Button
          onClick={() => handleSearch()}
          className="w-full h-12 rounded-xl bg-accentBlue hover:bg-accentBlue/80 text-white font-bold shadow-lg shadow-accentBlue/20"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Search'}
        </Button>
      </div>
    </div>
  );
}
