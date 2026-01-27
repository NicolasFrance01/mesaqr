'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { MesaCard } from '@/components/dashboard/MesaCard';
import { Plus, Search } from 'lucide-react';
import { Mesa } from '@/types/mesa';

import { EditMesaModal } from '@/components/dashboard/EditMesaModal';

export default function MesasPage() {
    const { mesas, upsertMesa } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingMesa, setEditingMesa] = useState<Mesa | null>(null);

    const filteredMesas = mesas.filter(m =>
        m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddMesa = () => {
        const newId = `m${mesas.length + 1}`;
        const newMesa: Mesa = {
            id: newId,
            numero: mesas.length + 1,
            nombre: `Mesa ${mesas.length + 1}`,
            x: 0,
            y: 0,
            ubicacion: 'Salón',
            sector: 'Principal',
            estado: 'libre',
            capacidad: 4,
            splitMode: 'itemized',
            usuarios: [],
            totalMesa: 0,
            abierta: null,
            resenas: []
        };
        upsertMesa(newMesa);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestión de Mesas</h1>
                    <p className="text-slate-500">Administra las mesas y su ubicación física.</p>
                </div>
                <button
                    onClick={handleAddMesa}
                    className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-600 active:scale-95 shadow-md shadow-orange-500/20"
                >
                    <Plus className="h-5 w-5" />
                    Nueva Mesa
                </button>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o ubicación..."
                        className="w-full rounded-lg border-none bg-slate-50 pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-slate-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['Todos', 'Salón', 'Patio', 'Barra'].map((loc) => (
                        <button key={loc} className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                            {loc}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredMesas.map((mesa) => (
                    <MesaCard key={mesa.id} mesa={mesa} onEdit={(m) => setEditingMesa(m)} />
                ))}
            </div>

            {editingMesa && (
                <EditMesaModal
                    isOpen={true}
                    onClose={() => setEditingMesa(null)}
                    mesa={editingMesa}
                    onSave={(updated) => upsertMesa(updated)}
                />
            )}
        </div>
    );
}
