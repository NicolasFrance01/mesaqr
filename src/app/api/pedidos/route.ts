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

        // Map items to nested producto format for frontend compatibility
        const mappedPedidos = pedidos.map(pedido => ({
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
        }));

        return NextResponse.json(mappedPedidos);
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
                        productoId: item.producto.id || item.productoId,
                        asignadoA: item.asignadoA
                    }))
                }
            },
            include: { items: true }
        });

        // Map items back for consistent frontend response
        const mappedPedido = {
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
        };

        return NextResponse.json(mappedPedido);
    } catch (error) {
        console.error("Error creating pedido", error);
        return NextResponse.json({ error: 'Error creating pedido' }, { status: 500 });
    }
}
