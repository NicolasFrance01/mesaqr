import { Pedido } from '@/types/pedido';
import { MENU_DATA } from './menuData';

export const PEDIDOS_INITIAL: Pedido[] = [
    {
        id: 'p1',
        mesaId: 'm2',
        items: [
            { id: 'i1', producto: MENU_DATA[0], cantidad: 2 },
            { id: 'i2', producto: MENU_DATA[2], cantidad: 2 },
        ],
        total: 25400,
        estado: 'pendiente',
        createdAt: new Date(),
    },
];
