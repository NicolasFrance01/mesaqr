export interface Producto {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
    imagen?: string;
}

export type Categoria = 'Entradas' | 'Platos Principales' | 'Bebidas' | 'Postres';
