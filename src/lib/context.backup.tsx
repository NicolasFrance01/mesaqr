'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Mesa, UsuarioMesa, Resena } from '@/types/mesa';
import { Pedido } from '@/types/pedido';
import { MESAS_INITIAL } from './mesasData';
import { PEDIDOS_INITIAL } from './pedidosData';

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

export interface Notificacion {
    id: string;
    tipo: 'order' | 'waiter' | 'payment' | 'review' | 'kitchen';
    mensaje: string;
    mesaId: string;
    leido: boolean;
    timestamp: Date;
}

interface AppContextType {
    mesas: Mesa[];
    pedidos: Pedido[];
    transacciones: Transaccion[];
    notificaciones: Notificacion[];

    // Mesa
    abrirMesa: (mesaId: string) => void;
    cerrarMesa: (mesaId: string) => void;
    unirUsuarioAMesa: (mesaId: string, nombre: string) => UsuarioMesa;
    agregarInvitadoManual: (mesaId: string, nombreInvitado: string) => void;
    usuarioSeVa: (mesaId: string, usuarioId: string, metodoPago: 'Bar' | 'Amigo', amigoId?: string) => void;
    setSplitMode: (mesaId: string, mode: 'equal' | 'itemized') => void;

    // Pedidos & Items
    addPedido: (pedido: Pedido) => void;
    updatePedidoEstado: (pedidoId: string, estado: 'en_preparacion' | 'listo_para_entregar' | 'entregado' | 'cancelado') => void;
    asignarItemAUsuario: (mesaId: string, pedidoId: string, itemId: string, usuarioId: string | undefined) => void;

    // Extras
    callWaiter: (mesaId: string) => void;
    addReview: (mesaId: string, rating: number, comentario: string) => void;
    markNotificationRead: (id: string) => void;

    // Data
    upsertMesa: (mesa: Mesa) => void;
    getMesaTotal: (mesaId: string) => number;
    getUsuarioTotal: (mesaId: string, usuarioId: string) => number;
    pagarMesaCompleta: (mesaId: string, usuarioId: string, metodoPago: 'Bar' | 'Amigo') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'mesa_qr_state_v3.1';

export function AppProvider({ children }: { children: React.ReactNode }) {
    // Initialize with defaults, but will hydrate from localStorage
    const [mesas, setMesas] = useState<Mesa[]>(MESAS_INITIAL.map(m => ({ ...m, splitMode: 'itemized' })));
    const [pedidos, setPedidos] = useState<Pedido[]>(PEDIDOS_INITIAL);
    const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // --- Persistence Logic ---

    // 1. Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);

                // Re-hydrate Dates properly
                // Re-hydrate Dates properly
                if (parsed.mesas) setMesas(parsed.mesas.map((m: any) => ({ ...m, abierta: m.abierta ? new Date(m.abierta) : null, resenas: m.resenas?.map((r: any) => ({ ...r, fecha: new Date(r.fecha) })) })));

                if (parsed.pedidos) {
                    // MIGRATION & CLEANUP: 
                    // 1. Explode old items with quantity > 1
                    // 2. Deduplicate orders by ID

                    const uniquePedidos = parsed.pedidos.filter((p: any, index: number, self: any[]) =>
                        index === self.findIndex((t: any) => t.id === p.id)
                    );

                    const migratedPedidos = uniquePedidos.map((p: any) => {
                        const explodedItems = p.items.flatMap((item: any) => {
                            if (item.cantidad > 1) {
                                return Array.from({ length: item.cantidad }).map(() => ({
                                    ...item,
                                    id: Math.random().toString(36).substr(2, 9), // New ID for split item
                                    cantidad: 1
                                }));
                            }
                            return item;
                        });
                        return { ...p, items: explodedItems, createdAt: new Date(p.createdAt) };
                    });
                    setPedidos(migratedPedidos);
                }

                if (parsed.transacciones) setTransacciones(parsed.transacciones.map((t: any) => ({ ...t, fecha: new Date(t.fecha) })));
                if (parsed.notificaciones) setNotificaciones(parsed.notificaciones.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })));
            } catch (e) {
                console.error("Failed to load state", e);
            }
        }
        setIsInitialized(true);
    }, []);

    // 2. Save to localStorage on change (only after init)
    useEffect(() => {
        if (!isInitialized) return;
        const state = { mesas, pedidos, transacciones, notificaciones };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [mesas, pedidos, transacciones, notificaciones, isInitialized]);

    // 3. Listen for changes in other tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue);
                    // Sync state
                    setMesas(parsed.mesas.map((m: any) => ({ ...m, abierta: m.abierta ? new Date(m.abierta) : null, resenas: m.resenas?.map((r: any) => ({ ...r, fecha: new Date(r.fecha) })) })));
                    setPedidos(parsed.pedidos.map((p: any) => ({ ...p, createdAt: new Date(p.createdAt) })));
                    setTransacciones(parsed.transacciones.map((t: any) => ({ ...t, fecha: new Date(t.fecha) })));
                    setNotificaciones(parsed.notificaciones.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })));
                } catch (e) {
                    console.error("Sync error", e);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);


    const addNotification = (tipo: Notificacion['tipo'], mensaje: string, mesaId: string) => {
        setNotificaciones(prev => [{
            id: Math.random().toString(36).substr(2, 9),
            tipo,
            mensaje,
            mesaId,
            leido: false,
            timestamp: new Date()
        }, ...prev]);
    };

    const markNotificationRead = (id: string) => {
        setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n));
    };

    const abrirMesa = (mesaId: string) => {
        setMesas(prev => prev.map(m => m.id === mesaId ? { ...m, estado: 'ocupada', abierta: new Date(), usuarios: [] } : m));
        // Clear notifications for the new session
        setNotificaciones(prev => prev.filter(n => n.mesaId !== mesaId));
    };

    const cerrarMesa = (mesaId: string) => {
        setMesas(prev => prev.map(m => m.id === mesaId ? { ...m, estado: 'libre', abierta: null, usuarios: [], totalMesa: 0, ownerId: undefined, resenas: [] } : m));
    };

    const unirUsuarioAMesa = (mesaId: string, nombre: string): UsuarioMesa => {
        const nuevoUsuario: UsuarioMesa = {
            id: Math.random().toString(36).substr(2, 9),
            nombre,
            pagado: false,
            totalPagado: 0,
            itemsConsumidos: []
        };

        setMesas(prev => prev.map(m => {
            if (m.id === mesaId) {
                // Auto-abrir mesa si estaba libre
                const nuevoEstado = m.estado === 'libre' ? 'ocupada' : m.estado;
                const fechaAbierta = m.abierta || new Date();
                const nuevosUsuarios = [...(m.usuarios || []), nuevoUsuario];

                // Asignar Owner si es el primero
                const ownerId = m.usuarios?.length === 0 ? nuevoUsuario.id : m.ownerId;

                // Notificar al dashboard si la mesa pasa a ocupada
                if (m.estado === 'libre') {
                    // We can't call addNotification here directly because of closure scope possibly being stale if not careful, 
                    // but since we are inside the component function scope, it's fine if we updating state via setter.
                    // HOWEVER, React batching might be an issue if we depend on `notificaciones` state directly.
                    // Better to use setNotificaciones directly here or just let the effect sync it?
                    // Let's rely on setNotificaciones.
                    // We'll add it to the state directly in the next render cycle effectively? 
                    // Ideally we'd separate this notification logic but for this simple app:
                    // We will trigger a notification separately in a useEffect or here.
                }

                return {
                    ...m,
                    estado: nuevoEstado,
                    abierta: fechaAbierta,
                    usuarios: nuevosUsuarios,
                    ownerId: ownerId || nuevoUsuario.id,
                    splitMode: m.splitMode || 'itemized'
                };
            }
            return m;
        }));

        // Quick Hack: Add notification directly here to ensure IT SAVES TO STATE
        if (mesas.find(m => m.id === mesaId)?.estado === 'libre') {
            setTimeout(() => addNotification('payment', `Mesa ${mesaId} abierta por ${nombre}`, mesaId), 100);
        }

        return nuevoUsuario;
    };

    const agregarInvitadoManual = (mesaId: string, nombreInvitado: string) => {
        unirUsuarioAMesa(mesaId, nombreInvitado + " (Invitado)");
    };

    const setSplitMode = (mesaId: string, mode: 'equal' | 'itemized') => {
        setMesas(prev => prev.map(m => m.id === mesaId ? { ...m, splitMode: mode } : m));
    };

    const callWaiter = (mesaId: string) => {
        const mesa = mesas.find(m => m.id === mesaId);
        addNotification('waiter', `Mesa ${mesa?.nombre} llama al mozo!`, mesaId);
    };

    const addReview = (mesaId: string, rating: number, comentario: string) => {
        const resena: Resena = {
            id: Math.random().toString(36).substr(2, 9),
            mesaId,
            rating,
            comentario,
            fecha: new Date()
        };

        setMesas(prev => prev.map(m => m.id === mesaId ? { ...m, resenas: [...(m.resenas || []), resena] } : m));
        addNotification('review', `Nueva reseña de Mesa ${mesaId}!`, mesaId);

        // Update latest transaction for this table (if exists within last hour?)
        setTransacciones(prev => {
            // Find most recent transaction for this table
            const tableTransactions = prev.filter(t => t.mesaId === mesaId).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
            if (tableTransactions.length > 0) {
                const latestId = tableTransactions[0].id;
                return prev.map(t => t.id === latestId ? { ...t, rating, comentario } : t);
            }
            return prev;
        });
    };

    const usuarioSeVa = (mesaId: string, usuarioId: string, metodoPago: 'Bar' | 'Amigo', amigoId?: string) => {
        const mesa = mesas.find(m => m.id === mesaId);
        const usuario = mesa?.usuarios.find(u => u.id === usuarioId);
        if (!mesa || !usuario) return;

        requestAnimationFrame(() => {
            const total = getUsuarioTotal(mesaId, usuarioId);

            // Calculate items for record
            const transaccionItems: TransaccionItem[] = [];
            const pedidosMesa = pedidos.filter(p => p.mesaId === mesaId && p.estado !== 'cancelado');

            pedidosMesa.forEach(p => {
                p.items.forEach(item => {
                    if (mesa.splitMode === 'equal') {
                        // In equal mode, every item is split
                        if (mesa.usuarios.length > 0) {
                            transaccionItems.push({
                                nombre: item.producto.nombre + " (Split)",
                                cantidad: item.cantidad / mesa.usuarios.length,
                                precio: (item.producto.precio * item.cantidad) / mesa.usuarios.length
                            });
                        }
                    } else {
                        // Itemized
                        if (item.asignadoA === usuarioId) {
                            transaccionItems.push({
                                nombre: item.producto.nombre,
                                cantidad: item.cantidad,
                                precio: item.producto.precio * item.cantidad
                            });
                        } else if (!item.asignadoA && mesa.usuarios.length > 0) {
                            transaccionItems.push({
                                nombre: item.producto.nombre + " (Compartido)",
                                cantidad: item.cantidad / mesa.usuarios.length,
                                precio: (item.producto.precio * item.cantidad) / mesa.usuarios.length
                            });
                        }
                    }
                });
            });

            // Registrar Transacción
            const nuevaTrans: Transaccion = {
                id: Math.random().toString(36).substr(2, 9),
                fecha: new Date(),
                mesaId,
                usuario: usuario.nombre,
                monto: total,
                items: transaccionItems,
                tipoPago: metodoPago,
                destinatarioAmigo: amigoId ? mesa.usuarios.find(u => u.id === amigoId)?.nombre : undefined
            };

            // Clear notifications for this mesa
            setNotificaciones(prev => prev.filter(n => n.mesaId !== mesaId));

            // Save Transaction
            setTransacciones(prev => [...prev, nuevaTrans]);

            // Marcar usuario como pagado
            setMesas(prev => prev.map(m => {
                if (m.id !== mesaId) return m;

                // Check if ALL users have paid (including this one being processed)
                const updatedUsuarios = m.usuarios.map(u => u.id === usuarioId ? { ...u, pagado: true, totalPagado: total } : u);
                const allPaid = updatedUsuarios.every(u => u.pagado);

                if (allPaid) {
                    // Auto-close table
                    addNotification('payment', `Mesa ${mesa.nombre} completamente pagada. Liberando mesa...`, mesaId);

                    // CLEAR ORDERS FOR THIS TABLE
                    setPedidos(prev => prev.filter(p => p.mesaId !== mesaId));

                    return {
                        ...m,
                        estado: 'libre',
                        usuarios: [],
                        ownerId: undefined,
                        resenas: [],
                        abierta: null,
                        totalMesa: 0
                    };
                }

                return {
                    ...m,
                    usuarios: updatedUsuarios
                };
            }));

            addNotification('payment', `${usuario.nombre} pagó $${total} en Mesa ${mesa.nombre}`, mesaId);
        });
    };

    const addPedido = (pedido: Pedido) => {
        setPedidos(prev => [...prev, pedido]);
        setMesas(prev => prev.map(m => m.id === pedido.mesaId ? { ...m, estado: 'ocupada' } : m));

        const mesa = mesas.find(m => m.id === pedido.mesaId);
        if (mesa) addNotification('order', `Nuevo pedido en ${mesa.nombre}`, mesa.id);
    };

    const updatePedidoEstado = (pedidoId: string, estado: 'en_preparacion' | 'listo_para_entregar' | 'entregado' | 'cancelado') => {
        setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, estado } : p));

        const pedido = pedidos.find(p => p.id === pedidoId);
        if (pedido) {
            const mesa = mesas.find(m => m.id === pedido.mesaId);
            if (estado === 'en_preparacion') {
                addNotification('kitchen', `Tu pedido se está preparando 🍳`, pedido.mesaId);
            } else if (estado === 'listo_para_entregar') {
                addNotification('waiter', `¡Tu pedido está listo para servir! 💁‍♂️`, pedido.mesaId);
            } else if (estado === 'entregado') {
                addNotification('kitchen', `¡Pedido entregado! Buen provecho 🍽️`, pedido.mesaId);
            }
        }
    };

    const asignarItemAUsuario = (mesaId: string, pedidoId: string, itemId: string, usuarioId: string | undefined) => {
        setPedidos(prev => prev.map(pedido => {
            if (pedido.id !== pedidoId) return pedido;
            return {
                ...pedido,
                items: pedido.items.map(item => item.id === itemId ? { ...item, asignadoA: usuarioId } : item)
            };
        }));
    };

    const upsertMesa = (mesa: Mesa) => {
        setMesas(prev => {
            const exists = prev.find(m => m.id === mesa.id);
            // Logic to clear data if setting to 'libre' manually
            if (mesa.estado === 'libre') {
                mesa.usuarios = [];
                mesa.ownerId = undefined;
                mesa.totalMesa = 0;
                mesa.abierta = null;
                mesa.resenas = [];
                // CLEAR ORDERS
                setPedidos(prevOrders => prevOrders.filter(p => p.mesaId !== mesa.id));
                // CLEAR NOTIFICATIONS
                setNotificaciones(prev => prev.filter(n => n.mesaId !== mesa.id));
            }
            if (exists) return prev.map(m => m.id === mesa.id ? mesa : m);
            return [...prev, mesa];
        });
    };

    const pagarMesaCompleta = (mesaId: string, usuarioId: string, metodoPago: 'Bar' | 'Amigo') => {
        const mesa = mesas.find(m => m.id === mesaId);
        if (!mesa) return;

        const totalMesa = getMesaTotal(mesaId);

        // Calculate all items for the table
        const transaccionItems: TransaccionItem[] = [];
        const pedidosMesa = pedidos.filter(p => p.mesaId === mesaId && p.estado !== 'cancelado');
        pedidosMesa.forEach(p => {
            p.items.forEach(item => {
                transaccionItems.push({
                    nombre: item.producto.nombre,
                    cantidad: item.cantidad,
                    precio: item.producto.precio * item.cantidad
                });
            });
        });

        // 1. Transaction for the Full Amount
        const nuevaTrans: Transaccion = {
            id: Math.random().toString(36).substr(2, 9),
            fecha: new Date(),
            mesaId,
            usuario: mesa.usuarios.find(u => u.id === usuarioId)?.nombre || 'Encargado',
            monto: totalMesa,
            items: transaccionItems,
            tipoPago: metodoPago
        };
        setTransacciones(prev => [...prev, nuevaTrans]);

        // 2. Mark ALL users as paid -> Triggers Auto-Close logic
        setMesas(prev => prev.map(m => {
            if (m.id !== mesaId) return m;

            // We directly close the table here to be safe and instant
            addNotification('payment', `Mesa ${mesa.nombre} cerrada por pago completo.`, mesaId);

            // CLEAR ORDERS
            setPedidos(prevOrders => prevOrders.filter(p => p.mesaId !== mesaId));

            // CLEAR NOTIFICATIONS
            setNotificaciones(prev => prev.filter(n => n.mesaId !== mesaId));

            return {
                ...m,
                estado: 'libre',
                usuarios: [],
                ownerId: undefined,
                resenas: [],
                abierta: null,
                totalMesa: 0
            };
        }));
    };

    const getUsuarioTotal = (mesaId: string, usuarioId: string) => {
        // Logic duplicated for calculation, need to be careful with closure
        // But we are using the 'state' mesas which works fine in render
        // BUT inside usuarioSeVa we need latest state. 
        // Using 'mesas' from closure is potentially risky if state pending.
        // For this app size, it works usually.

        const mesa = mesas.find(m => m.id === mesaId);
        if (!mesa) return 0;

        if (mesa.splitMode === 'equal') {
            const totalMesa = getMesaTotal(mesaId);
            return mesa.usuarios.length > 0 ? totalMesa / mesa.usuarios.length : 0;
        }

        const pedidosMesa = pedidos.filter(p => p.mesaId === mesaId && p.estado !== 'cancelado');
        let total = 0;

        // const usuariosActivos = mesa.usuarios.filter(u => !u.pagado) || [];
        // const esCandidato = usuariosActivos.some(u => u.id === usuarioId);

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

    const getMesaTotal = (mesaId: string) => {
        const pedidosMesa = pedidos.filter(p => p.mesaId === mesaId && p.estado !== 'cancelado');
        return pedidosMesa.reduce((totalPedido, pedido) => {
            return totalPedido + pedido.items.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
        }, 0);
    };

    return (
        <AppContext.Provider
            value={{
                mesas,
                pedidos,
                transacciones,
                notificaciones,
                abrirMesa,
                cerrarMesa,
                unirUsuarioAMesa,
                agregarInvitadoManual,
                usuarioSeVa,
                addPedido,
                updatePedidoEstado,
                asignarItemAUsuario,
                upsertMesa,
                getMesaTotal,
                getUsuarioTotal,
                setSplitMode,
                callWaiter,
                addReview,
                markNotificationRead,
                pagarMesaCompleta
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) throw new Error('useApp must be used within an AppProvider');
    return context;
}
