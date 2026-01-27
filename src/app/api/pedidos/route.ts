import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const pedidos = await prisma.pedido.findMany({
            where: {
                estado: { not: 'cancelado' }
            },
            include: {
                items: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(pedidos);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching pedidos' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, mesaId, estado, total, items, createdAt } = body;

        // Create Pedido + Items Transactionally
        const pedido = await prisma.pedido.create({
            data: {
                id,
                mesaId,
                estado,
                total,
                createdAt: createdAt ? new Date(createdAt) : undefined,
                items: {
                    create: items.map((item: any) => ({
                        nombre: item.producto.nombre, // Snapshot name
                        precio: item.producto.precio,
                        cantidad: item.cantidad,
                        productoId: item.producto.id,
                        asignadoA: item.asignadoA
                    }))
                }
            },
            include: { items: true }
        });

        return NextResponse.json(pedido);
    } catch (error) {
        console.error("Error creating pedido", error);
        return NextResponse.json({ error: 'Error creating pedido' }, { status: 500 });
    }
}
