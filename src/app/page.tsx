'use client';

import Link from 'next/link';
import { LayoutDashboard, QrCode, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white px-6 dark:from-slate-950 dark:to-slate-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-500 shadow-xl shadow-orange-500/20">
          <UtensilsCrossed className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-6xl">
          Mesa<span className="text-orange-600">QR</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Sistema inteligente de gestión gastronómica.</p>
      </motion.div>

      <div className="mt-12 grid w-full max-w-2xl gap-6 sm:grid-cols-2">
        <Link href="/dashboard">
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800">
                <LayoutDashboard className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange-600">Dashboard</h3>
            </div>
            <p className="mt-4 text-sm text-slate-500">Acceso para caja y administración. Gestión de mesas y pedidos en tiempo real.</p>
          </div>
        </Link>

        <Link href="/mesa/m1">
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-orange-100 p-3 dark:bg-orange-900/30">
                <QrCode className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange-600">Simular Mesa</h3>
            </div>
            <p className="mt-4 text-sm text-slate-500">Vista del cliente al escanear el QR. Selección de menú y envío de comanda.</p>
          </div>
        </Link>
      </div>

      <p className="mt-12 text-xs text-slate-400 uppercase tracking-widest font-semibold">Desarrollado con Next.js + Tailwind CSS</p>
    </div>
  );
}
