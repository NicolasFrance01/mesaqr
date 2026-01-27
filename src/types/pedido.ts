import { Producto } from './producto';

export type PedidoEstado = 'pendiente' | 'en_preparacion' | 'listo_para_entregar' | 'entregado' | 'cancelado';

export interface ItemPedido {
    id: string; // Unique ID for assignment
    producto: Producto;
    cantidad: number;
    notas?: string;
    asignadoA?: string; // ID del usuario (null = compartido)
}

export interface Pedido {
    id: string;
    mesaId: string;
    items: ItemPedido[];
    total: number;
    estado: PedidoEstado;
    createdAt: Date;
    usuarioId?: string; // Quién lo pidió
}
