'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import EntryForm from './EntryForm';
import type { KnowledgeEntry } from '@/lib/types';

type EntryDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  entry?: KnowledgeEntry;
  onSuccess: () => void;
  initialData?: { title?: string; text?: string; url?: string } | null;
};

export default function EntryDialog({ isOpen, setIsOpen, entry, onSuccess, initialData }: EntryDialogProps) {

  const handleSuccess = () => {
    onSuccess();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col bg-surface/95 backdrop-blur-2xl border-white/10 text-white rounded-[2.5rem] overflow-hidden p-0 shadow-2xl">
        <DialogHeader className="p-10 pb-6 border-b border-white/5">
          <DialogTitle className="text-3xl font-bold tracking-tight text-white">
            {entry ? 'Edit Knowledge' : 'Add to Vault'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-lg pt-2">
            {entry ? 'Update the details of this entry.' : 'Capture a new thought or link to your vault.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <EntryForm
            entry={entry}
            onSuccess={handleSuccess}
            initialData={initialData}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
