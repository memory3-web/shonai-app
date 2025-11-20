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
            // saveEntry(newEntry); // Removed auto-save on change for pickup to allow typing
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
                <input
                    list="pickup-locations"
                    type="text"
                    placeholder="..."
                    className="border border-gray-300 rounded p-1 text-sm w-full bg-blue-50 text-black font-bold focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
                    value={entry.pickup || ''}
                    onChange={(e) => handleChange(vehicleId, slotIndex, 'pickup', e.target.value)}
                    onBlur={() => handleBlur(vehicleId, slotIndex)}
                />
                <input
                    type="text"
                    placeholder=""
                    className="border border-gray-300 rounded p-1 text-sm w-full text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
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

            {/* Mobile View (Unified Horizontal Scroll) */}
            <div className="md:hidden bg-white rounded-lg shadow overflow-x-auto">
                <div className="min-w-max">
                    {VEHICLES.map(vehicleId => (
                        <div key={vehicleId} className="flex items-center border-b last:border-b-0 h-16">
                            {/* Fixed Vehicle ID Column */}
                            <div className="sticky left-0 z-10 w-10 flex-shrink-0 flex items-center justify-center bg-gray-100 h-full border-r font-bold text-gray-900 text-sm shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                {vehicleId}
                            </div>

                            {/* Slots */}
                            <div className="flex items-center space-x-1 p-1 h-full">
                                {[0, 1, 2].map(slotIndex => {
                                    const key = `${vehicleId}-${slotIndex}`;
                                    const entry = entries[key] || { pickup: '', delivery: '' };
                                    return (
                                        <div key={slotIndex} className="flex-shrink-0 w-28">
                                            <div className="flex flex-col space-y-0.5 w-full">
                                                <input
                                                    list="pickup-locations"
                                                    type="text"
                                                    placeholder="..."
                                                    className="border border-gray-300 rounded p-0 text-xs h-7 w-full bg-blue-50 text-black font-bold focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-500"
                                                    value={entry.pickup || ''}
                                                    onChange={(e) => handleChange(vehicleId, slotIndex, 'pickup', e.target.value)}
                                                    onBlur={() => handleBlur(vehicleId, slotIndex)}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder=""
                                                    className="border border-gray-300 rounded p-0 px-1 text-[10px] h-6 w-full text-black font-medium placeholder-gray-500 focus:ring-1 focus:ring-blue-500 outline-none"
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
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto bg-white shadow rounded-lg">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="p-3 text-left w-24 border-r sticky left-0 bg-gray-100 z-10 text-black font-bold">車両</th>
                            <th className="p-3 text-left border-r text-black font-bold min-w-[200px]">案件1</th>
                            <th className="p-3 text-left border-r text-black font-bold min-w-[200px]">案件2</th>
                            <th className="p-3 text-left text-black font-bold min-w-[200px]">案件3</th>
                        </tr>
                    </thead>
                    <tbody>
                        {VEHICLES.map(vehicleId => (
                            <tr key={vehicleId} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-bold border-r sticky left-0 bg-white z-10 text-center text-black shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
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
            <datalist id="pickup-locations">
                {PICKUP_LOCATIONS.map(loc => (
                    <option key={loc.name} value={loc.name}>{loc.reading}</option>
                ))}
            </datalist>
        </div>
    );
}
