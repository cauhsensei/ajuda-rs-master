'use client';

import DonationsMap from '@/components/DonationsMap';
import Header from '@/components/Header';

export default function DonationsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 lg:max-w-7xl pb-16 lg:pb-16 lg:px-8">
          <div className="border-b border-gray-200 pb-10 pt-16">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Doações próximas</h1>
            <p className="mt-4 text-base text-gray-500">
              Faça uma busca e encontre doações perto de você.
            </p>
          </div>
        <DonationsMap />
      </main>
    </>
  );
}
