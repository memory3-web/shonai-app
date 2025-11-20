"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import DatePicker from '@/components/DatePicker';
import ShipmentTable from '@/components/ShipmentTable';

export default function ShipmentPage() {
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

    return (
        <div className="flex flex-col items-center w-full min-h-screen bg-gray-50">
            <div className="w-full bg-white shadow-sm mb-6">
                <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium self-start md:self-auto">
                        ← ダッシュボードへ戻る
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">出荷表</h1>
                    <div className="w-24 hidden md:block"></div> {/* Spacer for centering on desktop */}
                </div>
            </div>

            <DatePicker date={date} onDateChange={setDate} />

            <div className="w-full max-w-6xl mt-6 px-4">
                <ShipmentTable date={date} />
            </div>
        </div>
    );
}
