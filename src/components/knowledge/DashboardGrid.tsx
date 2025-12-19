'use client';

import { motion } from 'framer-motion';
import { BookOpen, Plus, Search, Sparkles, Settings, BarChart3, Layers, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardGridProps {
    onStartReading: () => void;
    onNewEntry: () => void;
    onSearch: () => void;
    onAnalyze: () => void;
    onViewHistory: () => void;
    onViewTags: () => void;
    entryCount: number;
}

export default function DashboardGrid({
    onStartReading,
    onNewEntry,
    onSearch,
    onAnalyze,
    onViewHistory,
    onViewTags,
    entryCount
}: DashboardGridProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 md:p-8"
        >
            {/* Featured Reading Mode Tile */}
            <motion.div
                variants={item}
                className="md:col-span-2 md:row-span-2 relative group cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-accentBlue/20 to-accentPurple/20 border border-white/10 p-8 flex flex-col justify-between hover:border-accentBlue/50 transition-all duration-500 shadow-2xl shadow-accentBlue/10"
                onClick={onStartReading}
            >
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                    <BookOpen size={120} className="text-accentBlue" />
                </div>

                <div className="relative z-10">
                    <div className="bg-accentBlue/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-accentBlue/30">
                        <BookOpen className="text-accentBlue" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Reading Mode</h2>
                    <p className="text-muted-foreground text-lg max-w-xs">
                        Immerse yourself in your knowledge base with a zen-like experience.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="text-sm font-medium px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                        {entryCount} Entries Available
                    </div>
                    <Button className="bg-accentBlue hover:bg-accentBlue/80 text-white rounded-xl px-6">
                        Start Reading
                    </Button>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                variants={item}
                className="group cursor-pointer rounded-3xl bg-surface border border-white/10 p-6 flex flex-col justify-between hover:border-accentPurple/50 transition-all duration-300"
                onClick={onNewEntry}
            >
                <div className="bg-accentPurple/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-accentPurple/30">
                    <Plus className="text-accentPurple" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-white mb-1">New Entry</h3>
                    <p className="text-sm text-muted-foreground">Capture a new thought</p>
                </div>
            </motion.div>

            <motion.div
                variants={item}
                className="group cursor-pointer rounded-3xl bg-surface border border-white/10 p-6 flex flex-col justify-between hover:border-accentPink/50 transition-all duration-300"
                onClick={onAnalyze}
            >
                <div className="bg-accentPink/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-accentPink/30">
                    <Sparkles className="text-accentPink" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-white mb-1">AI Insights</h3>
                    <p className="text-sm text-muted-foreground">Generate daily analysis</p>
                </div>
            </motion.div>

            <motion.div
                variants={item}
                className="group cursor-pointer rounded-3xl bg-surface border border-white/10 p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-300"
                onClick={onSearch}
            >
                <div className="bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-white/10">
                    <Search className="text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-white mb-1">Search</h3>
                    <p className="text-sm text-muted-foreground">Find specific knowledge</p>
                </div>
            </motion.div>

            <motion.div
                variants={item}
                className="group cursor-pointer rounded-3xl bg-surface border border-white/10 p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-300"
                onClick={onViewTags}
            >
                <div className="bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-white/10">
                    <Layers className="text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-white mb-1">Tags</h3>
                    <p className="text-sm text-muted-foreground">Organize by categories</p>
                </div>
            </motion.div>

            {/* Stats/Secondary Tiles */}
            <motion.div
                variants={item}
                className="md:col-span-2 rounded-3xl bg-surface border border-white/10 p-6 flex items-center gap-6 hover:border-white/20 transition-all duration-300"
            >
                <div className="bg-accentBlue/10 p-4 rounded-2xl border border-accentBlue/20">
                    <BarChart3 className="text-accentBlue h-8 w-8" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="text-lg font-semibold text-white">Knowledge Growth</h3>
                        <span className="text-accentBlue text-sm font-bold">+12% this week</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-accentBlue h-full w-[65%]" />
                    </div>
                </div>
            </motion.div>

            <motion.div
                variants={item}
                className="group cursor-pointer rounded-3xl bg-surface border border-white/10 p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-300"
                onClick={onViewHistory}
            >
                <div className="bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-white/10">
                    <History className="text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-white mb-1">History</h3>
                    <p className="text-sm text-muted-foreground">Recent activity</p>
                </div>
            </motion.div>

            <motion.div
                variants={item}
                className="group cursor-pointer rounded-3xl bg-surface border border-white/10 p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-300"
            >
                <div className="bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-white/10">
                    <Settings className="text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-white mb-1">Settings</h3>
                    <p className="text-sm text-muted-foreground">Preferences & Account</p>
                </div>
            </motion.div>
        </motion.div>
    );
}
