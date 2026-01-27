'use client';

import React from 'react';
import { MENU_DATA } from "@/lib/menuData";
import { formatCurrency } from "@/lib/utils";

export default function CartaDashboard() {
  const categorias = Array.from(new Set(MENU_DATA.map(m => m.categoria)));

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Carta del local</h1>
        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 dark:bg-white dark:text-slate-900">
          ➕ Agregar producto
        </button>
      </div>

      <div className="space-y-8">
        {categorias.map(cat => (
          <div key={cat} className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-slate-700 dark:text-slate-200">{cat}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {MENU_DATA.filter(p => p.categoria === cat).map(prod => (
                <div key={prod.id} className="flex justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{prod.nombre}</p>
                    {prod.descripcion && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{prod.descripcion}</p>}
                  </div>
                  <div className="text-right flex flex-col justify-between">
                    <p className="font-bold text-orange-600">{formatCurrency(prod.precio)}</p>
                    <div className="flex gap-2 mt-2">
                      <button className="text-xs border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">Editar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
