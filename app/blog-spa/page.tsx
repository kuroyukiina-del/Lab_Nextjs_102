'use client';

import { useState, useEffect } from 'react';
import type { ExternalItem } from '@/lib/external';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BlogSpaPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 1. อ่านค่าเริ่มต้นจาก URL ก่อนสร้าง State
    const initialSource = searchParams.get('source') === 'news' ? 'news' : 'products';
    const initialView = searchParams.get('view') === 'list' ? 'list' : 'grid';
    const initialSearch = searchParams.get('search') ?? '';

    // 2. ประกาศ States
    const [items, setItems] = useState<ExternalItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [source, setSource] = useState<'products' | 'news'>(initialSource);
    const [view, setView] = useState<'grid' | 'list'>(initialView);
    const [search, setSearch] = useState(initialSearch);
    const [error, setError] = useState('');

    function selectSource(s: 'products' | 'news') {
        setSource(s);
    }

    // 3. Fetch ข้อมูลเมื่อเปลี่ยน Source
    useEffect(() => {
        setIsLoading(true);
        setError('');

        fetch(`/api/aggregate?source=${source}`)
            .then((r) => {
                if (!r.ok) throw new Error('โหลดข้อมูลไม่สำเร็จ');
                return r.json();
            })
            .then((data: { external: ExternalItem[] }) => {
                setItems(data.external || []);
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [source]);

    // 4. อัปเดต URL Params เมื่อ State เปลี่ยนแปลง (ใช้ Debounce สำหรับ Search)
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams();
            params.set('source', source);
            params.set('view', view);

            if (search.trim()) {
                params.set('search', search);
            }

            router.replace(`/blog-spa?${params.toString()}`);
        }, 300);

        return () => clearTimeout(timer);
    }, [source, view, search, router]);

    // 5. กรองข้อมูลฝั่ง Client
    const filteredItems = items.filter((item) => {
        const keyword = search.toLowerCase();
        return (
            item.title?.toLowerCase().includes(keyword) ||
            item.subtitle?.toLowerCase().includes(keyword)
        );
    });

    if (error) {
        return (
            <main className="p-8 text-center">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-bold text-red-600">เกิดข้อผิดพลาด</h2>
                <p className="text-gray-500 mt-2">{error}</p>
            </main>
        );
    }

    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold text-blue-900 mb-6">
                🧩 Blog Aggregator (SPA)
            </h1>

            {/* Controls Bar */}
            <div className="flex flex-wrap gap-3 mb-6 items-center">
                <button
                    onClick={() => selectSource('products')}
                    className={`px-4 py-2 rounded border ${
                        source === 'products' ? 'bg-blue-600 text-white' : 'bg-white'
                    }`}
                >
                    Products
                </button>

                <button
                    onClick={() => selectSource('news')}
                    className={`px-4 py-2 rounded border ${
                        source === 'news' ? 'bg-blue-600 text-white' : 'bg-white'
                    }`}
                >
                    News
                </button>

                <div className="h-6 w-[1px] bg-gray-300 mx-1" />

                <button
                    onClick={() => setView('grid')}
                    className={`px-4 py-2 rounded border ${
                        view === 'grid' ? 'bg-gray-800 text-white' : 'bg-white'
                    }`}
                >
                    Grid View
                </button>

                <button
                    onClick={() => setView('list')}
                    className={`px-4 py-2 rounded border ${
                        view === 'list' ? 'bg-gray-800 text-white' : 'bg-white'
                    }`}
                >
                    List View
                </button>

                <input
                    type="text"
                    placeholder="ค้นหา..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded px-3 py-2 flex-1 min-w-[200px]"
                />
            </div>

            {/* Content Display */}
            {isLoading ? (
                <div className="text-center py-20">
                    <div className="text-5xl animate-spin">⏳</div>
                    <p className="mt-4 text-gray-500">กำลังโหลดข้อมูล...</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-6xl">📭</div>
                    <h2 className="text-xl font-semibold mt-4">ไม่พบข้อมูล</h2>
                    <p className="text-gray-500">ลองค้นหาด้วยคำอื่น</p>
                </div>
            ) : view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="p-4 bg-white rounded-lg border shadow-sm">
                            <h2 className="font-bold text-blue-800">{item.title}</h2>
                            <p className="text-gray-500 text-sm mt-1">{item.subtitle}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="border-b pb-3">
                            <h2 className="font-bold text-blue-800">{item.title}</h2>
                            <p className="text-gray-500">{item.subtitle}</p>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}