'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mesa } from '@/types/mesa';
import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';
import { AlertCircle, Plus, Trash2, Search, MoveDiagonal, Type } from 'lucide-react';

interface MesaMapProps {
    mesas: Mesa[];
    onEdit: (mesa: Mesa) => void;
    location: string;
}

interface Decoration {
    id: string;
    type: 'wall-h' | 'wall-v' | 'plant' | 'bar' | 'text';
    x: number;
    y: number;
    width: number;
    height: number;
    text?: string;
}

const DECORATION_TEMPLATES = [
    { type: 'wall-h', name: 'Muro Horizontal', defaultWidth: 128, defaultHeight: 16 },
    { type: 'wall-v', name: 'Muro Vertical', defaultWidth: 16, defaultHeight: 128 },
    { type: 'bar', name: 'Barra / Mostrador', defaultWidth: 192, defaultHeight: 64 },
    { type: 'plant', name: 'Planta / Maceta', defaultWidth: 48, defaultHeight: 48 },
    { type: 'text', name: 'Texto Libre', defaultWidth: 120, defaultHeight: 40 },
] as const;

export function MesaMap({ mesas, onEdit, location }: MesaMapProps) {
    const { upsertMesa, pedidos } = useApp();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    const [decorations, setDecorations] = useState<Decoration[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchShape, setSearchShape] = useState('');

    // Local mesas state to prevent drag-jump desyncs before context updates
    const [localMesas, setLocalMesas] = useState<Mesa[]>(mesas);

    // Selection State
    const [selectedMesas, setSelectedMesas] = useState<string[]>([]);
    const [selectedDecorations, setSelectedDecorations] = useState<string[]>([]);
    const selectionBoxRef = useRef<HTMLDivElement>(null);
    const selectionCoordsRef = useRef({ startX: 0, startY: 0, endX: 0, endY: 0 });
    
    // Group Drag State
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [groupDragOffset, setGroupDragOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        // Sync local mesas with props, except when we are actively grouped-dragging to avoid overrides
        if (!draggingId) {
            setLocalMesas(mesas);
        }
    }, [mesas, draggingId]);

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
        // clear selections on location change
        setSelectedMesas([]);
        setSelectedDecorations([]);
    }, [location, isClient]);

    const saveDecorations = (newDecorations: Decoration[]) => {
        setDecorations(newDecorations);
        localStorage.setItem(`mesa_decor_${location}`, JSON.stringify(newDecorations));
    };

    const handleMapPointerDown = (e: React.PointerEvent) => {
        if (e.target !== containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        // Fallback for CSS scale/zoom if applied to a parent (though standard zoom is handled automatically)
        const scaleX = rect.width / containerRef.current.offsetWidth || 1;
        const scaleY = rect.height / containerRef.current.offsetHeight || 1;
        
        const startX = (e.clientX - rect.left) / scaleX;
        const startY = (e.clientY - rect.top) / scaleY;
        
        selectionCoordsRef.current = { startX, startY, endX: startX, endY: startY };
        
        if (selectionBoxRef.current) {
            selectionBoxRef.current.style.display = 'block';
            selectionBoxRef.current.style.left = `${startX}px`;
            selectionBoxRef.current.style.top = `${startY}px`;
            selectionBoxRef.current.style.width = '0px';
            selectionBoxRef.current.style.height = '0px';
        }

        setSelectedMesas([]);
        setSelectedDecorations([]);

        const onPointerMove = (moveEvent: PointerEvent) => {
            const endX = (moveEvent.clientX - rect.left) / scaleX;
            const endY = (moveEvent.clientY - rect.top) / scaleY;
            selectionCoordsRef.current.endX = endX;
            selectionCoordsRef.current.endY = endY;

            if (selectionBoxRef.current) {
                const minX = Math.min(startX, endX);
                const minY = Math.min(startY, endY);
                const width = Math.abs(endX - startX);
                const height = Math.abs(endY - startY);

                selectionBoxRef.current.style.left = `${minX}px`;
                selectionBoxRef.current.style.top = `${minY}px`;
                selectionBoxRef.current.style.width = `${width}px`;
                selectionBoxRef.current.style.height = `${height}px`;
            }
        };

        const onPointerUp = () => {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            
            if (selectionBoxRef.current) {
                selectionBoxRef.current.style.display = 'none';
            }
            
            const { startX, startY, endX, endY } = selectionCoordsRef.current;
            const minX = Math.min(startX, endX);
            const maxX = Math.max(startX, endX);
            const minY = Math.min(startY, endY);
            const maxY = Math.max(startY, endY);
            
            if (maxX - minX > 5 || maxY - minY > 5) {
                const newSelMesas = localMesas.filter(m => {
                    const cx = (m.x || 0) + 48; // ~ center of 96px width
                    const cy = (m.y || 0) + 48;
                    return cx >= minX && cx <= maxX && cy >= minY && cy <= maxY;
                }).map(m => m.id);
                
                const newSelDecs = decorations.filter(d => {
                    const cx = d.x + (d.width / 2);
                    const cy = d.y + (d.height / 2);
                    return cx >= minX && cx <= maxX && cy >= minY && cy <= maxY;
                }).map(d => d.id);

                setSelectedMesas(newSelMesas);
                setSelectedDecorations(newSelDecs);
            }
        };

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    };

    const handleDragStart = (id: string, isMesa: boolean) => {
        const isSelected = isMesa ? selectedMesas.includes(id) : selectedDecorations.includes(id);
        if (!isSelected) {
            setSelectedMesas([]);
            setSelectedDecorations([]);
        }
        setDraggingId(id);
    };

    const handleDrag = (e: any, info: any) => {
        if (draggingId) {
            setGroupDragOffset(info.offset);
        }
    };

    const applyGroupDragOffset = (offset: { x: number, y: number }) => {
        if (selectedMesas.length > 0) {
            setLocalMesas(prev => prev.map(m => {
                if (selectedMesas.includes(m.id)) {
                    const newX = Math.max(0, Math.round((m.x || 0) + offset.x));
                    const newY = Math.max(0, Math.round((m.y || 0) + offset.y));
                    const updated = { ...m, x: newX, y: newY };
                    // We also trigger the context update
                    upsertMesa(updated);
                    return updated;
                }
                return m;
            }));
        }
        if (selectedDecorations.length > 0) {
            const updated = decorations.map(d => {
                if (selectedDecorations.includes(d.id)) {
                    return { ...d, x: Math.max(0, Math.round(d.x + offset.x)), y: Math.max(0, Math.round(d.y + offset.y)) };
                }
                return d;
            });
            saveDecorations(updated);
        }
    };

    const handleDragEndMesa = (mesa: Mesa, info: any) => {
        // Important: we update the state first before clearing dragging offset to avoid jump back
        if (selectedMesas.includes(mesa.id)) {
            applyGroupDragOffset(info.offset);
        } else {
            const newX = Math.max(0, Math.round((mesa.x || 0) + info.offset.x));
            const newY = Math.max(0, Math.round((mesa.y || 0) + info.offset.y));
            const updated = { ...mesa, x: newX, y: newY };
            setLocalMesas(prev => prev.map(m => m.id === mesa.id ? updated : m));
            upsertMesa(updated);
        }
        
        setDraggingId(null);
        setGroupDragOffset({ x: 0, y: 0 });
    };

    const handleDragEndDecoration = (id: string, info: any) => {
        if (selectedDecorations.includes(id)) {
            applyGroupDragOffset(info.offset);
        } else {
            const dec = decorations.find(d => d.id === id);
            if (dec) {
                const newX = Math.max(0, Math.round(dec.x + info.offset.x));
                const newY = Math.max(0, Math.round(dec.y + info.offset.y));
                
                const updated = decorations.map(d => d.id === id ? { ...d, x: newX, y: newY } : d);
                saveDecorations(updated);
            }
        }

        setDraggingId(null);
        setGroupDragOffset({ x: 0, y: 0 });
    };

    const handleResizePointerDown = (e: React.PointerEvent, decId: string) => {
        e.stopPropagation();
        const rect = containerRef.current?.getBoundingClientRect();
        const scaleX = rect ? rect.width / (containerRef.current?.offsetWidth || 1) : 1;
        const scaleY = rect ? rect.height / (containerRef.current?.offsetHeight || 1) : 1;
        
        const startX = e.clientX / scaleX;
        const startY = e.clientY / scaleY;
        
        setDecorations(prev => {
            const dec = prev.find(d => d.id === decId);
            if (!dec) return prev;
            
            const startWidth = dec.width;
            const startHeight = dec.height;

            const onPointerMove = (moveEvent: PointerEvent) => {
                const dx = (moveEvent.clientX / scaleX) - startX;
                const dy = (moveEvent.clientY / scaleY) - startY;
                
                const minW = 16;
                const minH = 16;
                const newW = Math.max(minW, startWidth + dx);
                const newH = Math.max(minH, startHeight + dy);

                setDecorations(current => current.map(d => d.id === decId ? { ...d, width: newW, height: newH } : d));
            };

            const onPointerUp = () => {
                document.removeEventListener('pointermove', onPointerMove);
                document.removeEventListener('pointerup', onPointerUp);
                setDecorations(current => {
                    localStorage.setItem(`mesa_decor_${location}`, JSON.stringify(current));
                    return current;
                });
            };

            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
            return prev;
        });
    };

    const addDecoration = (type: Decoration['type']) => {
        const template = DECORATION_TEMPLATES.find(t => t.type === type);
        if (!template) return;

        const newDec: Decoration = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            x: 50,
            y: 50,
            width: template.defaultWidth,
            height: template.defaultHeight,
            text: type === 'text' ? 'Nuevo Texto' : undefined
        };
        saveDecorations([...decorations, newDec]);
    };

    const removeDecoration = (id: string) => {
        saveDecorations(decorations.filter(d => d.id !== id));
        setSelectedDecorations(prev => prev.filter(selectedId => selectedId !== id));
    };

    if (!isClient) return <div className="h-[600px] w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900/50" />;

    const renderDecoration = (dec: Decoration, isPreview = false) => {
        const isSelected = !isPreview && selectedDecorations.includes(dec.id);
        const xPos = dec.x + (isSelected && draggingId !== dec.id ? groupDragOffset.x : 0);
        const yPos = dec.y + (isSelected && draggingId !== dec.id ? groupDragOffset.y : 0);

        const props = isPreview ? {} : {
            drag: true,
            // Removed dragConstraints so they can be dragged freely without getting stuck
            dragElastic: 0,
            dragMomentum: false,
            onDragStart: () => handleDragStart(dec.id, false),
            onDrag: handleDrag,
            onDragEnd: (e: any, info: any) => handleDragEndDecoration(dec.id, info),
            initial: { x: dec.x, y: dec.y },
            animate: { x: xPos, y: yPos },
            transition: { duration: 0 }
        };

        const className = cn(
            "absolute flex items-center justify-center",
            !isPreview && "cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow",
            dec.type === 'wall-h' && "bg-slate-400 dark:bg-neutral-600 rounded-sm",
            dec.type === 'wall-v' && "bg-slate-400 dark:bg-neutral-600 rounded-sm",
            dec.type === 'plant' && "bg-emerald-500/80 rounded-full border-4 border-emerald-600/50 dark:border-emerald-800",
            dec.type === 'bar' && "bg-amber-700/80 rounded-md border-4 border-amber-900/50 dark:border-amber-950",
            dec.type === 'text' && (isPreview || isEditMode ? "bg-slate-200/50 dark:bg-neutral-800/50 border border-dashed border-slate-400 dark:border-neutral-600 rounded-md" : "bg-transparent shadow-none hover:shadow-none font-bold text-slate-700 dark:text-neutral-300 text-lg"),
            isSelected && "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-neutral-900"
        );

        const handleEditText = () => {
            if (dec.type !== 'text' || isPreview) return;
            const newText = prompt('Ingresa el texto:', dec.text || '');
            if (newText !== null) {
                const updated = decorations.map(d => d.id === dec.id ? { ...d, text: newText } : d);
                saveDecorations(updated);
            }
        };

        const content = (
            <motion.div
                key={dec.id}
                {...props}
                className={className}
                style={isPreview ? { position: 'relative', x: 0, y: 0, width: dec.width, height: dec.height } : { width: dec.width, height: dec.height }}
                onDoubleClick={handleEditText}
            >
                {dec.type === 'text' && (
                    <span className="truncate px-2 text-center select-none w-full">{dec.text}</span>
                )}

                {!isPreview && isEditMode && (
                    <>
                        <button 
                            onPointerDownCapture={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); removeDecoration(dec.id); }}
                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 z-50"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                        
                        {/* Resize Handle */}
                        <div
                            onPointerDown={(e) => handleResizePointerDown(e, dec.id)}
                            className="absolute -bottom-2 -right-2 w-6 h-6 flex items-center justify-center bg-orange-500 text-white rounded-full cursor-se-resize shadow-md z-50 hover:scale-110 transition-transform"
                        >
                            <MoveDiagonal className="w-3.5 h-3.5" />
                        </div>
                    </>
                )}
            </motion.div>
        );

        return content;
    };

    const filteredTemplates = DECORATION_TEMPLATES.filter(t => t.name.toLowerCase().includes(searchShape.toLowerCase()));

    return (
        <div className="flex gap-4">
            {/* Palette */}
            <div className="w-56 flex-shrink-0 flex flex-col rounded-2xl bg-white shadow-sm border border-slate-200 dark:bg-neutral-950 dark:border-neutral-800 h-[600px] overflow-hidden select-none">
                <div className="p-4 border-b border-slate-100 dark:border-neutral-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-sm text-slate-800 dark:text-neutral-200">Estructuras</h3>
                        <button 
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={cn("text-xs px-2 py-1 rounded-md transition-colors", isEditMode ? "bg-red-100 text-red-600 dark:bg-red-900/30" : "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-400")}
                        >
                            {isEditMode ? 'Listo' : 'Editar'}
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar forma..."
                            value={searchShape}
                            onChange={(e) => setSearchShape(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:bg-neutral-900 dark:border-neutral-800 dark:text-white"
                        />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-neutral-500 mt-2">Haz clic para agregar al mapa</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {filteredTemplates.length === 0 ? (
                        <p className="text-xs text-center text-slate-400 dark:text-neutral-500 py-4">No se encontraron formas.</p>
                    ) : (
                        filteredTemplates.map(template => (
                            <div key={template.type} className="flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-900 p-2 rounded-xl transition-colors" onClick={() => addDecoration(template.type)}>
                                <div className="h-20 flex items-center justify-center w-full overflow-hidden">
                                    <div className="scale-[0.6] flex items-center justify-center">
                                        {renderDecoration({ id: 'preview', type: template.type as any, x: 0, y: 0, width: template.defaultWidth, height: template.defaultHeight, text: template.type === 'text' ? 'Texto' : undefined }, true)}
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-slate-600 dark:text-neutral-300 text-center">{template.name}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Map Area */}
            <div 
                ref={containerRef} 
                onPointerDown={handleMapPointerDown}
                className="relative h-[600px] flex-1 overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 shadow-inner dark:border-neutral-800 dark:bg-neutral-900/50 select-none cursor-crosshair"
                style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                }}
            >
                <div 
                    ref={selectionBoxRef}
                    className="absolute border border-blue-500 bg-blue-500/20 z-50 pointer-events-none rounded-sm"
                    style={{ display: 'none' }}
                />

                {/* Render Decorations (Behind tables) */}
                {decorations.map(dec => renderDecoration(dec))}

                {/* Render Mesas */}
                {localMesas.map((mesa) => {
                    const pedidosPendientes = pedidos.filter(p => p.mesaId === mesa.id && p.estado === 'pendiente').length;
                    const hasPending = pedidosPendientes > 0;
                    
                    const isSelected = selectedMesas.includes(mesa.id);
                    const xPos = (mesa.x || 0) + (isSelected && draggingId !== mesa.id ? groupDragOffset.x : 0);
                    const yPos = (mesa.y || 0) + (isSelected && draggingId !== mesa.id ? groupDragOffset.y : 0);

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
                            // Removed dragConstraints so tables can be dragged to the right edge freely
                            dragElastic={0}
                            dragMomentum={false}
                            onDragStart={() => handleDragStart(mesa.id, true)}
                            onDrag={handleDrag}
                            onDragEnd={(e, info) => handleDragEndMesa(mesa, info)}
                            initial={{ x: mesa.x || 0, y: mesa.y || 0 }}
                            animate={{ x: xPos, y: yPos }}
                            transition={{ duration: 0 }}
                            className={cn(
                                "absolute flex h-24 w-24 cursor-grab flex-col items-center justify-center rounded-2xl border-2 shadow-lg active:cursor-grabbing z-10",
                                config.color,
                                isSelected ? "ring-4 ring-blue-500 ring-offset-2 dark:ring-offset-neutral-900" : config.ring
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
                    <p>💡 Arrastra el cursor por el mapa para seleccionar múltiples objetos.</p>
                    <p>💡 Doble clic en un texto para editar su contenido.</p>
                </div>
            </div>
        </div>
    );
}
