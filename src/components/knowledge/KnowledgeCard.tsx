'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Link as LinkIcon, FileText } from 'lucide-react';
import type { KnowledgeEntry } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import EntryDialog from './EntryDialog';
import ViewEntryDialog from './ViewEntryDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import { cn } from '@/lib/utils';
import { TagColor } from '@/lib/tagService';
import { getTagColorClasses, getCardStyles } from '@/lib/tag-utils';

type KnowledgeCardProps = {
  entry: KnowledgeEntry;
  onUpdate: () => void;
  onDelete: () => void;
  tagColors?: Record<string, TagColor>;
};

export default function KnowledgeCard({ entry, onUpdate, onDelete, tagColors = {} }: KnowledgeCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Function to detect if text is Arabic
  const isArabic = (text: string): boolean => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text || '');
  };

  // Determine text direction based on content
  const textDirection = isArabic(entry.title) || isArabic(entry.content) ? 'rtl' : 'ltr';

  const Icon = entry.type === 'TEXT' ? FileText : LinkIcon;

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

  const handleCardClick = () => {
    setIsViewDialogOpen(true);
  };

  const firstTag = entry.tags && entry.tags.length > 0 ? entry.tags[0] : undefined;
  const { borderColor, shadowColor, stripeColor } = getCardStyles(firstTag, tagColors);

  return (
    <>
      <EntryDialog
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        entry={entry}
        onSuccess={onUpdate}
      />
      <ViewEntryDialog
        isOpen={isViewDialogOpen}
        setIsOpen={setIsViewDialogOpen}
        entry={entry}
      />
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        entry={entry}
        onSuccess={onDelete}
      />
      <Card
        className={cn(
          "bg-surface/40 backdrop-blur-xl border border-white/10 rounded-[2rem] flex h-full transform-gpu flex-col transition-all duration-500 ease-out hover:-translate-y-2 cursor-pointer relative overflow-hidden p-2 group",
          "hover:border-accentBlue/30 hover:shadow-2xl hover:shadow-accentBlue/10",
          shadowColor
        )}
        onClick={handleCardClick}
        style={{ direction: textDirection } as React.CSSProperties}
      >
        {/* Decorative Stripe */}
        <div className={cn(
          "absolute top-0 bottom-0 w-1.5 opacity-40 transition-opacity group-hover:opacity-100",
          textDirection === 'rtl' ? "left-0" : "right-0",
          stripeColor
        )} />

        <CardHeader className="p-8 pb-4">
          <div className={cn(
            "flex items-start justify-between gap-4",
            textDirection === 'rtl' && "flex-row-reverse"
          )}>
            <CardTitle className={cn(
              "font-headline text-2xl font-bold leading-tight line-clamp-2 tracking-tight text-white group-hover:text-accentBlue transition-colors",
              textDirection === 'rtl' && "text-right font-arabic"
            )}>
              {entry.title || 'Untitled'}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 flex-shrink-0 hover:bg-white/10 rounded-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-surface/90 backdrop-blur-xl border-white/10 rounded-xl">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setIsEditDialogOpen(true);
                }} className="hover:bg-white/5 cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteDialogOpen(true);
                }} className="text-destructive focus:text-destructive hover:bg-destructive/10 cursor-pointer">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription className={cn(
            "flex items-center pt-2 text-sm text-muted-foreground",
            textDirection === 'rtl' && "flex-row-reverse"
          )}>
            <div className="bg-white/5 p-1.5 rounded-lg mr-2">
              <Icon className="h-4 w-4" />
            </div>
            <span>Added {timeAgo}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow p-8 pt-0 pb-6">
          <p className={cn(
            "text-lg leading-relaxed text-muted-foreground line-clamp-4",
            textDirection === 'rtl' && "text-right font-arabic"
          )}>
            {entry.content}
          </p>
        </CardContent>
        <CardFooter className="p-8 pt-0">
          <div className={cn(
            "flex flex-wrap gap-2",
            textDirection === 'rtl' && "justify-end"
          )}>
            {(entry.tags || []).map(tag => (
              <Badge
                key={tag}
                variant="outline"
                className={cn(
                  getTagColorClasses(tag, tagColors),
                  "px-4 py-1.5 text-xs font-bold rounded-xl transition-all duration-300 hover:scale-105 cursor-default border-white/10 bg-white/5"
                )}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
