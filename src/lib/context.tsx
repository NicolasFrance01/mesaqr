'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { Mesa, UsuarioMesa, Resena } from '@/types/mesa';
import { Pedido } from '@/types/pedido';
import { api } from './api';
import { Notificacion } from "@/types/notificacion";

export interface TransaccionItem {
    nombre: string;
    cantidad: number;
    precio: number;
}
export interface Transaccion {
    id: string;
    fecha: Date;
    mesaId: string;
    usuario: string;
    monto: number;
    items: TransaccionItem[];
    tipoPago: 'Bar' | 'Amigo';
    destinatarioAmigo?: string;
    rating?: number;
    comentario?: string;
}

interface AppContextType {
    mesas: Mesa[];
    pedidos: Pedido[];
    transacciones: Transaccion[];
    notificaciones: Notificacion[];

    // Actions
    abrirMesa: (mesaId: string) => Promise<void>;
    cerrarMesa: (mesaId: string) => Promise<void>;
    unirUsuarioAMesa: (mesaId: string, nombre: string) => Promise<UsuarioMesa>;
    agregarInvitadoManual: (mesaId: string, nombreInvitado: string) => Promise<void>;
    usuarioSeVa: (mesaId: string, usuarioId: string, metodoPago: 'Bar' | 'Amigo', amigoId?: string) => Promise<void>;
    setSplitMode: (mesaId: string, mode: 'equal' | 'itemized') => Promise<void>;

    addPedido: (pedido: Pedido) => Promise<void>;
    updatePedidoEstado: (pedidoId: string, estado: 'en_preparacion' | 'listo_para_entregar' | 'entregado' | 'cancelado') => Promise<void>;
    asignarItemAUsuario: (mesaId: string, pedidoId: string, itemId: string, usuarioId: string | undefined) => void;

    callWaiter: (mesaId: string) => void;
    addReview: (mesaId: string, rating: number, comentario: string) => void;
    markNotificationRead: (id: string) => void;

    upsertMesa: (mesa: Mesa) => Promise<void>;
    getMesaTotal: (mesaId: string) => number;
    getUsuarioTotal: (mesaId: string, usuarioId: string) => number;
    pagarMesaCompleta: (mesaId: string, usuarioId: string, metodoPago: 'Bar' | 'Amigo') => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function AppProvider({ children }: { children: React.ReactNode }) {
    // Poll for real-time updates
    const { data: mesasData } = useSWR<Mesa[]>('/api/mesas', fetcher, { refreshInterval: 2000 });
    const { data: pedidosData } = useSWR<Pedido[]>('/api/pedidos', fetcher, { refreshInterval: 2000 });
    const { data: notificacionesData } = useSWR<Notificacion[]>('/api/notificaciones', fetcher, { refreshInterval: 3000 });

    const [transacciones] = useState<Transaccion[]>([]);

    const mesas = mesasData || [];
    const pedidos = pedidosData || [];
    const notificaciones = notificacionesData || [];

    // --- Actions ---

    const upsertMesa = async (mesa: Mesa) => {
        // If manually freeing: clear notifications
        if (mesa.estado === 'libre') {
            await api.clearNotificaciones(mesa.id);
        }
        await api.upsertMesa(mesa);
        mutate('/api/mesas');
        mutate('/api/notificaciones'); // Refresh notifications
    };

    const abrirMesa = async (mesaId: string) => {
        const mesa = mesas.find(m => m.id === mesaId);
        if (mesa) {
            // Updated Refinement: Clear Old Notifications on Open
            await api.clearNotificaciones(mesaId);

            await upsertMesa({ ...mesa, estado: 'ocupada', abierta: new Date(), usuarios: [] });
        }
    };

    const cerrarMesa = async (mesaId: string) => {
        const mesa = mesas.find(m => m.id === mesaId);
        if (mesa) {
            // Updated Refinement: Clear on Close too
            await api.clearNotificaciones(mesaId);
            await upsertMesa({ ...mesa, estado: 'libre', abierta: null, usuarios: [], ownerId: undefined, resenas: [] });
        }
    };

    const unirUsuarioAMesa = async (mesaId: string, nombre: string) => {
        const mesa = mesas.find(m => m.id === mesaId);
        const usuario: UsuarioMesa = {
            id: Math.random().toString(36).substr(2, 9),
            nombre,
            pagado: false,
            totalPagado: 0,
            itemsConsumidos: [],
            mesaId
        };
        // If table was free, open it correctly
        if (mesa) {
            if (mesa.estado === 'libre') {
                // Trigger open logic to ensure clear
                await api.clearNotificaciones(mesaId);
            }
            const mesaUpdated = {
                ...mesa,
                usuarios: [...(mesa.usuarios || []), usuario],
                estado: mesa.estado === 'libre' ? 'ocupada' : mesa.estado,
                abierta: mesa.abierta || new Date(),
                ownerId: mesa.usuarios?.length === 0 ? usuario.id : mesa.ownerId
            } as Mesa;

            await upsertMesa(mesaUpdated);

            // Add notification if new open
            if (mesa.estado === 'libre') {
                // Hack for notification creation via API
                await api.createNotificacion({
                    id: Math.random().toString(),
                    tipo: 'payment', // reusing payment/info type
                    mensaje: `Mesa ${mesaId} abierta por ${nombre}`,
                    mesaId: mesaId,
                    timestamp: new Date()
                });
                mutate('/api/notificaciones');
            }
        }
        return usuario;
    };

    const agregarInvitadoManual = async (mesaId: string, nombreInvitado: string) => {
        await unirUsuarioAMesa(mesaId, nombreInvitado + " (Invitado)");
    };

    const setSplitMode = async (mesaId: string, mode: 'equal' | 'itemized') => {
        const mesa = mesas.find(m => m.id === mesaId);
        if (mesa) {
            await upsertMesa({ ...mesa, splitMode: mode });
        }
    };

    const addPedido = async (pedido: Pedido) => {
        await api.createPedido(pedido);
        await api.createNotificacion({
            id: Math.random().toString(),
            tipo: 'order',
            mensaje: `Nuevo pedido`,
            mesaId: pedido.mesaId,
            timestamp: new Date()
        });
        mutate('/api/pedidos');
        mutate('/api/notificaciones');
    };

    const updatePedidoEstado = async (id: string, estado: 'en_preparacion' | 'listo_para_entregar' | 'entregado' | 'cancelado') => {
        await api.updatePedidoEstado(id, estado);

        // Notifications Logic (Kitchen/Waiter)
        const pedido = pedidos.find(p => p.id === id);
        if (pedido) {
            if (estado === 'en_preparacion') {
                await api.createNotificacion({
                    id: Math.random().toString(),
                    tipo: 'kitchen',
                    mensaje: `Tu pedido se está preparando 🍳`,
                    mesaId: pedido.mesaId,
                    timestamp: new Date()
                });
            } else if (estado === 'listo_para_entregar') {
                await api.createNotificacion({
                    id: Math.random().toString(),
                    tipo: 'waiter',
                    mensaje: `¡Tu pedido está listo para servir! 💁‍♂️`,
                    mesaId: pedido.mesaId,
                    timestamp: new Date()
                });
            } else if (estado === 'entregado') {
                await api.createNotificacion({
                    id: Math.random().toString(),
                    tipo: 'kitchen',
                    mensaje: `¡Pedido entregado! Buen provecho 🍽️`,
                    mesaId: pedido.mesaId,
                    timestamp: new Date()
                });
            }
        }
        mutate('/api/pedidos');
        mutate('/api/notificaciones');
    };

    const callWaiter = async (mesaId: string) => {
        const mesa = mesas.find(m => m.id === mesaId);
        await api.createNotificacion({
            id: Math.random().toString(),
            tipo: 'waiter',
            mensaje: `Mesa ${mesa?.nombre} llama al mozo!`,
            mesaId,
            timestamp: new Date()
        });
        mutate('/api/notificaciones');
    };

    const addReview = async (mesaId: string, rating: number, comentario: string) => {
        const resena: Resena = {
            id: Math.random().toString(36).substr(2, 9),
            mesaId,
            rating,
            comentario,
            fecha: new Date()
        };
        const mesa = mesas.find(m => m.id === mesaId);
        if (mesa) {
            // Append review
            await upsertMesa({ ...mesa, resenas: [...(mesa.resenas || []), resena] });

            await api.createNotificacion({
                id: Math.random().toString(),
                tipo: 'review',
                mensaje: `Nueva reseña de Mesa ${mesa.nombre}!`,
                mesaId,
                timestamp: new Date()
            });
            mutate('/api/notificaciones');
        }
    };

    const markNotificationRead = async (id: string) => {
        await api.markNotificacionRead(id);
        mutate('/api/notificaciones');
    };

    const usuarioSeVa = async (mesaId: string, usuarioId: string, metodoPago: 'Bar' | 'Amigo', amigoId?: string) => {
        // Complex logic: Calculate total, create transaction (local?), update user paid status
        // Since Transactions are local in this context example (const [transacciones]), we keep them local or mock them
        // But for Mesa update we use API.

        const mesa = mesas.find(m => m.id === mesaId);
        const usuario = mesa?.usuarios.find(u => u.id === usuarioId);
        if (!mesa || !usuario) return;

        const total = getUsuarioTotal(mesaId, usuarioId);

        // Update User Paid status
        const updatedUsuarios = mesa.usuarios.map(u => u.id === usuarioId ? { ...u, pagado: true, totalPagado: total } : u);
        const allPaid = updatedUsuarios.every(u => u.pagado);

        if (allPaid) {
            // Auto-close
            await upsertMesa({
                ...mesa,
                estado: 'libre',
                usuarios: [],
                ownerId: undefined,
                resenas: [],
                abierta: null,
                totalMesa: 0
            });
            // Clear Notifications
            await api.clearNotificaciones(mesaId);

            await api.createNotificacion({
                id: Math.random().toString(),
                tipo: 'payment',
                mensaje: `Mesa ${mesa.nombre} cerrada por pago completo.`,
                mesaId,
                timestamp: new Date()
            });
        } else {
            await upsertMesa({ ...mesa, usuarios: updatedUsuarios });
            await api.createNotificacion({
                id: Math.random().toString(),
                tipo: 'payment',
                mensaje: `${usuario.nombre} pagó $${total}`,
                mesaId,
                timestamp: new Date()
            });
        }
        mutate('/api/notificaciones');
    };

    const pagarMesaCompleta = async (mesaId: string, usuarioId: string, metodoPago: 'Bar' | 'Amigo') => {
        const mesa = mesas.find(m => m.id === mesaId);
        if (!mesa) return;

        // Clear Notifications (Refinement Phase 4)
        await api.clearNotificaciones(mesaId);

        // Close Table
        await upsertMesa({
            ...mesa,
            estado: 'libre',
            usuarios: [],
            ownerId: undefined,
            resenas: [],
            abierta: null,
            totalMesa: 0
        });

        await api.createNotificacion({
            id: Math.random().toString(),
            tipo: 'payment',
            mensaje: `Mesa ${mesa.nombre} cerrada por pago completo.`,
            mesaId,
            timestamp: new Date()
        });
        mutate('/api/notificaciones');
    };

    // Calculations (Client-side, based on synced data)
    const getMesaTotal = (mesaId: string) => {
        const pedidosMesa = pedidos.filter(p => p.mesaId === mesaId && p.estado !== 'cancelado');
        return pedidosMesa.reduce((totalPedido, pedido) => {
            return totalPedido + pedido.items.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
        }, 0);
    };

    const getUsuarioTotal = (mesaId: string, usuarioId: string) => {
        const mesa = mesas.find(m => m.id === mesaId);
        if (!mesa) return 0;
        if (mesa.splitMode === 'equal') {
            const totalMesa = getMesaTotal(mesaId);
            return mesa.usuarios.length > 0 ? totalMesa / mesa.usuarios.length : 0;
        }
        const pedidosMesa = pedidos.filter(p => p.mesaId === mesaId && p.estado !== 'cancelado');
        let total = 0;
        pedidosMesa.forEach(p => {
            p.items.forEach(item => {
                const costoItem = item.producto.precio * item.cantidad;
                if (item.asignadoA === usuarioId) {
                    total += costoItem;
                } else if (!item.asignadoA) {
                    if (mesa.usuarios.length) {
                        total += costoItem / mesa.usuarios.length;
                    }
                }
            });
        });
        return total;
    };

    const asignarItemAUsuario = async (mesaId: string, pedidoId: string, itemId: string, usuarioId: string | undefined) => {
        // This needs API endpoint or full pedido update. 
        // For now, assuming we don't have deep item update, we rely on local calc or would need to implement UpdatePedido logic deeper.
        // Let's assume we can't persist this easily yet without 'updatePedido'.
        // Placeholder: Just log or todo.
        // Real implementation:
        /*
        const pedido = pedidos.find(p => p.id === pedidoId);
        if(pedido) {
            const updatedItems = pedido.items.map(i => i.id === itemId ? {...i, asignadoA: usuarioId} : i);
            // Call API to update pedido items...
            // api.updatePedido(pedidoId, { items: updatedItems });
        }
        */
    };


    return (
        <AppContext.Provider value={{
            mesas, pedidos, transacciones, notificaciones,
            abrirMesa, cerrarMesa, unirUsuarioAMesa, agregarInvitadoManual, usuarioSeVa, setSplitMode,
            addPedido, updatePedidoEstado, asignarItemAUsuario,
            callWaiter, addReview, markNotificationRead,
            upsertMesa, getMesaTotal, getUsuarioTotal, pagarMesaCompleta
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
}
