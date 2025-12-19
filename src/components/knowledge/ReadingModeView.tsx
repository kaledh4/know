'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Type, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { KnowledgeEntry } from '@/lib/types';

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
            className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden"
        >
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10">
                        <X className="h-5 w-5" />
                    </Button>
                    <div className="text-sm text-muted-foreground font-medium">
                        Entry {currentIndex + 1} of {entries.length}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFontSize(prev => prev === 'sans' ? 'serif' : 'sans')}
                        title="Toggle Font"
                        className="hover:bg-white/10"
                    >
                        <Type className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsWide(prev => !prev)}
                        title="Toggle Width"
                        className="hover:bg-white/10"
                    >
                        {isWide ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                    </Button>
                    <div className="h-6 w-[1px] bg-white/10 mx-2" />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={prevEntry}
                        disabled={currentIndex === 0}
                        className="hover:bg-white/10"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={nextEntry}
                        disabled={currentIndex === entries.length - 1}
                        className="hover:bg-white/10"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto py-12 px-6">
                <div className={`mx-auto transition-all duration-500 ${isWide ? 'max-w-5xl' : 'max-w-3xl'}`}>
                    <AnimatePresence mode="wait">
                        <motion.article
                            key={currentEntry.id}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className={`prose prose-invert lg:prose-xl ${fontSize === 'serif' ? 'font-serif' : 'font-sans'}`}
                        >
                            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white tracking-tight">
                                {currentEntry.title}
                            </h1>

                            {currentEntry.tags && currentEntry.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {currentEntry.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-muted-foreground"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="text-muted-foreground leading-relaxed space-y-6 text-lg md:text-xl">
                                {currentEntry.content.split('\n').map((paragraph, i) => (
                                    <p key={i}>{paragraph}</p>
                                ))}
                            </div>
                        </motion.article>
                    </AnimatePresence>
                </div>
            </main>

            {/* Footer Navigation */}
            <footer className="p-6 flex justify-center gap-4 border-t border-white/10 bg-surface/30">
                <Button
                    variant="outline"
                    onClick={prevEntry}
                    disabled={currentIndex === 0}
                    className="border-white/10 hover:bg-white/5"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button
                    variant="outline"
                    onClick={nextEntry}
                    disabled={currentIndex === entries.length - 1}
                    className="border-white/10 hover:bg-white/5"
                >
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </footer>
        </motion.div>
    );
}
