'use client';

import React from 'react';
import { useApp } from '@/lib/context';
import { PedidoCard } from '@/components/dashboard/PedidoCard';
import { Package } from 'lucide-react';

export default function PedidosPage() {
    const { pedidos, mesas, updatePedidoEstado } = useApp();

    const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente');
    const pedidosEntregados = pedidos.filter(p => p.estado === 'entregado');
    const pedidosListos = pedidos.filter(p => p.estado === 'listo_para_entregar');

    const getMesaName = (mesaId: string) => {
        const mesa = mesas.find(m => m.id === mesaId);
        return mesa ? mesa.nombre : undefined;
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Pedidos Activos</h1>
                <p className="text-slate-500">Gestiona las comandas del local en tiempo real.</p>
            </div>

            {/* Ready to Serve Section */}
            {pedidosListos.length > 0 && (
                <section className="bg-green-50 p-6 rounded-2xl border border-green-100 dark:bg-green-900/20 dark:border-green-800">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500 animate-bounce" />
                        <h2 className="text-lg font-bold text-green-800 dark:text-green-300">Listos para Servir ({pedidosListos.length})</h2>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {pedidosListos.map((pedido) => (
                            <PedidoCard
                                key={pedido.id}
                                pedido={pedido}
                                mesaNombre={getMesaName(pedido.mesaId)}
                                onConfirm={(id) => updatePedidoEstado(id, 'entregado')} // Normal flow: To Delivered
                                onStateChange={(id, state) => updatePedidoEstado(id, state)}
                            />
                        ))}
                    </div>
                </section>
            )}

            <section>
                <div className="mb-4 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Pendientes ({pedidosPendientes.length})</h2>
                </div>

                {pedidosPendientes.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {pedidosPendientes.map((pedido) => (
                            <PedidoCard
                                key={pedido.id}
                                pedido={pedido}
                                mesaNombre={getMesaName(pedido.mesaId)}
                                onConfirm={(id) => updatePedidoEstado(id, 'en_preparacion')} // Normal flow: To Kitchen
                                onStateChange={(id, state) => updatePedidoEstado(id, state)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <Package className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                        <p className="mt-2 text-slate-500">No hay pedidos pendientes.</p>
                    </div>
                )}
            </section>

            <section className="opacity-70">
                <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-200">Entregados Recientemente</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {pedidosEntregados.reverse().slice(0, 3).map((pedido) => (
                        <PedidoCard
                            key={pedido.id}
                            pedido={pedido}
                            mesaNombre={getMesaName(pedido.mesaId)}
                            onConfirm={() => { }}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
