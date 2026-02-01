import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const transacciones = await prisma.transaccion.findMany({
            orderBy: { fecha: 'desc' }
        });
        return NextResponse.json(transacciones);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching transacciones' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, mesaId, usuario, monto, items, tipoPago, destinatarioAmigo, rating, comentario } = body;

        const transaccion = await prisma.transaccion.create({
            data: {
                id: id || Math.random().toString(36).substr(2, 9), // Fallback ID if missing
                mesaId,
                usuario,
                monto,
                items: items || [],
                tipoPago,
                destinatarioAmigo,
                rating,
                comentario,
                fecha: new Date()
            }
        });
        return NextResponse.json(transaccion);
    } catch (error) {
        console.error("Error creating transaccion", error);
        return NextResponse.json({ error: 'Error creating transaccion' }, { status: 500 });
    }
}
