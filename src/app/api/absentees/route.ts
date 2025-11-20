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
        const absentees = await prisma.absentee.findMany({
            where: { date },
            orderBy: { createdAt: 'asc' },
        });
        return NextResponse.json(absentees);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch absentees' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { date, name } = body;

        if (!date || !name) {
            return NextResponse.json({ error: 'Date and name are required' }, { status: 400 });
        }

        const absentee = await prisma.absentee.create({
            data: { date, name },
        });
        return NextResponse.json(absentee);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create absentee' }, { status: 500 });
    }
}
