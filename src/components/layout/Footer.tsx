'use client';

import { Brain, LogOut, Tag } from 'lucide-react';
import Link from 'next/link';
import Logo from './Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <footer className="border-t border-white/5 bg-background/40 backdrop-blur-2xl mt-10">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Logo size="sm" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Your premium personal knowledge base. Securely capture and organize your thoughts.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-black tracking-widest uppercase text-white/50">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-accentBlue transition-colors">
                  Knowledge Vault
                </Link>
              </li>
              <li>
                <Link href="/customize-tags" className="text-muted-foreground hover:text-accentBlue transition-colors">
                  Customize Tags
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-sm font-black tracking-widest uppercase text-white/50">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-accentBlue" /> Smart Tagging</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-accentPurple" /> AI Insights</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black tracking-widest uppercase text-white/50">Account</h3>
            <div className="space-y-3">
              {user ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground truncate">Logged in as {user.email}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleLogout}
                    className="h-9 rounded-lg border-white/10 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-xs font-bold transition-all"
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    Logout
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Sign in to sync your knowledge.</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground font-medium">
            © 2026 KnowledgeVerse.
          </p>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
            <Brain className="h-4 w-4 text-accentPurple" />
            <span className="text-xs font-bold text-white">تم التطوير بواسطة MUXD22</span>
          </div>
        </div>
      </div>
    </footer>
  );
}