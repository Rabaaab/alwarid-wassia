'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ConfirmDoctor from '@/screens/ConfirmDoctor';
import ConfirmPatient from '@/screens/ConfirmPatient';

function Inner() {
    const role = useSearchParams().get('role');
    return role === 'patient' ? <ConfirmPatient /> : <ConfirmDoctor />;
}

export default function ConfirmPage() {
    return (
        <Suspense fallback={null}>
            <Inner />
        </Suspense>
    );
}
