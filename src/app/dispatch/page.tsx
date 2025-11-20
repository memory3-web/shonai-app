"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import DatePicker from '@/components/DatePicker';
import DispatchTable from '@/components/DispatchTable';

export default function Home() {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-6xl mt-4 px-4">
        <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
          ← ダッシュボードへ戻る
        </Link>
      </div>
      <h2 className="text-2xl font-bold mt-4 mb-2">配車管理</h2>

      <DatePicker date={date} onDateChange={setDate} />

      <div className="w-full max-w-6xl mt-4">
        <DispatchTable date={date} />
      </div>
    </div>
  );
}
