'use client';

import { useState, useEffect } from 'react';
import { db } from '@/firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function FeedDonations({ selectedFilters, searchQuery }) {
  const [donations, setDonations] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchDonations = async () => {
      const querySnapshot = await getDocs(collection(db, 'donations'));
      const donationsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const filteredDonations = donationsList.filter(donation => 
        !donation.status || donation.status === 'Pending'
      );

      setDonations(filteredDonations);
    };

    fetchDonations();
  }, []);

  const applyFilters = (donations) => {
    let filteredDonations = donations;

    if (selectedFilters.category.length > 0) {
      filteredDonations = filteredDonations.filter((donation) =>
        selectedFilters.category.includes(donation.category)
      );
    }
    if (selectedFilters.sizesfraldas.length > 0) {
      filteredDonations = filteredDonations.filter((donation) =>
        selectedFilters.sizesfraldas.includes(donation.sizes)
      );
    }
    if (selectedFilters.sizesroupas.length > 0) {
      filteredDonations = filteredDonations.filter((donation) =>
        selectedFilters.sizesroupas.includes(donation.sizes)
      );
    }
    if (selectedFilters.sizescalçados.length > 0) {
      filteredDonations = filteredDonations.filter((donation) =>
        selectedFilters.sizescalçados.includes(donation.sizes)
      );
    }

    if (searchQuery) {
      filteredDonations = filteredDonations.filter((donation) =>
        donation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donation.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filteredDonations;
  };

  const filteredDonations = applyFilters(donations);

  return (
    <div className="bg-white">
      <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
        {filteredDonations.map((donation) => (
          <div
            key={donation.id}
            className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white cursor-pointer"
            onClick={() => router.push(`/donation/${donation.id}`)}
          >
            <div className="aspect-h-4 aspect-w-3 bg-gray-200 sm:aspect-none group-hover:opacity-75 sm:h-96">
              {donation.photos && donation.photos.length > 0 ? (
                <img
                  src={donation.photos[0]}
                  alt={donation.title}
                  className="h-full w-full object-cover object-center sm:h-full sm:w-full"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  Sem imagem
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col space-y-2 p-4">
              <h3 className="text-base font-medium text-gray-900">
                <a href="#">
                  <span aria-hidden="true" className="absolute inset-0" />
                  {donation.title}
                </a>
              </h3>
              <p className="text-sm text-gray-500">{donation.description}</p>
              <div className="flex flex-1 flex-col justify-end">
                <p className="text-sm font-medium text-gray-900">Quantidade: {donation.quantity}</p>
                <p className="text-sm italic text-gray-500">{donation.category}</p>
                <button
                  className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/donation/${donation.id}`);
                  }}
                >
                  Ver mais
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
