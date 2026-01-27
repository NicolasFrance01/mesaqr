'use client';

import React from 'react';
import { useApp } from '@/lib/context';
import { Bell, Check, Utensils, CreditCard, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationsPanel() {
    const { notificaciones, markNotificationRead } = useApp();
    const unread = notificaciones.filter(n => !n.leido);

    if (unread.length === 0) return null;

    return (
        <div className="mb-6 rounded-xl border border-orange-100 bg-orange-50/50 p-4 dark:border-orange-900/30 dark:bg-orange-900/10">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-orange-800 dark:text-orange-200">
                    <Bell className="h-4 w-4" />
                    Notificaciones ({unread.length})
                </h3>
                <button
                    onClick={() => unread.forEach(n => markNotificationRead(n.id))}
                    className="text-xs font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
                >
                    Marcar todo leído
                </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                <AnimatePresence>
                    {unread.map((notif) => (
                        <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-start justify-between gap-3 rounded-lg bg-white p-3 shadow-sm dark:bg-slate-900"
                        >
                            <div className="flex items-start gap-3">
                                <div className={cn("mt-0.5 rounded-full p-1.5",
                                    notif.tipo === 'waiter' ? "bg-red-100 text-red-600" :
                                        notif.tipo === 'payment' ? "bg-green-100 text-green-600" :
                                            notif.tipo === 'review' ? "bg-yellow-100 text-yellow-600" :
                                                "bg-blue-100 text-blue-600"
                                )}>
                                    {notif.tipo === 'waiter' && <Bell className="h-3 w-3" />}
                                    {notif.tipo === 'payment' && <CreditCard className="h-3 w-3" />}
                                    {notif.tipo === 'review' && <Star className="h-3 w-3" />}
                                    {notif.tipo === 'order' && <Utensils className="h-3 w-3" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{notif.mensaje}</p>
                                    <p className="text-[10px] text-slate-400">{notif.timestamp.toLocaleTimeString()}</p>
                                </div>
                            </div>
                            <button onClick={() => markNotificationRead(notif.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <Check className="h-4 w-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
