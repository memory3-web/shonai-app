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
        const drivers = await prisma.dailyDriver.findMany({
            where: { date },
        });
        return NextResponse.json(drivers);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { date, vehicleId, driverName } = body;

        if (!date || !vehicleId || !driverName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const driver = await prisma.dailyDriver.upsert({
            where: {
                date_vehicleId: {
                    date,
                    vehicleId,
                },
            },
            update: {
                driverName,
            },
            create: {
                date,
                vehicleId,
                driverName,
            },
        });

        return NextResponse.json(driver);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: 'Failed to save driver' }, { status: 500 });
    }
}
