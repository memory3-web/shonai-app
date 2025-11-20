"use client";

import React, { useState, useEffect } from 'react';

interface Shipment {
    id: number;
    date: string;
    columnIndex: number;
    trailer: string;
    time: string | null;
    destination: string | null;
    cargo: string | null;
    remarks: string | null;
    category: string;
}

interface DailyYardInfo {
    date: string;
    loadingPerson: string | null;
}

interface ShipmentTableProps {
    date: string;
}

const FIXED_COLUMNS = ["ダイヤ丸山", "ダイヤ上村", "橋爪", "泉翔"];
const VARIABLE_OPTIONS = ["橋爪", "直富", "その他"];
const LOADING_PERSONS = ["増澤", "須藤", "上條", "黒田", "深澤", "常田"];
const DESTINATIONS = ["朝日", "トピー", "豊橋港", "愛知", "北越メタル", "共栄", "明海"];
const CARGO_TYPES = ["ヘビー", "新断", "HS", "鋼ダライ", "銑ダライ", "新断プレス", "自販機", "HB", "Aプレ", "BC", "クローム"];

// Generate time options from 7:00 to 17:00 with 10-minute intervals
const TIME_OPTIONS: string[] = [];
for (let hour = 7; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 10) {
        if (hour === 17 && minute > 0) break; // Stop at 17:00
        const timeStr = `${hour}:${minute.toString().padStart(2, '0')}`;
        TIME_OPTIONS.push(timeStr);
    }
}
TIME_OPTIONS.push("代納"); // Add special option

export default function ShipmentTable({ date }: ShipmentTableProps) {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [dailyInfo, setDailyInfo] = useState<DailyYardInfo>({ date, loadingPerson: '' });
    const [loading, setLoading] = useState(false);

    // Initialize variable columns state (can be persisted in local storage or DB if needed, for now simple state)
    const [variableTrailers, setVariableTrailers] = useState<string[]>(["", ""]);

    useEffect(() => {
        // Clear state immediately when date changes to prevent showing old data
        setShipments([]);
        setVariableTrailers(["", ""]);
        setDailyInfo({ date, loadingPerson: '' });
        fetchData();
    }, [date]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [shipRes, infoRes] = await Promise.all([
                fetch(`/api/shipments?date=${date}`),
                fetch(`/api/daily-yard-info?date=${date}`)
            ]);

            if (shipRes.ok) {
                const data = await shipRes.json();
                setShipments(data);

                // Restore variable column selections if they exist in the data
                const var1 = data.find((s: Shipment) => s.columnIndex === 4)?.trailer || "";
                const var2 = data.find((s: Shipment) => s.columnIndex === 5)?.trailer || "";
                setVariableTrailers([var1, var2]);
            }

            if (infoRes.ok) {
                const info = await infoRes.json();
                setDailyInfo(info);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle local state update (for typing)
    const handleLocalUpdate = (columnIndex: number, field: keyof Shipment, value: string) => {
        setShipments(prev => {
            const newShipments = [...prev];
            const existingIndex = newShipments.findIndex(s => s.columnIndex === columnIndex && s.category === 'Iron');

            if (existingIndex !== -1) {
                newShipments[existingIndex] = { ...newShipments[existingIndex], [field]: value };
            } else {
                // Create a temporary placeholder
                newShipments.push({
                    id: -1,
                    date,
                    columnIndex,
                    trailer: columnIndex < 4 ? FIXED_COLUMNS[columnIndex] : (columnIndex === 4 ? variableTrailers[0] : variableTrailers[1]),
                    time: null,
                    destination: null,
                    cargo: null,
                    remarks: null,
                    category: 'Iron',
                    [field]: value
                } as Shipment);
            }
            return newShipments;
        });

        // For variable trailer selection, we must save immediately because it affects the column header
        if (field === 'trailer') {
            if (columnIndex === 4) setVariableTrailers([value, variableTrailers[1]]);
            if (columnIndex === 5) setVariableTrailers([variableTrailers[0], value]);
            saveShipment(columnIndex, field, value);
        }
    };

    // Save to server (onBlur or specific events)
    const saveShipment = async (columnIndex: number, field: keyof Shipment, value: string) => {
        const shipment = shipments.find(s => s.columnIndex === columnIndex && s.category === 'Iron');

        // Calculate trailer name
        let trailerName = "";
        if (columnIndex < 4) {
            trailerName = FIXED_COLUMNS[columnIndex];
        } else {
            // If we are saving the trailer itself, use the value. Otherwise use current state.
            if (field === 'trailer') {
                trailerName = value;
            } else {
                trailerName = columnIndex === 4 ? variableTrailers[0] : variableTrailers[1];
            }
        }

        try {
            const payload = {
                date,
                columnIndex,
                category: 'Iron',
                trailer: trailerName,
                [field]: value
            };

            // Always use POST (Upsert)
            const response = await fetch('/api/shipments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const savedShipment = await response.json();
                setShipments(prev => {
                    const newPrev = [...prev];
                    const idx = newPrev.findIndex(s => s.columnIndex === columnIndex && s.category === 'Iron');
                    if (idx !== -1) {
                        newPrev[idx] = savedShipment;
                    } else {
                        newPrev.push(savedShipment);
                    }
                    return newPrev;
                });
            }
        } catch (error) {
            console.error('Failed to save shipment', error);
        }
    };

    const handleDailyInfoUpdate = async (value: string) => {
        setDailyInfo({ ...dailyInfo, loadingPerson: value });
        try {
            await fetch('/api/daily-yard-info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, loadingPerson: value }),
            });
        } catch (error) {
            console.error('Failed to update daily info', error);
        }
    };

    const renderCell = (columnIndex: number, field: keyof Shipment, placeholder: string, listId?: string) => {
        const shipment = shipments.find(s => s.columnIndex === columnIndex && s.category === 'Iron');
        const value = shipment ? (shipment[field] as string || '') : '';

        return (
            <td key={`${columnIndex}-${field}`} className="border border-gray-400 p-0 h-12 min-w-[100px]">
                <input
                    list={listId}
                    type="text"
                    className="w-full h-full px-1 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none text-center text-sm md:text-base font-medium text-black placeholder-gray-400"
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => handleLocalUpdate(columnIndex, field, e.target.value)}
                    onBlur={(e) => saveShipment(columnIndex, field, e.target.value)}
                />
            </td>
        );
    };

    return (
        <div className="w-full">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 border-l-8 border-gray-800 pl-4">鉄ヤード 出荷</h3>

            <div className="flex flex-col md:flex-row items-start gap-4">
                <div className="w-full overflow-x-auto shadow-sm border border-gray-400 bg-white">
                    <table className="border-collapse w-full min-w-[800px]">
                        <thead>
                            <tr>
                                {FIXED_COLUMNS.map((col, i) => (
                                    <th key={i} className="border border-gray-400 p-2 bg-gray-100 w-32 md:w-40 text-sm md:text-lg whitespace-nowrap font-bold text-black">{col}</th>
                                ))}
                                {[0, 1].map((i) => (
                                    <th key={`var-${i}`} className="border border-gray-400 p-1 bg-gray-100 w-32 md:w-40">
                                        <select
                                            className="w-full bg-transparent font-bold text-center p-1 md:p-2 text-sm md:text-base text-black focus:outline-none"
                                            value={variableTrailers[i]}
                                            onChange={(e) => handleLocalUpdate(4 + i, 'trailer', e.target.value)}
                                        >
                                            <option value="">(選択)</option>
                                            {VARIABLE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Time Row */}
                            <tr>
                                {[0, 1, 2, 3, 4, 5].map(colIdx => renderCell(colIdx, 'time', '時間', 'time-options'))}
                            </tr>
                            {/* Destination Row */}
                            <tr>
                                {[0, 1, 2, 3, 4, 5].map(colIdx => renderCell(colIdx, 'destination', '出荷先', 'destinations'))}
                            </tr>
                            {/* Cargo Row */}
                            <tr>
                                {[0, 1, 2, 3, 4, 5].map(colIdx => renderCell(colIdx, 'cargo', '出荷品目', 'cargo-types'))}
                            </tr>
                            {/* Remarks Row */}
                            <tr>
                                {[0, 1, 2, 3, 4, 5].map(colIdx => renderCell(colIdx, 'remarks', '概要欄'))}
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Loading Person Column - Stack on mobile, side on desktop */}
                <div className="border border-gray-400 bg-white shadow-sm w-full md:w-32 flex flex-row md:flex-col">
                    <div className="bg-gray-100 p-2 text-center font-bold border-r md:border-r-0 md:border-b border-gray-400 w-32 md:w-full flex items-center justify-center text-sm h-auto md:h-[54px]">
                        積み込み<br className="hidden md:inline" />担当者
                    </div>
                    <div className="flex-1 flex items-center justify-center p-2 h-auto md:h-[192px]">
                        <select
                            className="w-full p-2 border rounded text-center font-medium text-black text-base"
                            value={dailyInfo.loadingPerson || ''}
                            onChange={(e) => handleDailyInfoUpdate(e.target.value)}
                        >
                            <option value="">(選択)</option>
                            {LOADING_PERSONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <datalist id="destinations">
                {DESTINATIONS.map(d => <option key={d} value={d} />)}
            </datalist>
            <datalist id="cargo-types">
                {CARGO_TYPES.map(c => <option key={c} value={c} />)}
            </datalist>
            <datalist id="time-options">
                {TIME_OPTIONS.map(t => <option key={t} value={t} />)}
            </datalist>

            {/* Placeholders for future sections */}
            <div className="mt-12 opacity-50">
                <h3 className="text-xl font-bold text-gray-700 mb-4">ステンレス 出荷</h3>
                <div className="h-24 bg-gray-100 border border-dashed border-gray-300 rounded flex items-center justify-center">

                </div>
            </div>
        </div>
    );
}
