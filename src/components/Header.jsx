'use client'

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ChatBubbleBottomCenterTextIcon, BellIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import AJUDARSLOGO from '../images/AJUDARSLOGO.png';
import { getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

const navigation = [
  { name: 'Como ajudar?', href: '/como-ajudar' },
  { name: 'Informações gerais', href: '/meu-painel' },
  { name: 'Buscar doações próximas', href: '/doacoes-proximas' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      // Fetch unread messages count
      const fetchUnreadCount = async () => {
        const chatQuery = query(collection(db, 'chats'), where('members', 'array-contains', user.uid));
        const chatSnapshot = await getDocs(chatQuery);
        let totalUnreadCount = 0;

        for (const chatDoc of chatSnapshot.docs) {
          const messagesQuery = query(collection(db, 'chats', chatDoc.id, 'messages'), where('unreadBy', 'array-contains', user.uid));
          const messagesSnapshot = await getDocs(messagesQuery);
          totalUnreadCount += messagesSnapshot.size;
        }

        setUnreadCount(totalUnreadCount);
      };

      fetchUnreadCount();
    }
  }, [user]);

  return (
    <header className="bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">AJUDARS</span>
            <Image className="h-16 w-auto" src={AJUDARSLOGO} alt="" />
          </a>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <a key={item.name} href={item.href} className="text-sm font-semibold leading-6 text-gray-900">
              {item.name}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-x-6 pl-6">
          <a href="/anuncie-mantimentos" className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
            ANUNCIE MANTIMENTOS
          </a>
          {!loading && user ? (
            <>
            <a href="/chat" className="relative">
                <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white text-xs">
                    {unreadCount}
                  </span>
                )}
              </a>
              <a href="/meu-painel" className="hidden lg:block lg:text-sm lg:font-semibold lg:leading-6 lg:text-gray-900">
                Meu Painel <span aria-hidden="true">&rarr;</span>
              </a>
            </>
          ) : (
            !loading && (
              <a href="/login" className="hidden lg:block lg:text-sm lg:font-semibold lg:leading-6 lg:text-gray-900">
                Acessar <span aria-hidden="true">&rarr;</span>
              </a>
            )
          )}
        </div>
        <div className="flex lg:hidden">
          <button type="button" className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700" onClick={() => setMobileMenuOpen(true)}>
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </nav>
      <Dialog className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center gap-x-6">
            <a href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">AJUDARS</span>
              <Image className="h-8 w-auto" src={AJUDARSLOGO} alt="" />
            </a>
            <a href="/anuncie-mantimentos" className="ml-auto rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
              ANUNCIE MANTIMENTOS
            </a>
            <button type="button" className="-m-2.5 rounded-md p-2.5 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <a key={item.name} href={item.href} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="py-6">
                {!loading && user ? (
                  <a href="/meu-painel" className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                    Meu Painel <span aria-hidden="true">&rarr;</span>
                  </a>
                ) : (
                  !loading && (
                    <a href="/login" className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                      Acessar <span aria-hidden="true">&rarr;</span>
                    </a>
                  )
                )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
