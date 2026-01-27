'use client';

import React from 'react';
import { useApp } from '@/lib/context';
import Link from 'next/link';
import { Users, DollarSign, ChefHat, TrendingUp, AlertCircle, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function DashboardOverview() {
  const { mesas, pedidos } = useApp();

  const totalVentas = pedidos
    .filter(p => p.estado === 'entregado')
    .reduce((acc, p) => acc + p.total, 0);

  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente').length;
  const mesasOcupadas = mesas.filter(m => m.estado !== 'libre').length;

  const stats = [
    { label: 'Ventas del Día', value: formatCurrency(totalVentas), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Pedidos Pendientes', value: pedidosPendientes, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Mesas Ocupadas', value: mesasOcupadas, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Pedidos', value: pedidos.length, icon: Package, color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Panel de Control</h1>
        <p className="text-slate-500">Resumen operativo del local.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <div className={`rounded-xl ${stat.bg} p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Actividad Reciente</h3>
          <div className="mt-4 space-y-4">
            {pedidos.slice(-5).reverse().map((pedido) => (
              <div key={pedido.id} className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Pedido #{pedido.id.slice(-4)}</p>
                  <p className="text-xs text-slate-500">Mesa {pedido.mesaId.replace('m', '')} - {formatCurrency(pedido.total)}</p>
                </div>
                <span className="text-xs text-slate-400">{new Date(pedido.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-900/30">
                <ChefHat className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Estado de Cocina</h2>
            </div>
            <Link href="/dashboard/cocina" className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline">
              Ver más
            </Link>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl dark:bg-slate-800">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Pendientes</span>
              <span className="font-bold text-slate-900 dark:text-white">{pedidos.filter(p => p.estado === 'pendiente').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl dark:bg-orange-900/20">
              <span className="text-sm font-medium text-orange-800 dark:text-orange-200">En Preparación</span>
              <span className="font-bold text-orange-700 dark:text-orange-400">{pedidos.filter(p => p.estado === 'en_preparacion').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
