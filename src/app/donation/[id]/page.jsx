'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { db, auth } from '@/firebase/firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import {
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@headlessui/react';
import { HeartIcon } from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { onAuthStateChanged } from 'firebase/auth';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function DonationDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donorUser, setDonorUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchDonation = async () => {
        try {
          const docRef = doc(db, 'donations', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const donationData = docSnap.data();
            setDonation(donationData);
            await fetchUser(donationData.userId);
          } else {
            setError('No such document!');
          }
        } catch (error) {
          setError('Error fetching document');
        } finally {
          setLoading(false);
        }
      };

      const fetchUser = async (userId) => {
        if (userId) {
          try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              setDonorUser(userSnap.data());
            } else {
              console.log('No such user document!');
            }
          } catch (error) {
            console.error('Error fetching user document:', error);
          }
        }
      };

      fetchDonation();
    }
  }, [id]);

  const handleChatRedirect = async () => {
    if (currentUser && donorUser && donation) {
      const chatsRef = collection(db, 'chats');

      const q = query(chatsRef, where('members', 'array-contains-any', [currentUser.uid, donation.userId]));
      const querySnapshot = await getDocs(q);

      let chatExists = false;
      let chatDocId = '';
      querySnapshot.forEach((doc) => {
        const members = doc.data().members;
        if (members.includes(currentUser.uid) && members.includes(donation.userId)) {
          chatExists = true;
          chatDocId = doc.id;
        }
      });

      if (!chatExists) {
        const chatDoc = await addDoc(chatsRef, {
          members: [currentUser.uid, donation.userId],
          createdAt: new Date(),
        });
        chatDocId = chatDoc.id;
      }

      router.push(`/chat/${chatDocId}`);
    } else {
      console.error('Erro: currentUser.uid ou donation.userId está indefinido');
    }
  };

  const extractCityState = (location) => {
    if (!location) return '';
    const parts = location.split(',');
    if (parts.length >= 3) {
      return parts[parts.length - 3].trim();
    }
    return '';
  };

  if (loading) {
    return (
      <div className="grid min-h-[140px] w-full place-items-center overflow-x-scroll rounded-lg p-6 lg:overflow-visible">
        <svg className="w-16 h-16 animate-spin text-gray-900/50" viewBox="0 0 64 64" fill="none"
          xmlns="http://www.w3.org/2000/svg" width="24" height="24">
          <path
            d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
            stroke="currentColor" strokeWidth="5" strokeLinecap="round" sstrokelinejoin="round"></path>
          <path
            d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
            stroke="currentColor" strokeWidth="5" strokeLinecap="round" sstrokelinejoin="round" className="text-gray-900">
          </path>
        </svg>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!donation) {
    return <div>No donation data found.</div>;
  }

  return (
    <>
      <Header />
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
            {/* Image gallery */}
            <TabGroup className="flex flex-col-reverse">
              {/* Image selector */}
              <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
                <TabList className="grid grid-cols-4 gap-6">
                  {donation.photos.map((image, index) => (
                    <Tab
                      key={index}
                      className="relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4"
                    >
                      {({ selected }) => (
                        <>
                          <span className="sr-only">{donation.title}</span>
                          <span className="absolute inset-0 overflow-hidden rounded-md">
                            <img src={image} alt="" className="h-full w-full object-cover object-center" />
                          </span>
                          <span
                            className={classNames(
                              selected ? 'ring-red-500' : 'ring-transparent',
                              'pointer-events-none absolute inset-0 rounded-md ring-2 ring-offset-2'
                            )}
                            aria-hidden="true"
                          />
                        </>
                      )}
                    </Tab>
                  ))}
                </TabList>
              </div>

              <TabPanels className="aspect-h-1 aspect-w-1 w-full">
                {donation.photos.map((image, index) => (
                  <TabPanel key={index}>
                    <img
                      src={image}
                      alt={donation.title}
                      className="h-full w-full object-cover object-center sm:rounded-lg"
                    />
                  </TabPanel>
                ))}
              </TabPanels>
            </TabGroup>

            {/* Product info */}
            <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{donation.title}</h1>

              <div className="mt-3">
                <h2 className="sr-only">Product information</h2>
                <p className="text-3xl tracking-tight text-gray-900">{donation.description}</p>
              </div>

              <div className="mt-6">
                <h3 className="sr-only">Description</h3>

                <div className="space-y-6 text-base text-gray-700">
                  <p>{donation.presentation}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex-shrink-0">
                  {donorUser && donorUser.profileImage ? (
                    <img src={donorUser.profileImage} alt={donorUser.fullName} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <UserCircleIcon className="h-12 w-12 text-gray-300" aria-hidden="true" />
                  )}
                </div>
                <div className="text-sm leading-6">
                  <p className="font-semibold text-gray-900">{donorUser ? donorUser.fullName : 'Usuário desconhecido'}</p>
                  <p className="text-gray-600">{donorUser ? extractCityState(donorUser.location) : 'Doador'}</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Detalhes do item</h3>
                <table className="mt-4 w-full text-base text-gray-500">
                  <tbody>
                    <tr>
                      <td className="py-2 font-medium text-gray-900">Quantidade:</td>
                      <td className="py-2">{donation.quantity}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-gray-900">Categoria:</td>
                      <td className="py-2">{donation.category}</td>
                    </tr>
                    {donation.batch && (
                      <tr>
                        <td className="py-2 font-medium text-gray-900">Data de validade:</td>
                        <td className="py-2">{donation.expirationDate}</td>
                      </tr>
                    )}
                    {donation.type && (
                      <tr>
                        <td className="py-2 font-medium text-gray-900">Tipo:</td>
                        <td className="py-2">{donation.type}</td>
                      </tr>
                    )}
                    {donation.sizes && (
                      <tr>
                        <td className="py-2 font-medium text-gray-900">Tamanho:</td>
                        <td className="py-2">{donation.sizes}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <form className="mt-6">
                <div className="mt-10 flex">
                  <button
                    type="button"
                    onClick={handleChatRedirect}
                    className="flex max-w-xs flex-1 items-center justify-center gap-2 rounded-md border border-transparent bg-red-600 px-8 py-3 text-base font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-50 sm:w-full"
                  >
                    Falar com o doador
                  </button>

                  <button
                    type="button"
                    className="ml-4 flex items-center justify-center rounded-md px-3 py-3 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                  >
                    <HeartIcon className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
                    <span className="sr-only">Salvar item</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
