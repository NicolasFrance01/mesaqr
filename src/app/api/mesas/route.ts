import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const mesas = await prisma.mesa.findMany({
            include: {
                usuarios: true,
                pedidos: {
                    where: { estado: { not: 'cancelado' } },
                    include: { items: true }
                },
                resenas: true
            },
            orderBy: { nombre: 'asc' }
        });

        // Map nested pedidos items for frontend compatibility
        const mappedMesas = mesas.map(mesa => ({
            ...mesa,
            pedidos: mesa.pedidos.map(pedido => ({
                ...pedido,
                items: pedido.items.map(item => ({
                    id: item.id,
                    cantidad: item.cantidad,
                    asignadoA: item.asignadoA,
                    producto: {
                        id: item.productoId,
                        nombre: item.nombre,
                        precio: item.precio
                    }
                }))
            }))
        }));

        return NextResponse.json(mappedMesas);
    } catch (error) {
        console.error('Error fetching mesas:', error);
        return NextResponse.json({ error: 'Error fetching mesas' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        // Strip relations that cause validation errors in plain upsert
        const sanitizedData = { ...data };
        delete (sanitizedData as any).usuarios;
        delete (sanitizedData as any).resenas;
        delete (sanitizedData as any).pedidos;
        delete (sanitizedData as any).notificaciones;
        delete (sanitizedData as any).transacciones;

        const mesa = await prisma.mesa.upsert({
            where: { id },
            update: sanitizedData,
            create: { id, ...sanitizedData }
        });
        return NextResponse.json(mesa);
    } catch (error) {
        console.error('Error updating mesa:', error);
        return NextResponse.json({ error: 'Error updating mesa' }, { status: 500 });
    }
}
