import { useState, useEffect } from 'react';
import { db, auth, storage } from '@/firebase/firebaseConfig'; // Certifique-se de importar 'storage'
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Importar funções do storage
import { UserCircleIcon } from '@heroicons/react/24/solid';

export default function UserProfile() {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    lat: '',
    lng: '',
    fullName: '',
    whatsapp: '',
    profileImage: '', // Adicionei profileImage para armazenar a URL da imagem
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchUserData = async (uid) => {
      try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const nameParts = data.fullName.split(' ');
          const firstName = nameParts.slice(0, -1).join(' ');
          const lastName = nameParts.slice(-1).join(' ');

          setUserData({
            firstName,
            lastName,
            email: data.email,
            location: data.location,
            lat: data.lat,
            lng: data.lng,
            fullName: data.fullName,
            whatsapp: data.whatsapp,
            profileImage: data.profileImage || '', // Atualize para pegar a URL da imagem
          });
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        console.log('User is not signed in.');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUserData((prevState) => ({
          ...prevState,
          profileImage: reader.result,
        }));
        setSelectedFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (selectedFile) {
      setIsUploading(true); // Define o estado de upload

      try {
        const user = auth.currentUser;
        if (user) {
          const storageRef = ref(storage, `profileImages/${user.uid}`);
          await uploadBytes(storageRef, selectedFile);
          const downloadURL = await getDownloadURL(storageRef);

          // Atualize o documento do usuário com a URL da imagem
          await updateDoc(doc(db, 'users', user.uid), {
            profileImage: downloadURL,
          });

          setUserData((prevState) => ({
            ...prevState,
            profileImage: downloadURL,
          }));
          setSelectedFile(null);
        } else {
          console.log('No user is signed in.');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setIsUploading(false); // Libere o estado de upload
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, userData);
        console.log('User data updated successfully');
      } else {
        console.log('No user is signed in.');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Meus dados</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Essas informações serão exibidas publicamente, preencha corretamente.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                Nome
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="firstName"
                  id="first-name"
                  value={userData.firstName}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
                Sobrenome
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="lastName"
                  id="last-name"
                  value={userData.lastName}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="photo" className="block text-sm font-medium leading-6 text-gray-900">
                Foto
              </label>
              <div className="mt-2 flex items-center gap-x-3">
                {userData.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt="Profile"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="h-12 w-12 text-gray-300" aria-hidden="true" />
                )}
                <button
                  type="button"
                  className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  Alterar
                </button>
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>
              {selectedFile && (
                <button
                  type="button"
                  className="mt-4 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                  onClick={handleImageUpload}
                  disabled={isUploading}
                >
                  {isUploading ? 'Salvando...' : 'Salvar Foto'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Contato e endereço</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Use um contato e endereço permanente onde você possa receber correspondências.</p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Endereço de e-mail
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="whatsapp" className="block text-sm font-medium leading-6 text-gray-900">
                Número de Whatsapp
              </label>
              <div className="mt-2">
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="text"
                  value={userData.whatsapp || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                />
              </div>
          
            </div>

            <div className="col-span-full">
              <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900">
                Endereço
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="location"
                  id="street-address"
                  value={userData.location}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button type="button" className="text-sm font-semibold leading-6 text-gray-900">
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
