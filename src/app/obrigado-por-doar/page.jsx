'use client'

import { useEffect, useState } from 'react';
import { db, auth } from '@/firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import Header from '@/components/Header';

export default function ObrigadoPorDoar() {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [sessionTag, setSessionTag] = useState(null); 

  useEffect(() => {
    const storedSessionTag = localStorage.getItem('sessionTag'); 
    if (storedSessionTag) {
      setSessionTag(storedSessionTag);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && sessionTag) {
      const fetchItems = async () => {
        const q = query(collection(db, 'donations'), where('userId', '==', user.uid), where('sessionTag', '==', sessionTag));
        const querySnapshot = await getDocs(q);
        const itemsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setItems(itemsList);
      };

      fetchItems();
    }
  }, [user, sessionTag]);

  return (
    <>
    <Header />
      <main className="relative lg:min-h-full">
        <div className="h-80 overflow-hidden lg:absolute lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12">
          <img
            src="https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?q=80&w=3164&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="TODO"
            className="h-full w-full object-cover object-center"
          />
        </div>

        <div>
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24">
            <div className="lg:col-start-2">
              <h1 className="text-sm font-medium text-red-600">Mantimentos postados com sucesso</h1>
              <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Muito obrigado por doar!</p>
              <p className="mt-2 text-base text-gray-500">
                Nós apreciamos sua iniciativa! Continue doando e ajudando pessoas. Abaixo você pode ver todas as informações referentes ao que foi doado e pessoas entrarão em contato com você solicitando algum item. Fique atento à sua conta e ao seu email.
              </p>

              <dl className="mt-16 text-sm font-medium">
                <dt className="text-gray-900">Itens que você anunciou:</dt>
              </dl>

              <ul
                role="list"
                className="mt-6 divide-y divide-gray-200 border-t border-gray-200 text-sm font-medium text-gray-500"
              >
                {items.map((item) => (
                  <li key={item.id} className="flex space-x-6 py-6">
                    {item.photos && item.photos.length > 0 && (
                      <img
                        src={item.photos[0]}
                        alt={item.title || "Imagem do item"}
                        className="h-24 w-24 flex-none rounded-md bg-gray-100 object-cover object-center"
                      />
                    )}
                    <div className="flex-auto space-y-1">
                      <h3 className="text-gray-900">
                        <a href="#">{item.title}</a>
                      </h3>
                      <p>{item.category}</p>
                      <p>Quantidade: {item.quantity}</p>
                      {item.sizes && <p>Tamanho: {item.sizes}</p>}
                      {item.description && <p>{item.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-16 border-t border-gray-200 py-6 text-right">
                <a href="/meu-painel" className="text-sm font-medium text-red-600 hover:text-red-500">
                  Ir para meu painel
                  <span aria-hidden="true"> &rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
