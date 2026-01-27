'use client';

import React from 'react';
import { Mesa } from '@/types/mesa';
import { cn } from '@/lib/utils';
import { Users, MapPin, Edit2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '@/lib/context';

interface MesaCardProps {
    mesa: Mesa;
    onEdit: (mesa: Mesa) => void;
}

export function MesaCard({ mesa, onEdit }: MesaCardProps) {
    const { pedidos } = useApp();

    // Calcular pedidos pendientes para esta mesa
    const pedidosPendientes = pedidos.filter(p => p.mesaId === mesa.id && p.estado === 'pendiente').length;

    // Lógica de colores INVERTIDA (Green = Ocupada, Red = Libre)
    const statusConfig = {
        libre: {
            color: 'bg-red-50 text-red-700 border-red-100',
            dot: 'bg-red-500',
            icon: <AlertCircle className="h-4 w-4" />,
            label: 'Libre'
        },
        ocupada: {
            color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            dot: 'bg-emerald-500',
            icon: <CheckCircle className="h-4 w-4" />,
            label: 'Ocupada'
        },
        pagando: {
            color: 'bg-blue-50 text-blue-700 border-blue-100',
            dot: 'bg-blue-500',
            icon: <Clock className="h-4 w-4" />,
            label: 'Pagando'
        }
    };

    // Override si tiene pedidos pendientes pero sigue ocupada
    const hasPending = pedidosPendientes > 0;

    const config = statusConfig[mesa.estado] || statusConfig.libre;

    return (
        <div className={cn(
            "group relative rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-slate-950",
            mesa.estado === 'ocupada' ? "border-emerald-200 dark:border-emerald-900/50" : "border-slate-200 dark:border-slate-800",
            hasPending && "ring-2 ring-orange-400 ring-offset-2"
        )}>
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{mesa.nombre}</h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" />
                        {mesa.ubicacion}
                    </div>
                </div>
                <button
                    onClick={() => onEdit(mesa)}
                    className="rounded-lg p-2 text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-800"
                >
                    <Edit2 className="h-4 w-4" />
                </button>
            </div>

            <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                        <Users className="h-4 w-4 text-slate-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {mesa.usuarios?.length || 0} / {mesa.capacidad}
                    </span>
                </div>

                <div className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                    config.color
                )}>
                    <div className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
                    {config.label}
                </div>
            </div>

            {/* Real-time users preview */}
            {mesa.usuarios && mesa.usuarios.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                    <div className="flex flex-wrap gap-1">
                        {mesa.usuarios.map(u => (
                            <span key={u.id} className={cn(
                                "px-1.5 py-0.5 rounded-md border",
                                u.pagado ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50 border-slate-200"
                            )}>
                                {u.nombre} {u.pagado && '✓'}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
