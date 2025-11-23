import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    try {
        const remark = await prisma.dailyRemark.findUnique({
            where: { date },
        });
        return NextResponse.json(remark || { content: '' });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: 'Failed to fetch remark' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { date, content } = body;

        if (!date) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        const remark = await prisma.dailyRemark.upsert({
            where: { date },
            update: { content },
            create: { date, content },
        });

        return NextResponse.json(remark);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: 'Failed to save remark' }, { status: 500 });
    }
}
