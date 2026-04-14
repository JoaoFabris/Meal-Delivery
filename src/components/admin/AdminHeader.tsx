'use client';

import { signOut } from 'next-auth/react';
import { LogOut, Menu, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const initials =
    user.name
      ?.split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() ?? 'AD';

  return (
    <header className="h-16 bg-white border-b border-[var(--color-border)] flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu placeholder */}
        <button className="lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-sm font-bold text-[var(--color-text-primary)]">
            Painel Administrativo
          </h1>
          <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 ring-2 ring-[var(--color-brand)]/30">
            <AvatarImage src={user.image ?? ''} />
            <AvatarFallback className="bg-[var(--color-brand)] text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none">
              {user.name?.split(' ')[0]}
            </p>
            <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-[var(--color-brand)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-brand)]">
              <ShieldCheck className="h-3 w-3" />
              Admin
            </span>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
