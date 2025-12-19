'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';
import type { KnowledgeEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getSupabaseClient } from '@/lib/supabase';
import { Trash2 } from 'lucide-react';
import { Spinner } from '../ui/spinner';

type DeleteConfirmationDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  entry: KnowledgeEntry;
  onSuccess: () => void;
};

export default function DeleteConfirmationDialog({
  isOpen,
  setIsOpen,
  entry,
  onSuccess,
}: DeleteConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const supabase = getSupabaseClient();

  const handleDelete = async () => {
    if (!supabase) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', entry.id);

      if (error) throw error;

      toast({
        title: 'Entry Deleted',
        description: 'The entry has been removed from your vault.',
      });
      onSuccess();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Failed to delete entry:', error);
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Could not delete the entry. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-[500px] bg-surface/95 backdrop-blur-2xl border-white/10 text-white rounded-[2.5rem] p-10 shadow-2xl">
        <AlertDialogHeader className="space-y-4">
          <AlertDialogTitle className="text-3xl font-bold tracking-tight text-white">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-lg leading-relaxed">
            This action cannot be undone. This will permanently delete the entry
            <span className="font-bold text-white"> &quot;{entry.title}&quot; </span>
            and remove its data from your vault.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-10 gap-4">
          <AlertDialogCancel disabled={isLoading} className="rounded-xl border-white/10 hover:bg-white/5 px-8 py-6 text-lg font-bold transition-all">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            asChild
            onClick={handleDelete}
            disabled={isLoading}
          >
            <Button variant="destructive" className="rounded-xl px-8 py-6 text-lg font-bold shadow-lg shadow-destructive/20 transition-all active:scale-95">
              {isLoading ? <Spinner className="mr-2 h-5 w-5" /> : <Trash2 className="mr-2 h-5 w-5" />}
              Delete Entry
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
