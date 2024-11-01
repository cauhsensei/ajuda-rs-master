// components/CompleteProfile.js
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MyMap from "./Map";
import { db } from "@/firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function CompleteProfile({ user, onComplete }) {
  const router = useRouter();
  const [location, setLocation] = useState({ lat: '', lng: '', address: '' });
  const [formValues, setFormValues] = useState({
    fullName: '',
    location: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.address) {
      setFormValues((prevValues) => ({
        ...prevValues,
        location: location.address,
      }));
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      
      await setDoc(doc(db, "users", user.uid), {
        fullName: formValues.fullName,
        email: user.email,
        location: formValues.location,
        lat: location.lat,
        lng: location.lng,
      });

      onComplete();

      router.push('/');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Complete seu perfil
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="full-name" className="block text-sm font-medium leading-6 text-gray-900">
                Seu nome completo
              </label>
              <div className="mt-2">
                <input
                  id="full-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={formValues.fullName}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium leading-6 text-gray-900">
                Sua localização
              </label>
              <div className="mt-2">
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formValues.location}
                  onChange={handleChange}
                  autoComplete="off"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <MyMap setLocation={setLocation} />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Completar Perfil
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
