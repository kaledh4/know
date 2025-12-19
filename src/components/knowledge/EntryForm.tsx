'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { getSupabaseClient } from '@/lib/supabase';
import { type KnowledgeEntry } from '@/lib/types';
import { getTagColorClasses } from '@/lib/tag-utils';
import { createKnowledgeEntry, updateKnowledgeEntry } from '@/lib/knowledge-actions';
import { getUserTags, getTagColors, Tag, TagColor } from '@/lib/tagService';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '../ui/spinner';
import { X, Plus, Edit } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, {
    message: 'Content cannot be empty.',
  }),
  tags: z.array(z.string()),
});

type EntryFormProps = {
  entry?: KnowledgeEntry;
  onSuccess: () => void;
  initialData?: { title?: string; text?: string; url?: string } | null;
};

export default function EntryForm({ entry, onSuccess, initialData }: EntryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [userTagColors, setUserTagColors] = useState<Record<string, TagColor>>({});
  const { toast } = useToast();
  const supabase = getSupabaseClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: [],
    },
  });

  // Function to detect if text is Arabic
  const isArabic = (text: string): boolean => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text || '');
  };

  const titleValue = form.watch('title');
  const contentValue = form.watch('content');
  const isTitleArabic = isArabic(titleValue || '');
  const isContentArabic = isArabic(contentValue || '');

  useEffect(() => {
    if (entry) {
      form.setValue('title', entry.title || '');
      form.setValue('content', entry.content || '');
      form.setValue('tags', entry.tags || []);
    } else if (initialData) {
      form.setValue('title', initialData.title || '');
      form.setValue('content', initialData.text || initialData.url || '');
      form.setValue('tags', []);
    }
  }, [entry, initialData, form]);

  useEffect(() => {
    const loadTagsAndColors = async () => {
      try {
        const [tags, colors] = await Promise.all([
          getUserTags(),
          getTagColors()
        ]);
        setAvailableTags(tags);
        setUserTagColors(colors);
      } catch (error) {
        console.error('Failed to load tags data:', error);
      }
    };
    loadTagsAndColors();
  }, []);

  const addTag = (tagToAdd: string) => {
    if (!tagToAdd.trim()) return;
    const currentTags = form.getValues('tags') || [];
    const normalizedTag = tagToAdd.trim();

    // Case-insensitive duplicate check
    if (!currentTags.some(t => t.toLowerCase() === normalizedTag.toLowerCase())) {
      form.setValue('tags', [...currentTags, normalizedTag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!supabase) {
      toast({
        variant: 'destructive',
        title: 'Configuration Error',
        description: 'Please configure Supabase in settings first.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      if (entry) {
        await updateKnowledgeEntry(entry.id, {
          title: values.title,
          content: values.content,
          tags: values.tags,
        }, user.id);
      } else {
        await createKnowledgeEntry({
          title: values.title || '',
          textForEmbedding: values.content,
          contentType: 'TEXT',
          tags: values.tags,
        }, user.id);
      }

      toast({
        title: entry ? 'Update Successful' : 'Entry Added',
        description: 'Your knowledge vault has been updated.',
      });
      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: error.message || 'Could not save the entry.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const currentTags = form.watch('tags');
  const suggestedTags = availableTags.filter(tag =>
    !currentTags.some(t => t.toLowerCase() === tag.name.toLowerCase())
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-bold text-white mb-2 block">Title (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Entry Title"
                  {...field}
                  className={cn(
                    "bg-white/5 border-white/10 h-14 text-xl rounded-xl transition-all focus:ring-2 focus:ring-accentBlue/20 focus:border-accentBlue/50",
                    isTitleArabic ? "font-arabic text-right" : "font-body"
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-bold text-white mb-2 block">Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Paste your text, links, or thoughts here..."
                  className={cn(
                    "min-h-[200px] resize-y bg-white/5 border-white/10 text-lg leading-relaxed p-6 rounded-xl transition-all focus:ring-2 focus:ring-accentBlue/20 focus:border-accentBlue/50",
                    isContentArabic ? "font-arabic text-right" : "font-body"
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-bold text-white mb-2 block">Tags</FormLabel>
              <FormControl>
                <div className="space-y-6">
                  {/* Selected Tags */}
                  {field.value.length > 0 && (
                    <div className="flex flex-wrap gap-3 p-1">
                      {field.value.map((tag) => (
                        <Badge
                          key={tag}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl cursor-default border-white/10",
                            getTagColorClasses(tag, userTagColors)
                          )}
                          variant="outline"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:bg-white/20 rounded-full p-1 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Suggested Tags */}
                  {suggestedTags.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-sm font-black tracking-widest uppercase text-muted-foreground">Suggested Tags</p>
                      <ScrollArea className="h-40 w-full rounded-2xl border border-white/5 bg-white/5 p-4 custom-scrollbar">
                        <div className="flex flex-wrap gap-3">
                          {suggestedTags.map((tag) => (
                            <Badge
                              key={tag.name}
                              variant="outline"
                              className={cn(
                                "px-4 py-2 text-sm font-bold rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 border-white/10",
                                getTagColorClasses(tag.name, userTagColors)
                              )}
                              onClick={() => addTag(tag.name)}
                            >
                              <Plus className="mr-1.5 h-3.5 w-3.5" />
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full h-16 text-xl font-bold rounded-2xl bg-accentBlue hover:bg-accentBlue/80 text-white shadow-xl shadow-accentBlue/20 transition-all active:scale-95"
            disabled={isLoading}
          >
            {isLoading ? <Spinner className="mr-3 h-6 w-6" /> : (entry ? <Edit className="mr-3 h-6 w-6" /> : <Plus className="mr-3 h-6 w-6" />)}
            {entry ? 'Save Changes' : 'Add to Vault'}
          </Button>
        </div>
      </form>
    </Form>
  );
}