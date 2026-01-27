import { Mesa } from '@/types/mesa';

export const MESAS_INITIAL: Mesa[] = [
    {
        id: 'm1',
        numero: 1,
        nombre: 'Mesa 1',
        ubicacion: 'Salón',
        estado: 'libre',
        capacidad: 4,
        usuarios: [],
        totalMesa: 0,
        abierta: null
    },
    {
        id: 'm2',
        numero: 2,
        nombre: 'Mesa 2',
        ubicacion: 'Salón',
        estado: 'ocupada',
        capacidad: 2,
        usuarios: [
            { id: 'u1', nombre: 'Juan', pagado: false, totalPagado: 0, itemsConsumidos: [] },
            { id: 'u2', nombre: 'Ana', pagado: false, totalPagado: 0, itemsConsumidos: [] }
        ],
        totalMesa: 0,
        abierta: new Date()
    },
    {
        id: 'm3',
        numero: 3,
        nombre: 'Barra 1',
        ubicacion: 'Barra',
        estado: 'libre',
        capacidad: 1,
        usuarios: [],
        totalMesa: 0,
        abierta: null
    },
    {
        id: 'm4',
        numero: 4,
        nombre: 'Terraza 1',
        ubicacion: 'Patio',
        estado: 'libre',
        capacidad: 6,
        usuarios: [],
        totalMesa: 0,
        abierta: null
    },
];
