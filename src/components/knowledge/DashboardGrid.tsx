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
            className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 md:p-8"
        >
            {/* Featured Reading Mode Tile */}
            <motion.div
                variants={item}
                className="md:col-span-2 md:row-span-2 relative group cursor-pointer overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-accentBlue/20 to-accentPurple/20 border border-white/10 p-10 flex flex-col justify-between hover:border-accentBlue/50 transition-all duration-500 shadow-2xl shadow-accentBlue/10"
                onClick={onStartReading}
            >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BookOpen size={220} className="text-accentBlue" />
                </div>

                <div className="relative z-10">
                    <div className="bg-accentBlue/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-10 border border-accentBlue/30">
                        <BookOpen className="text-accentBlue h-8 w-8" />
                    </div>
                    <h2 className="text-5xl font-bold text-white mb-6 tracking-tight">Reading Mode</h2>
                    <p className="text-muted-foreground text-xl max-w-xs leading-relaxed">
                        Immerse yourself in your knowledge base with a zen-like experience.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-6">
                    <div className="text-sm font-semibold px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/80 backdrop-blur-md">
                        {entryCount} Entries Available
                    </div>
                    <Button className="bg-accentBlue hover:bg-accentBlue/80 text-white rounded-2xl px-10 py-7 text-xl font-bold shadow-lg shadow-accentBlue/30 transition-all hover:scale-105 active:scale-95">
                        Start Reading
                    </Button>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                variants={item}
                className="group cursor-pointer rounded-[2.5rem] bg-surface/40 backdrop-blur-xl border border-white/10 p-8 flex flex-col justify-between hover:border-accentPurple/50 transition-all duration-300 hover:bg-surface/60"
                onClick={onNewEntry}
            >
                <div className="bg-accentPurple/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-accentPurple/30">
                    <Plus className="text-accentPurple h-7 w-7" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">New Entry</h3>
                    <p className="text-muted-foreground">Capture a new thought</p>
                </div>
            </motion.div>

            <motion.div
                variants={item}
                className="group cursor-pointer rounded-[2.5rem] bg-surface/40 backdrop-blur-xl border border-white/10 p-8 flex flex-col justify-between hover:border-accentPink/50 transition-all duration-300 hover:bg-surface/60"
                onClick={onAnalyze}
            >
                <div className="bg-accentPink/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-accentPink/30">
                    <Sparkles className="text-accentPink h-7 w-7" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">AI Insights</h3>
                    <p className="text-muted-foreground">Generate daily analysis</p>
                </div>
            </motion.div>

            <motion.div
                variants={item}
                className="group cursor-pointer rounded-[2.5rem] bg-surface/40 backdrop-blur-xl border border-white/10 p-8 flex flex-col justify-between hover:border-white/30 transition-all duration-300 hover:bg-surface/60"
                onClick={onSearch}
            >
                <div className="bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                    <Search className="text-white h-7 w-7" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Search</h3>
                    <p className="text-muted-foreground">Find specific knowledge</p>
                </div>
            </motion.div>

            <motion.div
                variants={item}
                className="group cursor-pointer rounded-[2.5rem] bg-surface/40 backdrop-blur-xl border border-white/10 p-8 flex flex-col justify-between hover:border-white/30 transition-all duration-300 hover:bg-surface/60"
                onClick={onViewTags}
            >
                <div className="bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                    <Layers className="text-white h-7 w-7" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Tags</h3>
                    <p className="text-muted-foreground">Organize by categories</p>
                </div>
            </motion.div>

            {/* Stats/Secondary Tiles */}
            <motion.div
                variants={item}
                className="md:col-span-2 rounded-[2.5rem] bg-surface/40 backdrop-blur-xl border border-white/10 p-10 flex items-center gap-10 hover:border-white/20 transition-all duration-300"
            >
                <div className="bg-accentBlue/10 p-6 rounded-[1.5rem] border border-accentBlue/20">
                    <BarChart3 className="text-accentBlue h-12 w-12" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-end mb-5">
                        <h3 className="text-2xl font-bold text-white">Knowledge Growth</h3>
                        <span className="text-accentBlue text-sm font-black tracking-wider uppercase">+12% this week</span>
                    </div>
                    <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '65%' }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="bg-gradient-to-r from-accentBlue to-accentPurple h-full rounded-full shadow-[0_0_20px_rgba(62,99,221,0.4)]"
                        />
                    </div>
                </div>
            </motion.div>

            <motion.div
                variants={item}
                className="group cursor-pointer rounded-[2.5rem] bg-surface/40 backdrop-blur-xl border border-white/10 p-8 flex flex-col justify-between hover:border-white/30 transition-all duration-300 hover:bg-surface/60"
                onClick={onViewHistory}
            >
                <div className="bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                    <History className="text-white h-7 w-7" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">History</h3>
                    <p className="text-muted-foreground">Recent activity</p>
                </div>
            </motion.div>

            <motion.div
                variants={item}
                className="group cursor-pointer rounded-[2.5rem] bg-surface/40 backdrop-blur-xl border border-white/10 p-8 flex flex-col justify-between hover:border-white/30 transition-all duration-300 hover:bg-surface/60"
            >
                <div className="bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                    <Settings className="text-white h-7 w-7" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Settings</h3>
                    <p className="text-muted-foreground">Preferences & Account</p>
                </div>
            </motion.div>
        </motion.div>
    );
}
