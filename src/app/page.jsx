'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('ll_token');
    router.push(token ? '/dashboard' : '/login');
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-4xl animate-pulse">💌</div>
    </div>
  );
}
