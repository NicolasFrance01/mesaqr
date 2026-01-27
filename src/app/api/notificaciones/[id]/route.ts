import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { leido } = body;

        const notificacion = await prisma.notificacion.update({
            where: { id },
            data: { leido }
        });
        return NextResponse.json(notificacion);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating notification' }, { status: 500 });
    }
}
