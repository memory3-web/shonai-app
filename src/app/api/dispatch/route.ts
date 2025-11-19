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
    const entries = await prisma.dispatchEntry.findMany({
      where: {
        date: date,
      },
    });
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, vehicleId, slotIndex, pickup, delivery } = body;

    if (!date || !vehicleId || slotIndex === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const entry = await prisma.dispatchEntry.upsert({
      where: {
        date_vehicleId_slotIndex: {
          date,
          vehicleId,
          slotIndex,
        },
      },
      update: {
        pickup,
        delivery,
      },
      create: {
        date,
        vehicleId,
        slotIndex,
        pickup,
        delivery,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
