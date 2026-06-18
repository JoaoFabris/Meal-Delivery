'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  User,
  LogOut,
  Heart,
  ClipboardList,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CartSheet } from '@/components/cart/CartSheet';


export function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const isLoggedIn = !!session;

  const isAdmin = user?.isAdmin;
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(window.location.search)
    if (!search.trim()) {
      params.delete('search')
    } else {
      params.set('search', search.trim())
    }
    router.push(`/?${params.toString()}`)
  }

  function handleLogout() {
    signOut({ callbackUrl: '/' });
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[var(--color-border)] shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-1.5">
          <span className="text-2xl font-black tracking-tight text-[var(--color-brand)]">
            food
          </span>
          <span className="text-2xl font-black tracking-tight text-[var(--color-text-primary)]">
            app
          </span>
        </Link>

        {/* Search desktop */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-xl mx-4"
        >
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar pratos, cuisines..."
              className="w-full h-10 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] pl-10 pr-4 text-sm outline-none transition-all focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10"
            />
          </div>
        </form>
        {/* Ações */}
        <div className="ml-auto flex items-center gap-2">
          {isAdmin && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-brand)]">
              <ShieldCheck className="h-5 w-5" />
              Admin
            </span>
          )}

          {isLoggedIn && <CartSheet />}

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-[var(--color-brand)]/30 transition-all">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name ?? ''}
                      className="h-8 w-8 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[var(--color-brand)] text-white text-xs font-bold">
                        {user?.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span className="hidden sm:block text-sm font-medium pr-1">
                    {user?.name?.split(' ')[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-white">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {user?.email}
                  </p>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 mt-1.5 rounded-full bg-[var(--color-brand)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-brand)]">
                      <ShieldCheck className="h-3 w-3" />
                      Administrador
                    </span>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Heart className="h-4 w-4" /> Favoritos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile?tab=orders"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <ClipboardList className="h-4 w-4" /> Meus pedidos
                  </Link>
                </DropdownMenuItem>

                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 cursor-pointer font-medium text-[var(--color-brand)]"
                      >
                        <ShieldCheck className="h-4 w-4" /> Painel Admin
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Entrar</span>
            </Link>
          )}
        </div>
      </div>

      {/* Busca mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t px-4 py-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar pratos..."
                className="w-full h-10 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] pl-10 pr-4 text-sm outline-none focus:border-[var(--color-brand)]"
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
