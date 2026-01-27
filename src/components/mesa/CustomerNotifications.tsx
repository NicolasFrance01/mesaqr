import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { Bell, X, Check, ChefHat, User, CreditCard, Star, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency } from '@/lib/utils';

// Helper to format time
const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

export function CustomerNotifications({ mesaId }: { mesaId: string }) {
    const { notificaciones, markNotificationRead } = useApp();
    const [isOpen, setIsOpen] = useState(false);

    // Filter for this table and sort by newest
    const misNotificaciones = notificaciones
        .filter(n => n.mesaId === mesaId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const unreadCount = misNotificaciones.filter(n => !n.leido).length;

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    // Auto-close if no notifications? No, better keep it user controlled.

    return (
        <>
            <button
                onClick={handleOpen}
                className="relative p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm dark:bg-black/40"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 z-[60] w-full max-w-[320px] bg-white shadow-2xl dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 flex flex-col h-[100dvh]"
                        >
                            <div className="flex h-full flex-col">
                                <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Bell className="h-5 w-5 text-orange-500" />
                                        Notificaciones
                                    </h2>
                                    <button onClick={handleClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {misNotificaciones.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                                            <Bell className="mx-auto h-12 w-12 opacity-20 mb-3" />
                                            <p>No tienes notificaciones aún.</p>
                                        </div>
                                    ) : (
                                        misNotificaciones.map(notif => (
                                            <div
                                                key={notif.id}
                                                onClick={() => !notif.leido && markNotificationRead(notif.id)}
                                                className={cn(
                                                    "relative flex gap-3 rounded-xl p-4 transition-all",
                                                    notif.leido
                                                        ? "bg-slate-50 dark:bg-slate-900/50 opacity-70"
                                                        : "bg-white shadow-md border border-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none translate-x-1"
                                                )}
                                            >
                                                {!notif.leido && (
                                                    <span className="absolute left-2 top-1/2 -ml-1 h-2 w-2 -translate-y-1/2 rounded-full bg-orange-500" />
                                                )}

                                                <div className={cn("mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                                    notif.tipo === 'kitchen' ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" :
                                                        notif.tipo === 'waiter' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                                                            notif.tipo === 'payment' ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" :
                                                                "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                                )}>
                                                    {notif.tipo === 'kitchen' && <ChefHat className="h-4 w-4" />}
                                                    {notif.tipo === 'waiter' && <User className="h-4 w-4" />}
                                                    {notif.tipo === 'payment' && <CreditCard className="h-4 w-4" />}
                                                    {notif.tipo === 'order' && <Utensils className="h-4 w-4" />}
                                                    {notif.tipo === 'review' && <Star className="h-4 w-4" />}
                                                </div>

                                                <div className="flex-1">
                                                    <p className={cn("text-sm leading-snug", notif.leido ? "text-slate-600 dark:text-slate-400" : "font-medium text-slate-900 dark:text-white")}>
                                                        {notif.mensaje}
                                                    </p>
                                                    <p className="mt-1 text-[10px] text-slate-400">
                                                        {formatTime(new Date(notif.timestamp))}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {unreadCount > 0 && (
                                    <div className="border-t border-slate-100 p-4 dark:border-slate-800">
                                        <button
                                            onClick={() => misNotificaciones.forEach(n => !n.leido && markNotificationRead(n.id))}
                                            className="w-full rounded-xl bg-slate-100 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                        >
                                            Marcar todas como leídas
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
