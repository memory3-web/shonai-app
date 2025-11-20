import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    try {
        const shipments = await prisma.shipment.findMany({
            where: { date },
            orderBy: { createdAt: 'asc' },
        });
        return NextResponse.json(shipments);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { date, columnIndex, trailer, time, destination, cargo, remarks, category } = body;

        if (!date || columnIndex === undefined || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Use upsert to handle both create and update safely
        const shipment = await prisma.shipment.upsert({
            where: {
                date_columnIndex_category: {
                    date,
                    columnIndex,
                    category,
                },
            },
            update: {
                // Only update fields that are present in the body
                ...(trailer !== undefined && { trailer }),
                ...(time !== undefined && { time }),
                ...(destination !== undefined && { destination }),
                ...(cargo !== undefined && { cargo }),
                ...(remarks !== undefined && { remarks }),
            },
            create: {
                date,
                columnIndex,
                trailer: trailer || '', // Default to empty if not provided
                time,
                destination,
                cargo,
                remarks,
                category,
            },
        });

        return NextResponse.json(shipment);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to save shipment' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const shipment = await prisma.shipment.update({
            where: { id },
            data,
        });
        return NextResponse.json(shipment);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update shipment' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await prisma.shipment.delete({
            where: { id: Number(id) },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete shipment' }, { status: 500 });
    }
}
