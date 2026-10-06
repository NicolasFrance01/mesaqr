'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Utensils, History, Package, LogOut, Bell, ChefHat, ChevronLeft, ChevronRight } from 'lucide-react';
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
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Calculate alerts
    const activeOrdersCount = pedidos.filter(p =>
        p.estado === 'pendiente' || p.estado === 'en_preparacion' || p.estado === 'listo_para_entregar'
    ).length;

    const kitchenPendingCount = pedidos.filter(p => p.estado === 'en_preparacion').length;
    const unreadCount = notificaciones.filter(n => !n.leido).length;

    return (
        <div className={cn(
            "sticky top-0 flex h-screen flex-col border-r border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Header / Logo */}
            <div className="relative flex h-20 items-center justify-center border-b border-slate-200 dark:border-neutral-800">
                <h1 className={cn(
                    "font-bold tracking-tight text-slate-900 dark:text-white transition-all overflow-hidden whitespace-nowrap",
                    isCollapsed ? "text-xl w-0 opacity-0" : "text-2xl w-full text-center opacity-100 px-6"
                )}>
                    Mesa<span className="text-orange-500">QR</span>
                </h1>
                
                {/* Collapse button */}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-900 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-white"
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-6 overflow-hidden">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    let showBadge = false;
                    if (item.name === 'Pedidos' && activeOrdersCount > 0) showBadge = true;
                    if (item.name === 'Cocina' && kitchenPendingCount > 0) showBadge = true;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            title={isCollapsed ? item.name : undefined}
                            className={cn(
                                "flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors relative",
                                isCollapsed ? "justify-center px-2" : "px-3",
                                isActive
                                    ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200"
                            )}
                        >
                            <div className="relative flex-shrink-0">
                                <item.icon className={cn("h-5 w-5", isActive ? "text-orange-600" : "text-slate-500 dark:text-neutral-500")} />
                                {showBadge && (
                                    <span className={cn(
                                        "absolute block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-neutral-950",
                                        isCollapsed ? "-top-1 -right-1" : "-top-1 -right-1"
                                    )} />
                                )}
                            </div>
                            {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Notifications Indicator */}
            <div className="px-3 py-2">
                <div className={cn(
                    "flex items-center rounded-lg bg-slate-50 py-3 dark:bg-neutral-900 transition-all",
                    isCollapsed ? "justify-center px-0" : "justify-between px-3"
                )}
                title={isCollapsed ? "Notificaciones" : undefined}
                >
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-neutral-400">
                        <Bell className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && <span>Notificaciones</span>}
                    </div>
                    {unreadCount > 0 && (
                        <span className={cn(
                            "flex items-center justify-center rounded-full bg-red-500 font-bold text-white",
                            isCollapsed ? "absolute top-2 right-2 h-4 w-4 text-[9px]" : "h-5 w-5 text-[10px]"
                        )}>
                            {unreadCount}
                        </span>
                    )}
                </div>
            </div>

            <div className="border-t border-slate-200 p-3 dark:border-neutral-800">
                <button 
                    title={isCollapsed ? "Cerrar Sesión" : undefined}
                    className={cn(
                        "flex w-full items-center gap-3 rounded-lg py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-900/20 dark:hover:text-red-400",
                        isCollapsed ? "justify-center px-2" : "px-3"
                    )}
                >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>Cerrar Sesión</span>}
                </button>
            </div>
        </div>
    );
}
