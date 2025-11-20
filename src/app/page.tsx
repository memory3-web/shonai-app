"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DatePicker from '@/components/DatePicker';

interface Absentee {
    id: number;
    date: string;
    name: string;
}

export default function Home() {
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [absentees, setAbsentees] = useState<Absentee[]>([]);
    const [newAbsenteeName, setNewAbsenteeName] = useState('');

    useEffect(() => {
        fetchAbsentees();
    }, [date]);

    const fetchAbsentees = async () => {
        try {
            const res = await fetch(`/api/absentees?date=${date}`);
            if (res.ok) {
                const data = await res.json();
                setAbsentees(data);
            }
        } catch (error) {
            console.error('Failed to fetch absentees', error);
        }
    };

    const handleAddAbsentee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAbsenteeName.trim()) return;

        try {
            const res = await fetch('/api/absentees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, name: newAbsenteeName }),
            });

            if (res.ok) {
                setNewAbsenteeName('');
                fetchAbsentees();
            }
        } catch (error) {
            console.error('Failed to add absentee', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">ダッシュボード</h1>

            <div className="w-full max-w-md mb-8">
                <DatePicker date={date} onDateChange={setDate} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4 mb-12">
                <Link href="/dispatch" className="bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold py-8 rounded-xl shadow-lg flex items-center justify-center transition-transform hover:scale-105">
                    配車帳
                </Link>
                <Link href="/shipment" className="bg-green-600 hover:bg-green-700 text-white text-2xl font-bold py-8 rounded-xl shadow-lg flex items-center justify-center transition-transform hover:scale-105">
                    出荷表
                </Link>
            </div>

            <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">本日の欠席者</h2>

                <form onSubmit={handleAddAbsentee} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={newAbsenteeName}
                        onChange={(e) => setNewAbsenteeName(e.target.value)}
                        placeholder="名前を入力"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
                    />
                    <button
                        type="submit"
                        className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        追加
                    </button>
                </form>

                {absentees.length > 0 ? (
                    <ul className="space-y-2">
                        {absentees.map((absentee) => (
                            <li key={absentee.id} className="flex items-center justify-between bg-gray-100 px-4 py-3 rounded-lg">
                                <span className="text-lg font-medium text-gray-800">{absentee.name}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-center py-4">欠席者はいません</p>
                )}
            </div>
        </div>
    );
}
