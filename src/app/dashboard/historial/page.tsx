'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Printer, Search, Star, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

function TimeDisplay({ date }: { date: any }) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    if (!mounted) return <span className="text-xs text-slate-500">--:--</span>;

    try {
        const time = new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return <span className="text-xs text-slate-500">{time}</span>;
    } catch (e) {
        return <span className="text-xs text-slate-500">--:--</span>;
    }
}

export default function HistorialPage() {
    const { transacciones } = useApp();

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMesa, setSelectedMesa] = useState('all');
    const [minStars, setMinStars] = useState(0);

    const handlePrint = () => {
        window.print();
    };

    // FILTER LOGIC
    const filteredTransacciones = transacciones.filter(t => {
        const tDate = new Date(t.fecha);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        // Date Range
        if (start && tDate < start) return false;
        if (end) {
            const endOfDay = new Date(end);
            endOfDay.setHours(23, 59, 59, 999);
            if (tDate > endOfDay) return false;
        }

        // Mesa
        if (selectedMesa !== 'all' && t.mesaId !== selectedMesa) return false;

        // Stars: Exact match 1-5, or All (0)
        if (minStars > 0 && t.rating !== minStars) return false;

        // Search (User, Product Name)
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const userMatch = t.usuario.toLowerCase().includes(searchLower);
            const productMatch = t.items.some((item: any) => {
                if (typeof item === 'string') return item.toLowerCase().includes(searchLower);
                return item.nombre.toLowerCase().includes(searchLower);
            });
            const mesaMatch = t.mesaId.toLowerCase().includes(searchLower);
            if (!userMatch && !productMatch && !mesaMatch) return false;
        }

        return true;
    }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    // CALCULATE DETAILED TOTALS
    const totalBar = filteredTransacciones.filter(t => t.tipoPago === 'Bar').reduce((acc, t) => acc + t.monto, 0);
    const totalItemsCount = filteredTransacciones.reduce((acc, t) => acc + t.items.reduce((sum, i: any) => {
        if (typeof i === 'string') return sum + 1;
        return sum + i.cantidad;
    }, 0), 0);

    // Calculate Average Rating for filtered set
    const ratedTransactions = filteredTransacciones.filter(t => t.rating);
    const avgRating = ratedTransactions.length > 0
        ? ratedTransactions.reduce((acc, t) => acc + (t.rating || 0), 0) / ratedTransactions.length
        : 0;

    // UNIQUE MESAS FOR FILTER
    const uniqueMesas = Array.from(new Set(transacciones.map(t => t.mesaId))).sort();

    return (
        <div className="space-y-8">
            {/* Screen Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reportes de Caja</h1>
                    <p className="text-slate-500">Historial de pagos y cierres de mesa.</p>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                >
                    <Printer className="h-4 w-4" />
                    Imprimir Reporte
                </button>
            </div>

            {/* FILTERS */}
            <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:grid-cols-5 no-print">
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Desde</label>
                    <input
                        type="date"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm outline-none focus:border-orange-500 dark:border-slate-800 dark:bg-slate-900"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Hasta</label>
                    <input
                        type="date"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm outline-none focus:border-orange-500 dark:border-slate-800 dark:bg-slate-900"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Mesa</label>
                    <select
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm outline-none focus:border-orange-500 dark:border-slate-800 dark:bg-slate-900"
                        value={selectedMesa}
                        onChange={(e) => setSelectedMesa(e.target.value)}
                    >
                        <option value="all">Todas las mesas</option>
                        {uniqueMesas.map(m => (
                            <option key={m} value={m}>Mesa {m.replace('m', '')}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Estrellas</label>
                    <select
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm outline-none focus:border-orange-500 dark:border-slate-800 dark:bg-slate-900"
                        value={minStars}
                        onChange={(e) => setMinStars(Number(e.target.value))}
                    >
                        <option value={0}>Todas</option>
                        <option value={5}>5 Estrellas</option>
                        <option value={4}>4 Estrellas</option>
                        <option value={3}>3 Estrellas</option>
                        <option value={2}>2 Estrellas</option>
                        <option value={1}>1 Estrella</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Buscar</label>
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Usuario..."
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-2 text-sm outline-none focus:border-orange-500 dark:border-slate-800 dark:bg-slate-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* PRINT HEADER (Custom Layout) */}
            <div className="hidden print-header mb-8">
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Mesa QR Reporte</h1>
                        <p className="text-slate-500 mt-2 font-medium">Informe de Cierre de Caja y Calidad</p>
                    </div>
                    <div className="text-right">
                        <div className="bg-slate-100 p-4 rounded-xl inline-block">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Periodo</p>
                            <p className="text-3xl font-black text-slate-900">{formatCurrency(totalBar)}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500 uppercase font-bold text-center">Fecha Reporte</p>
                        <p className="text-lg font-bold text-slate-800 text-center">{new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500 uppercase font-bold text-center">Transacciones</p>
                        <p className="text-lg font-bold text-slate-800 text-center">{filteredTransacciones.length}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500 uppercase font-bold text-center">Items Vendidos</p>
                        <p className="text-lg font-bold text-slate-800 text-center">{Math.round(totalItemsCount)}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                        <p className="text-xs text-yellow-700 uppercase font-bold text-center">Satisfacción</p>
                        <div className="flex items-center justify-center gap-1">
                            <span className="text-lg font-bold text-yellow-800">{avgRating > 0 ? avgRating.toFixed(1) : '-'}</span>
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 table-wrapper">

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Fecha / ID</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs w-[40%]">Detalle Consumo</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Opinión</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredTransacciones.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 break-inside-avoid">
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white">{new Date(t.fecha).toLocaleDateString()}</span>
                                            <TimeDisplay date={t.fecha} />
                                            <span className="text-[10px] text-slate-400 font-mono mt-1">#{t.id.substr(0, 6)}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 align-top">
                                        <div className="mb-2 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            Mesa {t.mesaId.replace('m', '')}
                                            {t.tipoPago === 'Amigo' && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">TRANSFER</span>}
                                        </div>
                                        {t.items.length > 0 ? (
                                            <ul className="space-y-1">
                                                {t.items.map((item: any, idx) => {
                                                    if (typeof item === 'string') {
                                                        return (
                                                            <li key={idx} className="text-xs text-slate-500 border-b border-dashed border-slate-100 pb-1 last:border-0 last:pb-0 dark:border-slate-800">
                                                                {item}
                                                            </li>
                                                        );
                                                    }
                                                    return (
                                                        <li key={idx} className="flex justify-between text-xs border-b border-dashed border-slate-100 pb-1 last:border-0 last:pb-0 dark:border-slate-800">
                                                            <span className="text-slate-700 dark:text-slate-300">
                                                                {item.cantidad > 0.99 ? Math.round(item.cantidad) : item.cantidad.toFixed(2)}x {item.nombre}
                                                            </span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Sin detalle</span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 align-top">
                                        {t.rating ? (
                                            <div className="bg-yellow-50/50 p-2 rounded-lg border border-yellow-100">
                                                <div className="flex gap-0.5 mb-1">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star key={star} className={cn("h-3 w-3", star <= t.rating! ? "fill-yellow-400 text-yellow-400" : "text-slate-200")} />
                                                    ))}
                                                </div>
                                                {t.comentario && (
                                                    <p className="text-[10px] text-slate-600 italic leading-snug">"{t.comentario}"</p>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-300">-</span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white align-top">
                                        {formatCurrency(t.monto)}
                                    </td>
                                </tr>
                            ))}
                            {filteredTransacciones.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                                        No se encontraron transacciones con los filtros actuales.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold dark:bg-slate-900/50">
                            <tr>
                                <td colSpan={2} className="px-6 py-4 text-left uppercase tracking-wider text-xs text-slate-500">
                                    Resumen Periodo
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-600">
                                    {Math.round(totalItemsCount)} Productos Totales
                                </td>
                                <td className="px-6 py-4 text-right uppercase tracking-wider text-slate-900 dark:text-white">
                                    Total Bar
                                </td>
                                <td className="px-6 py-4 text-right text-emerald-600 text-lg">
                                    {formatCurrency(totalBar)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <style jsx global>{`
        @media print {
          @page { margin: 1.5cm; }
          .no-print { display: none !important; }
          .print-header { display: block !important; }
          body { background: white; color: black; font-family: sans-serif; }
          .table-wrapper { border: none !important; box-shadow: none !important; }
          table { width: 100%; border-collapse: collapse; }
          th { border-bottom: 2px solid #000; color: #000; font-weight: 800; }
          td { border-bottom: 1px solid #eee; }
          /* Clean up badges for print */
          .bg-yellow-50\/50, .bg-orange-100 { background: none !important; border: none !important; padding: 0 !important; }
          .fill-yellow-400 { color: #000 !important; fill: #000 !important; }
          .text-yellow-400 { color: #000 !important; }
          .text-slate-200 { color: #ddd !important; } 
        }
      `}</style>
        </div>
    );
}
