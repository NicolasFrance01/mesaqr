import { Producto } from '@/types/producto';

export const MENU_DATA: Producto[] = [
    {
        id: '1',
        nombre: 'Hamburguesa Classic',
        descripcion: 'Carne vacuna, lechuga, tomate, queso cheddar y salsa especial.',
        precio: 8500,
        categoria: 'Platos Principales',
    },
    {
        id: '2',
        nombre: 'Papas Fritas',
        descripcion: 'Papas fritas crocantes con sal marina.',
        precio: 3500,
        categoria: 'Entradas',
    },
    {
        id: '3',
        nombre: 'Cerveza Artesanal IPA',
        descripcion: '500ml de pura frescura lupulada.',
        precio: 4200,
        categoria: 'Bebidas',
    },
    {
        id: '4',
        nombre: 'Brownie con Helado',
        descripcion: 'Brownie de chocolate belga con bocha de helado de vainilla.',
        precio: 4500,
        categoria: 'Postres',
    },
];
