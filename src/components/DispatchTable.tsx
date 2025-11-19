"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { VEHICLES, PICKUP_LOCATIONS } from '../constants';

interface DispatchEntry {
    id?: number;
    date: string;
    vehicleId: string;
    slotIndex: number;
    pickup: string;
    delivery: string; // Used as "Summary" (概要) in UI
}

interface DispatchTableProps {
    date: string;
}

export default function DispatchTable({ date }: DispatchTableProps) {
    const [entries, setEntries] = useState<Record<string, DispatchEntry>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch data when date changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/dispatch?date=${date}`);
                if (res.ok) {
                    const data: DispatchEntry[] = await res.json();
                    const entryMap: Record<string, DispatchEntry> = {};
                    data.forEach(entry => {
                        const key = `${entry.vehicleId}-${entry.slotIndex}`;
                        entryMap[key] = entry;
                    });
                    setEntries(entryMap);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [date]);

    // Auto-save function
    const saveEntry = useCallback(async (entry: DispatchEntry) => {
        setSaving(true);
        try {
            await fetch('/api/dispatch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(entry),
            });
        } catch (error) {
            console.error("Failed to save data", error);
        } finally {
            setSaving(false);
        }
    }, []);

    // Handle input change
    const handleChange = (vehicleId: string, slotIndex: number, field: 'pickup' | 'delivery', value: string) => {
        const key = `${vehicleId}-${slotIndex}`;
        const currentEntry = entries[key] || { date, vehicleId, slotIndex, pickup: '', delivery: '' };

        const newEntry = { ...currentEntry, [field]: value, date }; // Ensure date is current

        setEntries(prev => ({
            ...prev,
            [key]: newEntry
        }));

        if (field === 'pickup') {
            saveEntry(newEntry);
        } else {
            // For text input, we rely on onBlur for saving
        }
    };

    const handleBlur = (vehicleId: string, slotIndex: number) => {
        const key = `${vehicleId}-${slotIndex}`;
        const entry = entries[key];
        if (entry) {
            saveEntry(entry);
        }
    };

    if (loading) return <div className="text-center p-4 text-white">読み込み中...</div>;

    const renderInputGroup = (vehicleId: string, slotIndex: number) => {
        const key = `${vehicleId}-${slotIndex}`;
        const entry = entries[key] || { pickup: '', delivery: '' };
        return (
            <div className="flex flex-col space-y-1 w-full min-w-[160px]">
                <select
                    className="border border-gray-300 rounded p-1 text-sm w-full bg-blue-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={entry.pickup || ''}
                    onChange={(e) => handleChange(vehicleId, slotIndex, 'pickup', e.target.value)}
                >
                    <option value="" className="text-gray-500">選択...</option>
                    {PICKUP_LOCATIONS.map(loc => (
                        <option key={loc} value={loc} className="text-gray-900">{loc}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="概要"
                    className="border border-gray-300 rounded p-1 text-sm w-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={entry.delivery || ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        setEntries(prev => ({
                            ...prev,
                            [key]: { ...prev[key], date, vehicleId, slotIndex, delivery: val } as DispatchEntry
                        }));
                    }}
                    onBlur={() => handleBlur(vehicleId, slotIndex)}
                />
            </div>
        );
    };

    return (
        <div className="w-full">
            <div className="p-2 text-right text-sm text-gray-300 mb-2">
                {saving ? "保存中..." : "保存完了"}
            </div>

            {/* Mobile View (Compact Horizontal Scroll) */}
            <div className="md:hidden bg-white rounded-lg shadow overflow-hidden">
                {VEHICLES.map(vehicleId => (
                    <div key={vehicleId} className="flex items-center border-b last:border-b-0 h-24">
                        {/* Fixed Vehicle ID Column */}
                        <div className="w-16 flex-shrink-0 flex items-center justify-center bg-gray-100 h-full border-r font-bold text-gray-900 text-lg">
                            {vehicleId}
                        </div>

                        {/* Scrollable Slots */}
                        <div className="flex-1 overflow-x-auto flex items-center space-x-2 p-2 h-full no-scrollbar">
                            {[0, 1, 2].map(slotIndex => (
                                <div key={slotIndex} className="flex-shrink-0 w-40">
                                    {renderInputGroup(vehicleId, slotIndex)}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto bg-white shadow rounded-lg">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="p-3 text-left w-24 border-r sticky left-0 bg-gray-100 z-10 text-gray-700 font-semibold">車両</th>
                            <th className="p-3 text-left border-r text-gray-700 font-semibold min-w-[200px]">案件1</th>
                            <th className="p-3 text-left border-r text-gray-700 font-semibold min-w-[200px]">案件2</th>
                            <th className="p-3 text-left text-gray-700 font-semibold min-w-[200px]">案件3</th>
                        </tr>
                    </thead>
                    <tbody>
                        {VEHICLES.map(vehicleId => (
                            <tr key={vehicleId} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-bold border-r sticky left-0 bg-white z-10 text-center text-gray-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    {vehicleId}
                                </td>
                                {[0, 1, 2].map(slotIndex => (
                                    <td key={slotIndex} className="p-2 border-r">
                                        {renderInputGroup(vehicleId, slotIndex)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
