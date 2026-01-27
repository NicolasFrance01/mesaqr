'use client';

import React from 'react';
import { useApp } from '@/lib/context';
import { PedidoCard } from '@/components/dashboard/PedidoCard';
import { ChefHat, Flame, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CocinaPage() {
    const { pedidos, mesas, updatePedidoEstado } = useApp();

    const pedidosParaCocinar = pedidos.filter(p => p.estado === 'en_preparacion');
    const pedidosListos = pedidos.filter(p => p.estado === 'listo_para_entregar');

    const getMesaName = (mesaId: string) => {
        const mesa = mesas.find(m => m.id === mesaId);
        return mesa ? mesa.nombre : `Mesa ${mesaId}`;
    };

    return (
        <div className="space-y-8 h-full">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-full dark:bg-orange-900/30">
                    <ChefHat className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Cocina</h1>
                    <p className="text-slate-500">Gestión de comandas y preparación.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
                {/* Column 1: A Cocinar (En Preparación) */}
                <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 flex flex-col h-full dark:bg-orange-950/20 dark:border-orange-900/30">
                    <div className="flex items-center gap-2 mb-6 text-orange-700 font-semibold uppercase tracking-wider text-sm sticky top-0 dark:text-orange-400">
                        <Flame className="h-5 w-5" />
                        <h2>A Cocinar ({pedidosParaCocinar.length})</h2>
                    </div>

                    <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                        <AnimatePresence>
                            {pedidosParaCocinar.length === 0 ? (
                                <p className="text-center text-orange-300 py-10 italic">El fuego está apagado.</p>
                            ) : (
                                pedidosParaCocinar.map(pedido => (
                                    <motion.div
                                        key={pedido.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                    >
                                        <PedidoCard
                                            pedido={pedido}
                                            mesaNombre={getMesaName(pedido.mesaId)}
                                            onConfirm={(id) => updatePedidoEstado(id, 'listo_para_entregar')}
                                            confirmText="Terminar"
                                        />
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Column 2: Listo para Entregar */}
                <div className="bg-green-50 rounded-2xl p-6 border border-green-100 flex flex-col h-full dark:bg-green-950/20 dark:border-green-900/30">
                    <div className="flex items-center gap-2 mb-6 text-green-700 font-semibold uppercase tracking-wider text-sm sticky top-0 dark:text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        <h2>Listo para Entregar ({pedidosListos.length})</h2>
                    </div>

                    <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                        <AnimatePresence>
                            {pedidosListos.length === 0 ? (
                                <p className="text-center text-green-300 py-10 italic">Nada para entregar.</p>
                            ) : (
                                pedidosListos.map(pedido => (
                                    <motion.div
                                        key={pedido.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                    >
                                        <div className="relative">
                                            <PedidoCard
                                                pedido={pedido}
                                                mesaNombre={getMesaName(pedido.mesaId)}
                                                onConfirm={(id) => updatePedidoEstado(id, 'entregado')}
                                                confirmText="Entregar"
                                                confirmColor="green"
                                            />
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
