'use client';

import React, { useState } from 'react';
import { UsuarioMesa } from '@/types/mesa';
import { Pedido, ItemPedido } from '@/types/pedido';
import { formatCurrency, cn } from '@/lib/utils';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    usuario: UsuarioMesa;
    pedidos: Pedido[];
    onAssign: (pedidoId: string, itemId: string, assign: boolean) => void;
}

export function AssignmentModal({ isOpen, onClose, usuario, pedidos, onAssign }: AssignmentModalProps) {
    if (!isOpen) return null;

    // Flatten all items from all active orders
    const allItems = pedidos.flatMap(p => p.items.map(i => ({ ...i, pedidoId: p.id })));

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden dark:bg-slate-900"
                >
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between dark:border-slate-800">
                        <h3 className="font-bold text-lg dark:text-white">Asignar a {usuario.nombre}</h3>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </div>

                    <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
                        <p className="text-sm text-slate-500 mb-4">Selecciona los items que consumió {usuario.nombre}.</p>

                        {allItems.length === 0 ? (
                            <p className="text-center text-slate-400 py-8">No hay pedidos en la mesa aún.</p>
                        ) : (
                            allItems.map((item, idx) => {
                                const isAssignedToMe = item.asignadoA === usuario.id;
                                const isAssignedToOther = item.asignadoA && !isAssignedToMe;

                                return (
                                    <div
                                        key={`${item.pedidoId}-${item.id}`}
                                        onClick={() => !isAssignedToOther && onAssign(item.pedidoId, item.id, !isAssignedToMe)}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                                            isAssignedToMe
                                                ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                                                : isAssignedToOther
                                                    ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed dark:border-slate-800 dark:bg-slate-900"
                                                    : "border-slate-200 hover:border-orange-200 dark:border-slate-800"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                                                isAssignedToMe ? "bg-orange-500 border-orange-500" : "border-slate-300"
                                            )}>
                                                {isAssignedToMe && <Check className="h-3 w-3 text-white" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm dark:text-white">{item.producto.nombre}</span>
                                                <span className="text-xs text-slate-500">{formatCurrency(item.producto.precio)}</span>
                                            </div>
                                        </div>
                                        {isAssignedToOther && <span className="text-[10px] text-slate-400">Ocupado</span>}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800">
                        <button
                            onClick={onClose}
                            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl active:scale-95 dark:bg-white dark:text-slate-900"
                        >
                            Listo
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
