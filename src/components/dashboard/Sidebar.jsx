'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import {
  Bars3Icon,
  HomeIcon,
  HeartIcon,
  UserIcon,
  FlagIcon,
  XMarkIcon,
  ArrowLeftStartOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import MyDonations from './MyDonations';
import UserProfile from './UserProfile';
import ReportPage from './ReportPage';
import MyPanel from './MyPanel';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState('Meu painel');
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      router.push('/login'); // Redireciona usando useRouter
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const navigation = [
    { name: 'Meu painel', href: '#mypanel', icon: HomeIcon, current: activeComponent === 'Meu painel' },
    { name: 'Minhas doações', href: '#mydonations', icon: HeartIcon, current: activeComponent === 'Minhas doações' },
    { name: 'Meus dados', href: '#myprofile', icon: UserIcon, current: activeComponent === 'Meus dados' },
    { name: 'Denúncias', href: '#report', icon: FlagIcon, current: activeComponent === 'Denúncias' },
    { name: 'Sair da conta', href: '#logout', icon: ArrowLeftStartOnRectangleIcon, action: handleLogout, current: false },
  ];

  useEffect(() => {
    const savedComponent = localStorage.getItem('activeComponent');
    if (savedComponent) {
      setActiveComponent(savedComponent);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('activeComponent', activeComponent);
  }, [activeComponent]);

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'Minhas doações':
        return <MyDonations />;
      case 'Meus dados':
        return <UserProfile />;
      case 'Denúncias':
        return <div><ReportPage /></div>;
      default:
        return <div><MyPanel /></div>;
    }
  };

  return (
    <>
      <div>
        <Transition show={sidebarOpen}>
          <Dialog className="relative z-10 lg:hidden" onClose={setSidebarOpen}>
            <TransitionChild
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </TransitionChild>

            <div className="fixed inset-0 flex">
              <TransitionChild
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <TransitionChild
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </TransitionChild>
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                    <div className="flex h-16 shrink-0 items-center"></div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <button
                                  onClick={() => {
                                    if (item.action) {
                                      item.action(); // Chama a função de logout
                                    } else {
                                      setActiveComponent(item.name);
                                      setSidebarOpen(false);
                                      window.location.hash = item.href;
                                    }
                                  }}
                                  className={classNames(
                                    item.current
                                      ? 'bg-gray-50 text-red-600'
                                      : 'text-gray-700 hover:text-red-600 hover:bg-gray-50',
                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full text-left'
                                  )}
                                >
                                  <item.icon
                                    className={classNames(
                                      item.current ? 'text-red-600' : 'text-gray-400 group-hover:text-red-600',
                                      'h-6 w-6 shrink-0'
                                    )}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </Dialog>
        </Transition>

        <div className="hidden lg:fixed lg:inset-y-0 lg:z-10 mt-20 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6">
            <div className="flex h-16 shrink-0 items-center"></div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <button
                          onClick={() => {
                            if (item.action) {
                              item.action();
                            } else {
                              setActiveComponent(item.name);
                            }
                          }}
                          className={classNames(
                            item.current
                              ? 'bg-gray-50 text-red-600'
                              : 'text-gray-700 hover:text-red-600 hover:bg-gray-50',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full text-left'
                          )}
                        >
                          <item.icon
                            className={classNames(
                              item.current ? 'text-red-600' : 'text-gray-400 group-hover:text-red-600',
                              'h-6 w-6 shrink-0'
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="sticky top-0 z-10 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">Meu painel</div>
          <a href="#">
            <span className="sr-only">Your profile</span>
          </a>
        </div>

        <main className="py-10 lg:pl-72">
          <div className="px-4 sm:px-6 lg:px-8">
            {renderActiveComponent()}
          </div>
        </main>
      </div>
    </>
  );
}
