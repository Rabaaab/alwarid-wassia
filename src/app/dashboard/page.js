'use client';
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function Redirect() {
    const router = useRouter();
    const mode = useSearchParams().get('mode') || 'consultation';
    useEffect(() => { router.replace(`/doctor/mode/${mode}`); }, [router, mode]);
    return null;
}

export default function DashboardPage() {
    return (
        <Suspense fallback={null}>
            <Redirect />
        </Suspense>
    );
}
