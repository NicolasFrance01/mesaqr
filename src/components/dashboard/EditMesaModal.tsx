'use client';

import React, { useState, useEffect } from 'react';
import { Mesa } from '@/types/mesa';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditMesaModalProps {
    isOpen: boolean;
    onClose: () => void;
    mesa: Mesa;
    onSave: (mesa: Mesa) => void;
}

export function EditMesaModal({ isOpen, onClose, mesa, onSave }: EditMesaModalProps) {
    const [formData, setFormData] = useState<Mesa>(mesa);

    useEffect(() => {
        setFormData(mesa);
    }, [mesa]);

    if (!isOpen) return null;

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
                        <h3 className="font-bold text-lg dark:text-white">Editar Mesa</h3>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                            <input
                                className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:bg-slate-800 dark:border-slate-700"
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Capacidad</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:bg-slate-800 dark:border-slate-700"
                                    value={formData.capacidad}
                                    onChange={e => setFormData({ ...formData, capacidad: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ubicación</label>
                                <select
                                    className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:bg-slate-800 dark:border-slate-700"
                                    value={formData.ubicacion}
                                    onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
                                >
                                    <option value="Salón">Salón</option>
                                    <option value="Patio">Patio</option>
                                    <option value="Barra">Barra</option>
                                    <option value="Terraza">Terraza</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado (Manual)</label>
                            <select
                                className="w-full rounded-lg border border-slate-200 p-2 text-sm dark:bg-slate-800 dark:border-slate-700"
                                value={formData.estado}
                                onChange={e => setFormData({ ...formData, estado: e.target.value as any })}
                            >
                                <option value="libre">Libre</option>
                                <option value="ocupada">Ocupada</option>
                                <option value="pagando">Pagando</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800 flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => { onSave(formData); onClose(); }}
                            className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg active:scale-95 dark:bg-white dark:text-slate-900"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
