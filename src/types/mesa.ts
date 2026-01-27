export type MesaEstado = 'libre' | 'ocupada' | 'pagando';

export interface UsuarioMesa {
    id: string;
    nombre: string;
    pagado: boolean;
    totalPagado: number;
    itemsConsumidos: { productoId: string; cantidad: number; precio: number }[];
    mesaId?: string;
}

export interface Resena {
    id: string;
    mesaId: string;
    rating: number; // 1-5
    comentario: string;
    fecha: Date;
}

export interface Mesa {
    id: string;
    numero: number;
    nombre: string;
    ubicacion: string;
    estado: MesaEstado;
    capacidad: number;
    usuarios: UsuarioMesa[];
    totalMesa: number;
    abierta: Date | null;
    // New 3.0 Fields
    ownerId?: string; // ID of the user who "owns" the table
    splitMode: 'equal' | 'itemized';
    resenas?: Resena[];
}
