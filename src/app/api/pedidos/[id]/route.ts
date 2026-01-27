import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { estado } = body;

        const pedido = await prisma.pedido.update({
            where: { id },
            data: { estado }
        });
        return NextResponse.json(pedido);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating pedido' }, { status: 500 });
    }
}
