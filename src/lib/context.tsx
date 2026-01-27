'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { Mesa, UsuarioMesa } from '@/types/mesa';
import { Pedido } from '@/types/pedido';
import { api } from './api';

import { Notificacion } from "@/types/notificacion";

// Re-use existing interfaces
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
    setSplitMode: (mesaId: string, mode: 'equal' | 'itemized') => void;

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
    // Poll for real-time updates (every 2 seconds)
    const { data: mesasData } = useSWR<Mesa[]>('/api/mesas', fetcher, { refreshInterval: 2000 });
    const { data: pedidosData } = useSWR<Pedido[]>('/api/pedidos', fetcher, { refreshInterval: 2000 });
    const { data: notificacionesData } = useSWR<Notificacion[]>('/api/notificaciones', fetcher, { refreshInterval: 3000 });

    // Transacciones still local for now? or need API? Assuming local for demo or need API
    // For now keeping transacciones in state or minimal
    const [transacciones] = useState<Transaccion[]>([]);

    const mesas = mesasData || [];
    const pedidos = pedidosData || [];
    const notificaciones = notificacionesData || [];

    // --- Actions ---

    const upsertMesa = async (mesa: Mesa) => {
        await api.upsertMesa(mesa);
        mutate('/api/mesas');
    };

    const abrirMesa = async (mesaId: string) => {
        const mesa = mesas.find(m => m.id === mesaId);
        if (mesa) {
            await upsertMesa({ ...mesa, estado: 'ocupada', abierta: new Date(), usuarios: [] });
            // Clear notifications logic ideally backend-side or here
            // If backend, we'd need a clear endpoint. For now client-side logic is tricky with polling.
            // Ignore clearing for MVP or implement POST /api/notifications/clear
        }
    };

    const cerrarMesa = async (mesaId: string) => {
        const mesa = mesas.find(m => m.id === mesaId);
        if (mesa) {
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
        // Backend should handle user upsert if normalized, but here we embed in Mesa
        if (mesa) {
            const usuarios_new = [...(mesa.usuarios || []), usuario];
            await upsertMesa({ ...mesa, usuarios: usuarios_new });
        }
        return usuario;
    };

    // ... Implement other methods similarly using api calls ...
    // Placeholder implementations to allow compilation
    const agregarInvitadoManual = async () => { };
    const usuarioSeVa = async () => { };
    const setSplitMode = () => { };

    const addPedido = async (pedido: Pedido) => {
        await api.createPedido(pedido);
        mutate('/api/pedidos');
        // Create notification
        await api.createNotificacion({
            id: Math.random().toString(),
            tipo: 'order',
            mensaje: `Nuevo pedido`,
            mesaId: pedido.mesaId,
            timestamp: new Date()
        });
    };

    const updatePedidoEstado = async (id: string, estado: 'en_preparacion' | 'listo_para_entregar' | 'entregado' | 'cancelado') => {
        await api.updatePedidoEstado(id, estado);
        mutate('/api/pedidos');
    };

    const asignarItemAUsuario = () => { };
    const callWaiter = () => { };
    const addReview = () => { };

    const markNotificationRead = async (id: string) => {
        await api.markNotificacionRead(id);
        mutate('/api/notificaciones');
    };

    const getMesaTotal = () => 0; // Implement calc
    const getUsuarioTotal = () => 0;
    const pagarMesaCompleta = async () => { };

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
