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
        return NextResponse.json(mesas);
    } catch (error) {
        console.error('Error fetching mesas:', error);
        return NextResponse.json({ error: 'Error fetching mesas' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        const mesa = await prisma.mesa.upsert({
            where: { id },
            update: data,
            create: { id, ...data }
        });
        return NextResponse.json(mesa);
    } catch (error) {
        console.error('Error updating mesa:', error);
        return NextResponse.json({ error: 'Error updating mesa' }, { status: 500 });
    }
}
