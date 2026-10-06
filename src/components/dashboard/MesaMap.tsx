'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { Mesa } from '@/types/mesa';
import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface MesaMapProps {
    mesas: Mesa[];
    onEdit: (mesa: Mesa) => void;
}

export function MesaMap({ mesas, onEdit }: MesaMapProps) {
    const { upsertMesa, pedidos } = useApp();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleDragEnd = (mesa: Mesa, info: any) => {
        // Obtenemos la posición relativa dentro del contenedor
        const newX = Math.round(mesa.x + info.offset.x);
        const newY = Math.round(mesa.y + info.offset.y);

        // Guardamos la nueva posición (no permitimos negativos)
        upsertMesa({
            ...mesa,
            x: Math.max(0, newX),
            y: Math.max(0, newY)
        });
    };

    if (!isClient) return <div className="h-[600px] w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50" />;

    return (
        <div 
            ref={containerRef} 
            className="relative h-[600px] w-full overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 shadow-inner dark:border-slate-800 dark:bg-slate-900/50"
            style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)',
                backgroundSize: '32px 32px'
            }}
        >
            {mesas.map((mesa) => {
                const pedidosPendientes = pedidos.filter(p => p.mesaId === mesa.id && p.estado === 'pendiente').length;
                const hasPending = pedidosPendientes > 0;

                const statusConfig = {
                    libre: {
                        color: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
                        ring: ''
                    },
                    ocupada: {
                        color: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-700',
                        ring: hasPending ? 'ring-4 ring-orange-400 animate-pulse' : 'ring-2 ring-emerald-400'
                    },
                    pagando: {
                        color: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-700',
                        ring: 'ring-2 ring-blue-400'
                    }
                };

                const config = statusConfig[mesa.estado as keyof typeof statusConfig] || statusConfig.libre;

                return (
                    <motion.div
                        key={mesa.id}
                        drag
                        dragConstraints={containerRef}
                        dragElastic={0.1}
                        dragMomentum={false}
                        onDragEnd={(e, info) => handleDragEnd(mesa, info)}
                        initial={{ x: mesa.x || 0, y: mesa.y || 0 }}
                        animate={{ x: mesa.x || 0, y: mesa.y || 0 }}
                        className={cn(
                            "absolute flex h-24 w-24 cursor-grab flex-col items-center justify-center rounded-2xl border-2 shadow-lg active:cursor-grabbing",
                            config.color,
                            config.ring
                        )}
                        onDoubleClick={() => onEdit(mesa)}
                    >
                        <span className="text-xl font-black">{mesa.numero}</span>
                        <span className="text-xs font-semibold uppercase opacity-75">{mesa.estado}</span>
                        
                        {/* Users badge */}
                        <div className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold shadow-md dark:bg-slate-800 dark:text-white">
                            {mesa.usuarios?.length || 0}
                        </div>
                    </motion.div>
                );
            })}

            <div className="absolute bottom-4 left-4 rounded-lg bg-white/80 p-3 text-xs text-slate-500 backdrop-blur-sm dark:bg-slate-900/80">
                <p>💡 Arrastra las mesas para organizar el salón.</p>
                <p>💡 Doble clic para editar.</p>
            </div>
        </div>
    );
}
