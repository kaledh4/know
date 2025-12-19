'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Link as LinkIcon, ExternalLink, Copy } from 'lucide-react';
import type { KnowledgeEntry } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getTagColors, TagColor } from '@/lib/tagService';
import { getTagColorClasses } from '@/lib/tag-utils';

type ViewEntryDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  entry: KnowledgeEntry;
};

export default function ViewEntryDialog({ isOpen, setIsOpen, entry }: ViewEntryDialogProps) {
  const Icon = entry.type === 'TEXT' ? FileText : LinkIcon;
  const [userTagColors, setUserTagColors] = useState<Record<string, TagColor>>({});

  useEffect(() => {
    if (isOpen) {
      const loadColors = async () => {
        try {
          const colors = await getTagColors();
          setUserTagColors(colors);
        } catch (error) {
          console.error('Failed to load tag colors:', error);
        }
      };
      loadColors();
    }
  }, [isOpen]);

  // Function to detect if text is Arabic
  const isArabic = (text: string): boolean => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text || '');
  };

  // Determine text direction based on content
  const textDirection = isArabic(entry.title) || isArabic(entry.content) ? 'rtl' : 'ltr';

  // Safely format the date with validation and proper timezone handling
  const getTimeAgo = () => {
    try {
      const utcDate = new Date(entry.created_at);
      if (isNaN(utcDate.getTime())) return 'Unknown time';
      return formatDistanceToNow(utcDate, { addSuffix: true, includeSeconds: false });
    } catch (error) {
      return 'Unknown time';
    }
  };

  const timeAgo = getTimeAgo();
  const { toast } = useToast();

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(entry.content || '');
      toast({
        title: 'Content Copied',
        description: 'The content has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Could not copy content to clipboard.',
      });
    }
  };

  const isLink = entry.type !== 'TEXT';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] flex flex-col bg-surface/95 backdrop-blur-2xl border-white/10 text-white rounded-[2.5rem] overflow-hidden p-0 shadow-2xl" dir={textDirection}>
        <DialogHeader className="flex-shrink-0 p-10 pb-6 border-b border-white/5">
          <div className={cn(
            "flex items-start justify-between gap-6",
            textDirection === 'rtl' ? "flex-row-reverse text-right" : ""
          )}>
            <div className={cn(
              "flex items-center gap-4",
              textDirection === 'rtl' && "flex-row-reverse"
            )}>
              <div className="bg-accentBlue/20 p-3 rounded-2xl border border-accentBlue/30">
                <Icon className="h-7 w-7 text-accentBlue" />
              </div>
              <DialogTitle className={cn(
                "text-3xl md:text-4xl font-bold tracking-tight text-white",
                textDirection === 'rtl' ? "font-arabic" : "font-headline"
              )}>
                {entry.title || 'Untitled'}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className={cn(
            "flex items-center gap-2 text-base text-muted-foreground pt-4",
            textDirection === 'rtl' && "flex-row-reverse"
          )}>
            <span className="font-medium">Added {timeAgo}</span>
          </DialogDescription>
        </DialogHeader>

        <div className={cn(
          "flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar",
          textDirection === 'rtl' ? "text-right" : "text-left"
        )}>
          {/* Content Section */}
          <div className="space-y-6">
            <div className={cn(
              "flex items-center justify-between",
              textDirection === 'rtl' && "flex-row-reverse"
            )}>
              <h4 className="text-xl font-bold text-white tracking-tight">Content</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyContent}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <Copy className="h-4 w-4" />
                Copy Content
              </Button>
            </div>
            <div className="rounded-[1.5rem] border border-white/5 bg-white/5 p-8 shadow-inner">
              <p className={cn(
                "text-xl leading-relaxed text-muted-foreground/90 whitespace-pre-wrap select-text",
                textDirection === 'rtl' ? "font-arabic" : "font-body"
              )}>
                {entry.content}
              </p>
            </div>
          </div>

          {/* URL Section */}
          {isLink && entry.url && (
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-white tracking-tight">Source Link</h4>
              <div className={cn(
                "flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5",
                textDirection === 'rtl' && "flex-row-reverse"
              )}>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.open(entry.url, '_blank')}
                  className="flex items-center gap-2 rounded-xl border-white/10 hover:bg-white/10 font-bold"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Source
                </Button>
                <span className="text-sm text-muted-foreground truncate select-text font-medium">
                  {entry.url}
                </span>
              </div>
            </div>
          )}

          {/* Tags Section */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-white tracking-tight">Tags</h4>
              <div className={cn(
                "flex flex-wrap gap-3",
                textDirection === 'rtl' && "justify-end"
              )}>
                {entry.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn(
                      getTagColorClasses(tag, userTagColors),
                      "px-5 py-2 text-sm font-bold rounded-xl transition-all duration-300 hover:scale-105 cursor-default border-white/10"
                    )}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-white/5 bg-black/20 flex justify-end">
          <Button
            onClick={() => setIsOpen(false)}
            className="bg-accentBlue hover:bg-accentBlue/80 text-white rounded-xl px-8 py-6 text-lg font-bold shadow-lg shadow-accentBlue/20 transition-all active:scale-95"
          >
            Close View
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}