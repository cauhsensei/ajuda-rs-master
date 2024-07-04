// MyDonations.js

'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/firebase/firebaseConfig';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation';
import DeleteDialog from '@/components/DeleteDialog';
import ConfirmDonationDialog from '@/components/ConfirmDonationDialog';

const tabs = [
  { name: 'Todos', filter: 'all', current: true },
  { name: 'Pendentes', filter: 'pending', current: false },
  { name: 'Doado', filter: 'donated', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function MyDonations() {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDonationDialogOpen, setConfirmDonationDialogOpen] = useState(false);
  const [currentDonationId, setCurrentDonationId] = useState(null);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        console.log('User is not signed in.');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDonations = async () => {
      if (userId) {
        const donationsQuery = query(collection(db, 'donations'), where('userId', '==', userId));
        const querySnapshot = await getDocs(donationsQuery);
        const donationsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        donationsList.sort((a, b) => (a.status === 'Pending' ? -1 : 1));
        setDonations(donationsList);
        setFilteredDonations(donationsList);
      }
    };

    fetchDonations();
  }, [userId]);

  useEffect(() => {
    if (selectedTab === 'all') {
      setFilteredDonations(donations);
    } else if (selectedTab === 'pending') {
      setFilteredDonations(donations.filter(donation => donation.status !== 'Donated'));
    } else {
      setFilteredDonations(donations.filter(donation => donation.status === 'Donated'));
    }
  }, [selectedTab, donations]);

  const handleConfirmDonation = async () => {
    try {
      const donationRef = doc(db, 'donations', currentDonationId);
      await updateDoc(donationRef, {
        status: 'Donated',
      });
      setDonations(donations.map(donation => donation.id === currentDonationId ? { ...donation, status: 'Donated' } : donation));
      setConfirmDonationDialogOpen(false);
      setCurrentDonationId(null);
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  };

  const handleToggleStatusClick = (id, currentStatus) => {
    if (currentStatus === 'Pending') {
      setCurrentDonationId(id);
      setConfirmDonationDialogOpen(true);
    }
  };

  const handleDeleteClick = (id) => {
    setCurrentDonationId(id);
    setDialogOpen(true);
  };

  const deleteDonation = async () => {
    try {
      await deleteDoc(doc(db, 'donations', currentDonationId));
      setDonations(donations.filter(donation => donation.id !== currentDonationId));
      setDialogOpen(false);
      setCurrentDonationId(null);
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  };

  return (
    <div className="bg-white">
      <div className="py-6 sm:py-2 ">
        <div className="mx-auto max-w-7xl sm:px-2 lg:px-8">
          <div className="mx-auto max-w-2xl px-4 lg:max-w-4xl lg:px-0">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Minhas doações</h1>
            <p className="mt-2 text-sm text-gray-500">
              Confira o status das suas doações recentes e gerencie-as.
            </p>
          </div>          
        </div>

        <div className="mt-16">
          <h2 className="sr-only">Doações recentes</h2>
          <div className="mx-auto max-w-7xl sm:px-2 lg:px-8">
            <div className="mx-auto max-w-2xl space-y-8 sm:px-4 lg:max-w-4xl lg:px-0">
              <div className="border-b border-gray-200 mt-4">
                <div className="sm:flex sm:items-baseline">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">Histórico de doações</h3>
                  <div className="mt-4 sm:ml-10 sm:mt-0">
                    <nav className="-mb-px flex space-x-8">
                      {tabs.map((tab) => (
                        <button
                          key={tab.name}
                          onClick={() => setSelectedTab(tab.filter)}
                          className={classNames(
                            tab.filter === selectedTab
                              ? 'border-red-500 text-red-600'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                            'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium'
                          )}
                          aria-current={tab.filter === selectedTab ? 'page' : undefined}
                        >
                          {tab.name}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
              {filteredDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="border-b border-t border-gray-200 bg-white shadow-sm sm:rounded-lg sm:border"
                >
                  <div className="flex items-center border-b border-gray-200 p-4 sm:grid sm:grid-cols-4 sm:gap-x-6 sm:p-6">
                    <dl className="grid flex-1 grid-cols-2 gap-x-6 text-sm sm:col-span-3 sm:grid-cols-3 lg:col-span-2">
                      <div>
                        <dt className="font-medium text-gray-900">ID da Doação</dt>
                        <dd className="mt-1 text-gray-500">{donation.sessionTag}</dd>
                      </div>
                      <div className="hidden sm:block">
                        <dt className="font-medium text-gray-900">Data</dt>
                        <dd className="mt-1 text-gray-500">
                          <time>{new Date(donation.createdAt).toLocaleDateString()}</time>
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-900">Status</dt>
                        <dd className="mt-1 font-medium text-gray-900">{donation.status === 'Donated' ? 'Doado' : 'Pendente'}</dd>
                      </div>
                    </dl>

                    <Menu as="div" className="relative flex justify-end lg:hidden">
                      <div className="flex items-center">
                        <MenuButton className="-m-2 flex items-center p-2 text-gray-400 hover:text-gray-500">
                          <span className="sr-only">Options for donation {donation.sessionTag}</span>
                          <EllipsisVerticalIcon className="h-6 w-6" aria-hidden="true" />
                        </MenuButton>
                      </div>

                      <Transition
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <MenuItems className="absolute right-0 z-10 mt-2 w-40 origin-bottom-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            {donation.status !== 'Donated' && (
                              <MenuItem>
                                {({ focus }) => (
                                  <a
                                    onClick={() => handleToggleStatusClick(donation.id, donation.status)}
                                    className={classNames(
                                      focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                      'block px-4 py-2 text-sm cursor-pointer'
                                    )}
                                  >
                                    Marcar como doado
                                  </a>
                                )}
                              </MenuItem>
                            )}
                          </div>
                        </MenuItems>
                      </Transition>
                    </Menu>

                    <div className="hidden lg:col-span-2 lg:flex lg:items-center lg:justify-end lg:space-x-4">
                      {donation.status !== 'Donated' && (
                        <a
                          onClick={() => handleToggleStatusClick(donation.id, donation.status)}
                          className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer"
                        >
                          <span>Marcar como doado</span>
                          <span className="sr-only">para doação {donation.sessionTag}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Produtos */}
                  <h4 className="sr-only">Itens</h4>
                  <ul role="list" className="divide-y divide-gray-200">
                    <li className="p-4 sm:p-6">
                      <div className="flex items-center sm:items-start">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 sm:h-40 sm:w-40">
                          <img
                            src={donation.photos && donation.photos[0]}
                            alt={donation.title}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="ml-6 flex-1 text-sm">
                          <div className="font-medium text-gray-900 sm:flex sm:justify-between">
                            <h5>{donation.title}</h5>
                            <p className="mt-2 sm:mt-0">{donation.category}</p>
                          </div>
                          <p className="hidden text-gray-500 sm:mt-2 sm:block">{donation.description}</p>
                        </div>
                      </div>

                      <div className="mt-6 sm:flex sm:justify-between">
                        <div className="flex items-center">
                          {donation.status === 'Donated' ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                          ) : (
                            <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" aria-hidden="true" />
                          )}
                          <p className="ml-2 text-sm font-medium text-gray-500">
                            {donation.status === 'Donated' ? 'Doado' : 'Pendente'}
                          </p>
                        </div>

                        <div className="mt-6 flex items-center space-x-4 divide-x divide-gray-200 border-t border-gray-200 pt-4 text-sm font-medium sm:ml-4 sm:mt-0 sm:border-none sm:pt-0">
                          <div className="flex flex-1 justify-center">
                            <a
                              onClick={() => router.push(`/donation/${donation.id}`)}
                              className="whitespace-nowrap text-gray-600 hover:text-gray-500 cursor-pointer"
                            >
                              Ver produto
                            </a>
                          </div>
                          <div className="flex flex-1 justify-center pl-4">
                            <a
                              onClick={() => handleDeleteClick(donation.id)}
                              className="whitespace-nowrap text-red-600 hover:text-red-500 cursor-pointer"
                            >
                              Excluir doação
                            </a>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DeleteDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={deleteDonation}
      />

      <ConfirmDonationDialog
        isOpen={confirmDonationDialogOpen}
        onClose={() => setConfirmDonationDialogOpen(false)}
        onConfirm={handleConfirmDonation}
      />
    </div>
  );
}
