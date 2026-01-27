'use client';

import React, { useState, useEffect, use } from 'react';
import { useApp } from '@/lib/context';
import { MENU_DATA } from '@/lib/menuData';
import { MenuCard } from '@/components/mesa/MenuCard';
import { AssignmentModal } from '@/components/mesa/AssignmentModal';
import { ShoppingBag, UserPlus, FileText, CheckCircle2, Send, Wallet, Users, Bell, Star, HandPlatter } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { Producto } from '@/types/producto';
import { Pedido, ItemPedido } from '@/types/pedido';
import { UsuarioMesa } from '@/types/mesa';
import { CustomerNotifications } from '@/components/mesa/CustomerNotifications';

export default function MesaQRPage({ params }: { params: Promise<{ mesaId: string }> }) {
  const { mesaId } = use(params);
  const {
    mesas, pedidos, addPedido, unirUsuarioAMesa, usuarioSeVa,
    getUsuarioTotal, agregarInvitadoManual, setSplitMode, callWaiter, addReview, asignarItemAUsuario, getMesaTotal, pagarMesaCompleta
  } = useApp();

  const [usuario, setUsuario] = useState<UsuarioMesa | null>(null);
  const [nombreInput, setNombreInput] = useState('');
  const [carrito, setCarrito] = useState<ItemPedido[]>([]);
  const [view, setView] = useState<'menu' | 'cuenta' | 'review'>('menu');
  const [enviado, setEnviado] = useState(false);

  // Payment Mode State
  const [isFullPayment, setIsFullPayment] = useState(false);

  // Review State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Load user from local storage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem(`mesa_${mesaId}_user`);
    if (storedUserId) {
      const mesa = mesas.find(m => m.id === mesaId);
      const existingUser = mesa?.usuarios.find(u => u.id === storedUserId);
      if (existingUser) {
        setUsuario(existingUser);
      }
    }
  }, [mesaId, mesas]);

  const handleJoin = async () => {
    if (!nombreInput.trim()) return;
    const newUser = await unirUsuarioAMesa(mesaId, nombreInput);
    setUsuario(newUser);
    localStorage.setItem(`mesa_${mesaId}_user`, newUser.id);
  };

  const mesa = mesas.find(m => m.id === mesaId);
  const isOwner = mesa?.ownerId === usuario?.id;
  const pedidosMesa = pedidos.filter(p => p.mesaId === mesaId && p.estado !== 'cancelado');
  const totalCarrito = carrito.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);

  // Reset full payment mode when view changes
  useEffect(() => {
    if (view === 'menu') setIsFullPayment(false);
  }, [view]);

  // --- Logic for Menu ---
  const handleAdd = (producto: Producto) => {
    setCarrito(prev => {
      const existing = prev.find(item => item.producto.id === producto.id);
      if (existing) {
        return prev.map(item => item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { id: Math.random().toString(36), producto, cantidad: 1, asignadoA: usuario?.id }];
    });
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendPedido = async () => {
    if (carrito.length === 0 || !usuario || isProcessing) return;
    setIsProcessing(true);

    // EXPLODE ITEMS: "Burger x3" -> "Burger x1", "Burger x1", "Burger x1"
    const explodedItems = carrito.flatMap(item =>
      Array.from({ length: item.cantidad }).map(() => ({
        id: Math.random().toString(36).substr(2, 9),
        producto: item.producto,
        cantidad: 1, // Always 1 for granular assignment
        asignadoA: item.asignadoA || usuario.id
      }))
    );

    const nuevoPedido: Pedido = {
      id: Math.random().toString(36).substr(2, 9),
      mesaId,
      items: explodedItems,
      total: totalCarrito,
      estado: 'pendiente',
      createdAt: new Date(),
      usuarioId: usuario.id
    };
    addPedido(nuevoPedido);
    setEnviado(true);

    // Safety delay to prevent accidental new orders immediately
    setTimeout(() => {
      setCarrito([]);
      setIsProcessing(false);
      setEnviado(false);
    }, 300); // Quick clear but keep Envido logic

    setTimeout(() => setEnviado(false), 3000);
  };

  // --- Logic for Split & Pay ---
  const granTotalMesa = getMesaTotal(mesaId);
  const miTotal = usuario ? getUsuarioTotal(mesaId, usuario.id) : 0;

  const totalAPagar = isFullPayment ? granTotalMesa : miTotal;

  const handlePay = (metodo: 'Bar' | 'Amigo', amigoId?: string) => {
    if (!usuario) return;

    if (isFullPayment) {
      pagarMesaCompleta(mesaId, usuario.id, metodo);
    } else {
      usuarioSeVa(mesaId, usuario.id, metodo, amigoId);
    }

    // Trigger Review
    setView('review');
  };

  const submitReview = () => {
    addReview(mesaId, rating, comment);
    // Clear session locally
    setUsuario(null);
    localStorage.removeItem(`mesa_${mesaId}_user`);
    setView('menu'); // Reset view for next user? 
  };

  // --- Owner Logic ---
  const [inviteName, setInviteName] = useState('');
  const [assigningUser, setAssigningUser] = useState<UsuarioMesa | null>(null);

  const handleAddGuest = () => {
    if (!inviteName.trim()) return;
    agregarInvitadoManual(mesaId, inviteName);
    setInviteName('');
  };

  const handleAssignItem = (pedidoId: string, itemId: string, assign: boolean) => {
    if (!assigningUser) return;
    asignarItemAUsuario(mesaId, pedidoId, itemId, assign ? assigningUser.id : undefined);
  };

  if (!usuario) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
        <div className="w-full max-w-sm space-y-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-500 shadow-xl shadow-orange-500/20">
            <UserPlus className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bienvenido a {mesa?.nombre}</h1>
            <p className="mt-2 text-slate-500">Ingresa tu nombre para unirte a la mesa y pedir.</p>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Tu Nombre (ej: Nico)"
              className="w-full rounded-xl border border-slate-200 p-4 text-center text-lg outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-slate-800 dark:bg-slate-900"
              value={nombreInput}
              onChange={(e) => setNombreInput(e.target.value)}
            />
            <button
              onClick={handleJoin}
              disabled={!nombreInput.trim()}
              className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-slate-900"
            >
              Unirme a la Mesa
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white/80 px-4 py-3 backdrop-blur-md dark:bg-slate-900/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950">
            <ShoppingBag className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{usuario.nombre} @ {mesa?.nombre}</h1>
            <p className="text-xs text-slate-500">
              {mesa?.usuarios.length} comensales {isOwner && '(Dueño)'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => callWaiter(mesaId)} className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <HandPlatter className="h-5 w-5" />
          </button>
          <CustomerNotifications mesaId={mesaId} />
          <button onClick={() => setView('menu')} className={cn("p-2 rounded-lg", view === 'menu' ? "bg-orange-100 text-orange-600" : "text-slate-400")}>
            <ShoppingBag className="h-5 w-5" />
          </button>
          <button onClick={() => setView('cuenta')} className={cn("p-2 rounded-lg", view === 'cuenta' ? "bg-orange-100 text-orange-600" : "text-slate-400")}>
            <Wallet className="h-5 w-5" />
          </button>
        </div>
      </header>

      {view === 'review' ? (
        <main className="px-6 py-12 flex flex-col items-center text-center">
          <CheckCircle2 className="h-20 w-20 text-green-500 mb-6" />
          <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">¡Pago Exitoso!</h2>
          <p className="text-slate-500 mb-8">Gracias por visitarnos. ¿Qué tal estuvo todo?</p>

          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} onClick={() => setRating(star)}>
                <Star className={cn("h-8 w-8", star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300")} />
              </button>
            ))}
          </div>

          <textarea
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 mb-6"
            placeholder="Deja un comentario..."
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button
            onClick={submitReview}
            className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white shadow-lg active:scale-95 dark:bg-white dark:text-slate-900"
          >
            Enviar Opinión
          </button>
        </main>
      ) : view === 'menu' ? (
        <>
          {/* Owner Controls */}
          {isOwner && (
            <div className="mx-6 mt-4 p-4 bg-white rounded-xl shadow-sm dark:bg-slate-900 border border-orange-100 dark:border-orange-900/30">
              <h3 className="text-xs font-bold uppercase text-orange-600 mb-2">Panel de Dueño</h3>
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                {mesa?.usuarios?.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setAssigningUser(u)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm whitespace-nowrap active:scale-95 transition-all",
                      u.id === usuario.id ? "bg-orange-50 border-orange-200 text-orange-700 font-medium" : "bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                    )}
                  >
                    {u.nombre}
                    {u.id === mesa.ownerId && <Star className="h-3 w-3 text-orange-400 fill-orange-400" />}
                  </button>
                ))}
                <AssignmentModal
                  isOpen={!!assigningUser}
                  onClose={() => setAssigningUser(null)}
                  usuario={assigningUser!}
                  pedidos={pedidosMesa}
                  onAssign={handleAssignItem}
                />
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-slate-50 rounded-lg px-3 text-sm dark:bg-slate-800"
                  placeholder="Nombre invitado..."
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                />
                <button onClick={handleAddGuest} className="bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-bold">
                  + Invitado
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Modo Cuenta:</span>
                <div className="flex bg-slate-100 rounded-lg p-1 dark:bg-slate-800">
                  <button
                    onClick={() => setSplitMode(mesaId, 'itemized')}
                    className={cn("px-3 py-1 text-xs rounded-md font-medium transition-all", mesa?.splitMode === 'itemized' ? "bg-white shadow text-slate-900" : "text-slate-500")}
                  >
                    Por Items
                  </button>
                  <button
                    onClick={() => setSplitMode(mesaId, 'equal')}
                    className={cn("px-3 py-1 text-xs rounded-md font-medium transition-all", mesa?.splitMode === 'equal' ? "bg-white shadow text-slate-900" : "text-slate-500")}
                  >
                    Iguales
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Menu Categories */}
          <main className="px-6 py-6 space-y-8">
            {['Entradas', 'Platos Principales', 'Bebidas', 'Postres'].map((cat) => (
              <section key={cat}>
                <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">{cat}</h3>
                <div className="grid gap-3">
                  {MENU_DATA.filter(p => p.categoria === cat).map((producto) => (
                    <MenuCard key={producto.id} producto={producto} onAdd={handleAdd} />
                  ))}
                </div>
              </section>
            ))}
          </main>

          {/* Cart Float */}
          {carrito.length > 0 && (
            <div className="fixed bottom-6 left-6 right-6 z-20 overflow-hidden rounded-2xl bg-slate-900 p-4 shadow-2xl dark:bg-white text-white dark:text-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-70">{carrito.length} productos seleccionados</p>
                  <p className="text-xl font-bold">{formatCurrency(totalCarrito)}</p>
                </div>
                {enviado ? (
                  <span className="flex items-center gap-2 text-green-400 font-bold"><CheckCircle2 className="h-5 w-5" /> Enviado</span>
                ) : (
                  <button
                    onClick={handleSendPedido}
                    className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition-all active:scale-95"
                  >
                    Pedir
                    <Send className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        // --- CUENTA / SPLIT VIEW ---
        <main className="px-6 py-8 space-y-8">
          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Tu Consumo</h2>
            {mesa?.splitMode === 'equal' && (
              <div className="mb-6 space-y-2">
                <div className="p-4 bg-slate-100 rounded-xl text-center dark:bg-slate-800">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Mesa</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(granTotalMesa)}</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm text-center font-medium">
                  Dividido en partes iguales ({formatCurrency(granTotalMesa)} / {mesa.usuarios.length} pers.)
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-b pb-4 mb-4 border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Tu Total a Pagar</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-orange-600 block">{formatCurrency(miTotal)}</span>
                {mesa?.splitMode === 'itemized' && <span className="text-xs text-slate-400">Items asignados + compartidos</span>}
              </div>
            </div>

            {mesa?.splitMode === 'itemized' && (
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 dark:bg-orange-900/20 dark:border-orange-900/50">
                  <h3 className="text-sm font-bold text-orange-800 dark:text-orange-200 mb-1">¿Qué consumiste hoy?</h3>
                  <p className="text-xs text-orange-700/80 dark:text-orange-300">
                    Toca tu nombre arriba para asignar tus platos. Lo que no asignes se dividirá entre todos.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Tu Detalle</h3>
                  {pedidosMesa.flatMap(p => p.items).map((item, idx) => {
                    const isMine = item.asignadoA === usuario.id;
                    const isShared = !item.asignadoA;
                    if (!isMine && !isShared) return null;

                    return (
                      <div key={idx} className="flex justify-between items-center text-sm p-3 rounded-lg border border-slate-100 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800">
                        <div>
                          <span className={cn("font-medium block", isShared ? "text-slate-500 italic" : "text-slate-900 dark:text-white")}>
                            {item.cantidad}x {item.producto.nombre}
                          </span>
                          {isShared && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wide font-bold">Compartido</span>}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.producto.precio * item.cantidad)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 space-y-4">
              <button
                onClick={() => handlePay('Bar')}
                className={cn(
                  "w-full flex items-center justify-center gap-2 rounded-xl py-4 text-lg font-bold text-white shadow-lg active:scale-95 transition-all",
                  isFullPayment ? "bg-green-600 hover:bg-green-700" : "bg-slate-900 dark:bg-white dark:text-slate-900"
                )}
              >
                <Wallet className="h-5 w-5" />
                {isFullPayment ? `Pagar Total Mesa (${formatCurrency(totalAPagar)})` : `Pagar mi Parte (${formatCurrency(totalAPagar)})`}
              </button>

              {/* Toggle to pay Full Table */}
              <button
                onClick={() => setIsFullPayment(!isFullPayment)}
                className="w-full text-xs text-slate-400 hover:text-slate-600 underline decoration-slate-300"
              >
                {isFullPayment ? "Cancelar pago completo (Volver a mi parte)" : `Soy el encargado, quiero pagar la mesa completa (${formatCurrency(granTotalMesa)})`}
              </button>

              {mesa?.usuarios && mesa.usuarios.length > 1 && !isFullPayment && (
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
                    <span>Transferir deuda a otro</span>
                  </summary>
                  <div className="mt-4 grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl dark:bg-slate-900">
                    {mesa.usuarios.filter(u => u.id !== usuario.id).map(amigo => (
                      <button
                        key={amigo.id}
                        onClick={() => handlePay('Amigo', amigo.id)}
                        className="flex flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 shadow-sm active:scale-95 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                      >
                        <span>Pagar a {amigo.nombre}</span>
                      </button>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>

          <footer className="mt-12 w-full border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
            <p>© Nicolas France 2026 — Sistema de gestión de mesas y pagos</p>
            <p className="mt-1 font-mono opacity-50">Versión 1.0.0</p>
          </footer>
        </main>
      )}
    </div>
  );
}
