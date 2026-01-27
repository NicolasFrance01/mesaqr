'use client';

import React from 'react';
import { Pedido } from '@/types/pedido';
import { formatCurrency } from '@/lib/utils';
import { Package, Clock, CheckCircle2, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface PedidoCardProps {
    pedido: Pedido;
    onConfirm: (id: string) => void;
    onStateChange?: (id: string, estado: any) => void;
    mesaNombre?: string;
    confirmText?: string;
    confirmColor?: string;
}

export function PedidoCard({ pedido, onConfirm, onStateChange, mesaNombre, confirmText, confirmColor }: PedidoCardProps) {
    const isPendiente = pedido.estado === 'pendiente';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
        >
            <div className="border-b border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                            <Package className="h-4 w-4 text-orange-600" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                            {mesaNombre ? `Pedido ${mesaNombre}` : `Pedido #${pedido.id.slice(-4)}`}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(pedido.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>

            <div className="p-4">
                <div className="space-y-3">
                    {pedido.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">
                                <span className="font-bold text-slate-900 dark:text-white">{item.cantidad}x</span> {item.producto.nombre}
                            </span>
                            <span className="text-slate-500">{formatCurrency(item.producto.precio * item.cantidad)}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(pedido.total)}</p>
                    </div>


                    <div className="flex items-center gap-2">
                        {/* Manual Override for Admins/Waiters */}
                        {onStateChange && pedido.estado !== 'entregado' && (
                            <select
                                className="text-xs bg-slate-100 border-none rounded-lg py-1 px-2 text-slate-600 cursor-pointer hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 focus:ring-0"
                                value={""}
                                onChange={(e) => {
                                    if (e.target.value) onStateChange(pedido.id, e.target.value);
                                }}
                            >
                                <option value="">Estado...</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="en_preparacion">Cocina</option>
                                <option value="listo_para_entregar">Listo</option>
                                <option value="entregado">Entregado</option>
                            </select>
                        )}

                        {isPendiente ? (
                            <button
                                onClick={() => onConfirm(pedido.id)}
                                className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-600 hover:scale-[1.02] active:scale-95"
                            >
                                <Flame className="h-4 w-4" />
                                {confirmText || "A Cocina"}
                            </button>
                        ) : pedido.estado === 'en_preparacion' ? (
                            <button
                                onClick={() => onConfirm(pedido.id)}
                                className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-yellow-600 hover:scale-[1.02] active:scale-95"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                {confirmText || "Listo"}
                            </button>
                        ) : pedido.estado === 'listo_para_entregar' ? (
                            <button
                                onClick={() => onConfirm(pedido.id)}
                                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-green-700 hover:scale-[1.02] active:scale-95 shadow-md shadow-green-200"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                {confirmText || "Servir"}
                            </button>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Entregado
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
