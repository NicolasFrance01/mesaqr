'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Utensils, History, Package, LogOut, Bell, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Mesas', href: '/dashboard/mesas', icon: Utensils },
    { name: 'Pedidos', href: '/dashboard/pedidos', icon: Package },
    { name: 'Cocina', href: '/dashboard/cocina', icon: ChefHat },
    { name: 'Historial', href: '/dashboard/historial', icon: History },
];

export function Sidebar() {
    const pathname = usePathname();
    const { notificaciones, pedidos } = useApp();

    // Calculate alerts
    const activeOrdersCount = pedidos.filter(p =>
        p.estado === 'pendiente' || p.estado === 'en_preparacion' || p.estado === 'listo_para_entregar'
    ).length;

    const kitchenPendingCount = pedidos.filter(p => p.estado === 'en_preparacion').length;

    const unreadCount = notificaciones.filter(n => !n.leido).length;

    return (
        <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <div className="flex h-20 items-center justify-center border-b border-slate-200 px-6 dark:border-slate-800">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Mesa<span className="text-orange-500">QR</span>
                </h1>
            </div>

            <nav className="flex-1 space-y-1 px-4 py-6">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    // Determine if we need a badge
                    let showBadge = false;
                    if (item.name === 'Pedidos' && activeOrdersCount > 0) showBadge = true;
                    if (item.name === 'Cocina' && kitchenPendingCount > 0) showBadge = true;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative",
                                isActive
                                    ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                            )}
                        >
                            <div className="relative">
                                <item.icon className={cn("h-5 w-5", isActive ? "text-orange-600" : "text-slate-500")} />
                                {showBadge && (
                                    <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950" />
                                )}
                            </div>
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Notifications Indicator */}
            <div className="px-4 py-2">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                        <Bell className="h-4 w-4" />
                        Notificaciones
                    </div>
                    {unreadCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </div>

            <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400">
                    <LogOut className="h-5 w-5" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
