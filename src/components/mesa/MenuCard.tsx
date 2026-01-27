'use client';

import React from 'react';
import { Producto } from '@/types/producto';
import { formatCurrency } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface MenuCardProps {
    producto: Producto;
    onAdd: (producto: Producto) => void;
}

export function MenuCard({ producto, onAdd }: MenuCardProps) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900/50">
            <div className="h-20 w-20 flex-shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center text-slate-300">
                {producto.imagen ? (
                    <img src={producto.imagen} alt={producto.nombre} className="h-full w-full object-cover" />
                ) : (
                    <span className="text-xs">Imagen</span>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white truncate">{producto.nombre}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{producto.descripcion}</p>
                <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-orange-600">{formatCurrency(producto.precio)}</span>
                    <button
                        onClick={() => onAdd(producto)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/30 active:bg-orange-600"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
