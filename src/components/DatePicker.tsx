"use client";

import React from 'react';

interface DatePickerProps {
    date: string;
    onDateChange: (date: string) => void;
}

export default function DatePicker({ date, onDateChange }: DatePickerProps) {
    const handlePrevDay = () => {
        const d = new Date(date);
        d.setDate(d.getDate() - 1);
        onDateChange(d.toISOString().split('T')[0]);
    };

    const handleNextDay = () => {
        const d = new Date(date);
        d.setDate(d.getDate() + 1);
        onDateChange(d.toISOString().split('T')[0]);
    };

    return (
        <div className="flex items-center justify-center space-x-4 my-4 bg-white p-4 rounded-lg shadow">
            <button
                onClick={handlePrevDay}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition font-bold text-gray-800"
            >
                &lt; 前日
            </button>
            <input
                type="date"
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                className="border p-2 rounded text-lg font-bold text-black"
            />
            <button
                onClick={handleNextDay}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition font-bold text-gray-800"
            >
                翌日 &gt;
            </button>
        </div>
    );
}
