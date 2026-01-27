import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();
        // body can contain: estado, abierta, ownerId, etc.
        const { id: _, ...data } = body; // exclude ID from data update

        const mesa = await prisma.mesa.update({
            where: { id },
            data: data
        });
        return NextResponse.json(mesa);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating mesa' }, { status: 500 });
    }
}
