'use client';

import React from 'react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="max-w-2xl w-full text-center bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Hello, Next.js + TypeScript!</h1>
        <p className="text-md text-gray-600 mb-6">
          This is a simple home page with Tailwind CSS.
        </p>
        
      </div>
    </main>
  );
}