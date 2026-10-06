'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mesa } from '@/types/mesa';
import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';

interface MesaMapProps {
    mesas: Mesa[];
    onEdit: (mesa: Mesa) => void;
    location: string;
}

interface Decoration {
    id: string;
    type: 'wall-h' | 'wall-v' | 'plant' | 'bar';
    x: number;
    y: number;
}

export function MesaMap({ mesas, onEdit, location }: MesaMapProps) {
    const { upsertMesa, pedidos } = useApp();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    const [decorations, setDecorations] = useState<Decoration[]>([]);
    const [isEditMode, setIsEditMode] = useState(false); // To show trash icons for decorations

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Load decorations when location changes
    useEffect(() => {
        if (!isClient) return;
        const saved = localStorage.getItem(`mesa_decor_${location}`);
        if (saved) {
            try {
                setDecorations(JSON.parse(saved));
            } catch (e) {
                setDecorations([]);
            }
        } else {
            setDecorations([]);
        }
    }, [location, isClient]);

    const saveDecorations = (newDecorations: Decoration[]) => {
        setDecorations(newDecorations);
        localStorage.setItem(`mesa_decor_${location}`, JSON.stringify(newDecorations));
    };

    const handleDragEndMesa = (mesa: Mesa, info: any) => {
        const newX = Math.round(mesa.x + info.offset.x);
        const newY = Math.round(mesa.y + info.offset.y);
        upsertMesa({ ...mesa, x: Math.max(0, newX), y: Math.max(0, newY) });
    };

    const handleDragEndDecoration = (id: string, info: any) => {
        const dec = decorations.find(d => d.id === id);
        if (!dec) return;
        const newX = Math.round(dec.x + info.offset.x);
        const newY = Math.round(dec.y + info.offset.y);
        
        const updated = decorations.map(d => d.id === id ? { ...d, x: Math.max(0, newX), y: Math.max(0, newY) } : d);
        saveDecorations(updated);
    };

    const addDecoration = (type: Decoration['type']) => {
        const newDec: Decoration = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            x: 50,
            y: 50
        };
        saveDecorations([...decorations, newDec]);
    };

    const removeDecoration = (id: string) => {
        saveDecorations(decorations.filter(d => d.id !== id));
    };

    if (!isClient) return <div className="h-[600px] w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900/50" />;

    const renderDecoration = (dec: Decoration, isPreview = false) => {
        const props = isPreview ? {} : {
            drag: true,
            dragConstraints: containerRef,
            dragElastic: 0,
            dragMomentum: false,
            onDragEnd: (e: any, info: any) => handleDragEndDecoration(dec.id, info),
            initial: { x: dec.x, y: dec.y },
            animate: { x: dec.x, y: dec.y }
        };

        const className = cn(
            "absolute flex items-center justify-center",
            !isPreview && "cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow",
            dec.type === 'wall-h' && "h-4 w-32 bg-slate-400 dark:bg-neutral-600 rounded-sm",
            dec.type === 'wall-v' && "w-4 h-32 bg-slate-400 dark:bg-neutral-600 rounded-sm",
            dec.type === 'plant' && "w-12 h-12 bg-emerald-500/80 rounded-full border-4 border-emerald-600/50 dark:border-emerald-800",
            dec.type === 'bar' && "h-16 w-48 bg-amber-700/80 rounded-md border-4 border-amber-900/50 dark:border-amber-950"
        );

        const content = (
            <motion.div
                key={dec.id}
                {...props}
                className={className}
                style={isPreview ? { position: 'relative', x: 0, y: 0 } : undefined}
            >
                {!isPreview && isEditMode && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); removeDecoration(dec.id); }}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 z-50"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                )}
            </motion.div>
        );

        return content;
    };

    return (
        <div className="flex gap-4">
            {/* Palette */}
            <div className="w-48 flex-shrink-0 space-y-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-200 dark:bg-neutral-950 dark:border-neutral-800 h-[600px] overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-neutral-200">Estructuras</h3>
                    <button 
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={cn("text-xs px-2 py-1 rounded-md transition-colors", isEditMode ? "bg-red-100 text-red-600 dark:bg-red-900/30" : "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-400")}
                    >
                        {isEditMode ? 'Listo' : 'Editar'}
                    </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">Haz clic para agregar al mapa</p>
                
                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-900 p-2 rounded-xl transition-colors" onClick={() => addDecoration('wall-h')}>
                        <div className="h-20 flex items-center justify-center w-full">
                            {renderDecoration({ id: 'preview', type: 'wall-h', x: 0, y: 0 }, true)}
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-neutral-300">Muro Horizontal</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-900 p-2 rounded-xl transition-colors" onClick={() => addDecoration('wall-v')}>
                        <div className="h-32 flex items-center justify-center w-full">
                            {renderDecoration({ id: 'preview', type: 'wall-v', x: 0, y: 0 }, true)}
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-neutral-300">Muro Vertical</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-900 p-2 rounded-xl transition-colors" onClick={() => addDecoration('bar')}>
                        <div className="h-24 flex items-center justify-center w-full">
                            <div className="scale-75">
                                {renderDecoration({ id: 'preview', type: 'bar', x: 0, y: 0 }, true)}
                            </div>
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-neutral-300">Barra / Mostrador</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-900 p-2 rounded-xl transition-colors" onClick={() => addDecoration('plant')}>
                        <div className="h-16 flex items-center justify-center w-full">
                            {renderDecoration({ id: 'preview', type: 'plant', x: 0, y: 0 }, true)}
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-neutral-300">Planta / Maceta</span>
                    </div>
                </div>
            </div>

            {/* Map Area */}
            <div 
                ref={containerRef} 
                className="relative h-[600px] flex-1 overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 shadow-inner dark:border-neutral-800 dark:bg-neutral-900/50"
                style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                }}
            >
                {/* Render Decorations (Behind tables) */}
                {decorations.map(dec => renderDecoration(dec))}

                {/* Render Mesas */}
                {mesas.map((mesa) => {
                    const pedidosPendientes = pedidos.filter(p => p.mesaId === mesa.id && p.estado === 'pendiente').length;
                    const hasPending = pedidosPendientes > 0;

                    const statusConfig = {
                        libre: {
                            color: 'bg-white text-slate-600 border-slate-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
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
                            dragElastic={0}
                            dragMomentum={false}
                            onDragEnd={(e, info) => handleDragEndMesa(mesa, info)}
                            initial={{ x: mesa.x || 0, y: mesa.y || 0 }}
                            animate={{ x: mesa.x || 0, y: mesa.y || 0 }}
                            className={cn(
                                "absolute flex h-24 w-24 cursor-grab flex-col items-center justify-center rounded-2xl border-2 shadow-lg active:cursor-grabbing z-10",
                                config.color,
                                config.ring
                            )}
                            onDoubleClick={() => onEdit(mesa)}
                        >
                            <span className="text-xl font-black">{mesa.numero}</span>
                            <span className="text-xs font-semibold uppercase opacity-75">{mesa.estado}</span>
                            
                            {/* Users badge */}
                            <div className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold shadow-md dark:bg-neutral-800 dark:text-white dark:border dark:border-neutral-700">
                                {mesa.usuarios?.length || 0}
                            </div>
                        </motion.div>
                    );
                })}

                <div className="absolute bottom-4 left-4 rounded-lg bg-white/80 p-3 text-xs text-slate-500 backdrop-blur-sm dark:bg-neutral-900/80 dark:text-neutral-400 border border-slate-100 dark:border-neutral-800 z-20 shadow-sm">
                    <p>💡 Arrastra mesas o estructuras para organizar el {location}.</p>
                    <p>💡 Doble clic en una mesa para editar.</p>
                </div>
            </div>
        </div>
    );
}
