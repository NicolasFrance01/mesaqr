import { Mesa } from "@/types/mesa";
import { Pedido } from "@/types/pedido";
import { Notificacion } from "@/types/notificacion";

// Helper to fetch JSON
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('API Error');
    return res.json();
};

export const api = {
    // Mesas
    getMesas: () => fetcher('/api/mesas'),
    upsertMesa: (mesa: Mesa) => fetch('/api/mesas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mesa)
    }),
    updateMesa: (id: string, data: Partial<Mesa>) => fetch(`/api/mesas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }),

    // Pedidos
    getPedidos: () => fetcher('/api/pedidos'),
    createPedido: (pedido: Pedido) => fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
    }),
    updatePedidoEstado: (id: string, estado: string) => fetch(`/api/pedidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado })
    }),

    // Notificaciones
    getNotificaciones: () => fetcher('/api/notificaciones'),
    markNotificacionRead: (id: string) => fetch(`/api/notificaciones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leido: true })
    }),
    createNotificacion: (data: any) => fetch('/api/notificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }),
    clearNotificaciones: (mesaId: string) => fetch(`/api/notificaciones?mesaId=${mesaId}`, {
        method: 'DELETE'
    })
};
