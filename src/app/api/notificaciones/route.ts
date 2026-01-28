import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const notifications = await prisma.notificacion.findMany({
            orderBy: { timestamp: 'desc' },
            take: 50 // Limit to last 50
        });
        return NextResponse.json(notifications);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching notifications' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const notificacion = await prisma.notificacion.create({
            data: {
                id: body.id,
                tipo: body.tipo,
                mensaje: body.mensaje,
                mesaId: body.mesaId,
                leido: body.leido || false,
                timestamp: body.timestamp ? new Date(body.timestamp) : undefined
            }
        });
        return NextResponse.json(notificacion);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating notification' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const mesaId = searchParams.get('mesaId');

    if (!mesaId) {
        return NextResponse.json({ error: 'Mesa ID required' }, { status: 400 });
    }

    try {
        await prisma.notificacion.deleteMany({
            where: { mesaId }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error clearing notifications' }, { status: 500 });
    }
}
