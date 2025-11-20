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
        const info = await prisma.dailyYardInfo.findUnique({
            where: { date },
        });
        return NextResponse.json(info || { loadingPerson: '' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch daily yard info' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { date, loadingPerson } = body;

        if (!date) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        const info = await prisma.dailyYardInfo.upsert({
            where: { date },
            update: { loadingPerson },
            create: { date, loadingPerson },
        });
        return NextResponse.json(info);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update daily yard info' }, { status: 500 });
    }
}
