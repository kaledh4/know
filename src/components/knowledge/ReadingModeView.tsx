'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Type, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { KnowledgeEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ReadingModeViewProps {
    entries: KnowledgeEntry[];
    initialIndex?: number;
    onClose: () => void;
}

export default function ReadingModeView({ entries, initialIndex = 0, onClose }: ReadingModeViewProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [fontSize, setFontSize] = useState<'sans' | 'serif'>('serif');
    const [isWide, setIsWide] = useState(false);

    const currentEntry = entries[currentIndex];

    const nextEntry = () => {
        if (currentIndex < entries.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const prevEntry = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextEntry();
            if (e.key === 'ArrowLeft') prevEntry();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]);

    if (!currentEntry) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden selection:bg-accentBlue/30"
        >
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-background/40 backdrop-blur-2xl z-10">
                <div className="flex items-center gap-6">
                    <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10 rounded-xl h-12 w-12">
                        <X className="h-6 w-6" />
                    </Button>
                    <div className="flex flex-col">
                        <span className="text-sm font-black tracking-widest uppercase text-accentBlue mb-0.5">Reading Mode</span>
                        <span className="text-xs text-muted-foreground font-bold">
                            Entry {currentIndex + 1} of {entries.length}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFontSize(prev => prev === 'sans' ? 'serif' : 'sans')}
                        title="Toggle Font"
                        className="hover:bg-white/10 rounded-xl h-11 w-11"
                    >
                        <Type className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsWide(prev => !prev)}
                        title="Toggle Width"
                        className="hover:bg-white/10 rounded-xl h-11 w-11"
                    >
                        {isWide ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                    </Button>
                    <div className="h-8 w-[1px] bg-white/10 mx-3" />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={prevEntry}
                        disabled={currentIndex === 0}
                        className="hover:bg-white/10 rounded-xl h-11 w-11"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={nextEntry}
                        disabled={currentIndex === entries.length - 1}
                        className="hover:bg-white/10 rounded-xl h-11 w-11"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto py-20 px-8 custom-scrollbar">
                <div className={`mx-auto transition-all duration-700 ease-in-out ${isWide ? 'max-w-6xl' : 'max-w-3xl'}`}>
                    <AnimatePresence mode="wait">
                        <motion.article
                            key={currentEntry.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className={cn(
                                "prose prose-invert lg:prose-2xl",
                                fontSize === 'serif' ? 'font-serif' : 'font-sans'
                            )}
                        >
                            <h1 className="text-5xl md:text-7xl font-bold mb-12 text-white tracking-tighter leading-tight">
                                {currentEntry.title}
                            </h1>

                            {currentEntry.tags && currentEntry.tags.length > 0 && (
                                <div className="flex flex-wrap gap-3 mb-16">
                                    {currentEntry.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="px-5 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:bg-white/10 transition-colors cursor-default"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="text-muted-foreground/90 leading-relaxed space-y-10 text-xl md:text-2xl font-medium">
                                {currentEntry.content.split('\n').map((paragraph, i) => (
                                    <p key={i} className="first-letter:text-3xl first-letter:font-bold first-letter:text-white">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </motion.article>
                    </AnimatePresence>
                </div>
            </main>

            {/* Footer Navigation */}
            <footer className="p-10 flex justify-center gap-6 border-t border-white/5 bg-background/40 backdrop-blur-2xl">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={prevEntry}
                    disabled={currentIndex === 0}
                    className="border-white/10 hover:bg-white/5 rounded-2xl px-10 py-8 text-xl font-bold transition-all active:scale-95"
                >
                    <ChevronLeft className="mr-3 h-6 w-6" /> Previous
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    onClick={nextEntry}
                    disabled={currentIndex === entries.length - 1}
                    className="border-white/10 hover:bg-white/5 rounded-2xl px-10 py-8 text-xl font-bold transition-all active:scale-95"
                >
                    Next <ChevronRight className="ml-3 h-6 w-6" />
                </Button>
            </footer>
        </motion.div>
    );
}
