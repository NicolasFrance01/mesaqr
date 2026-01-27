import { Mesa } from '@/types/mesa';

export const MESAS_INITIAL: Mesa[] = [
    {
        id: 'm1',
        numero: 1,
        nombre: 'Mesa 1',
        x: 0,
        y: 0,
        ubicacion: 'Salón',
        sector: 'Principal',
        estado: 'libre',
        capacidad: 4,
        usuarios: [],
        totalMesa: 0,
        abierta: null,
        splitMode: 'equal'
    },
    {
        id: 'm2',
        numero: 2,
        nombre: 'Mesa 2',
        x: 0,
        y: 0,
        ubicacion: 'Salón',
        sector: 'Principal',
        estado: 'ocupada',
        capacidad: 2,
        usuarios: [
            { id: 'u1', nombre: 'Juan', pagado: false, totalPagado: 0, itemsConsumidos: [] },
            { id: 'u2', nombre: 'Ana', pagado: false, totalPagado: 0, itemsConsumidos: [] }
        ],
        totalMesa: 0,
        abierta: new Date(),
        splitMode: 'equal'
    },
    {
        id: 'm3',
        numero: 3,
        nombre: 'Barra 1',
        x: 0,
        y: 0,
        ubicacion: 'Barra',
        sector: 'Barra',
        estado: 'libre',
        capacidad: 1,
        usuarios: [],
        totalMesa: 0,
        abierta: null,
        splitMode: 'equal'
    },
    {
        id: 'm4',
        numero: 4,
        nombre: 'Terraza 1',
        x: 0,
        y: 0,
        ubicacion: 'Patio',
        sector: 'Patio',
        estado: 'libre',
        capacidad: 6,
        usuarios: [],
        totalMesa: 0,
        abierta: null,
        splitMode: 'equal'
    }
];
