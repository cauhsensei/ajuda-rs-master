'use client'

import { useState, useEffect } from 'react';
import { db, auth, storage } from '@/firebase/firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { XMarkIcon } from '@heroicons/react/24/solid'; 
import SuccessDialog from '../SuccessDialog';

export default function ReportPage() {
  const [reportData, setReportData] = useState({
    reason: '',
    link: '',
    description: '',
    imageUrls: [],
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]); 
  const [userId, setUserId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);


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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReportData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.slice(0, 4 - imageFiles.length); 
    const imagePreviews = newImages.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));
    setImageFiles((prevState) => [...prevState, ...imagePreviews]);
    setSelectedFiles((prevState) => [...prevState, ...newImages]);
  };

  const removeImage = (index, e) => {
    e.preventDefault(); 
    
    setImageFiles((prevState) => prevState.filter((_, i) => i !== index));
    setSelectedFiles((prevState) => prevState.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!userId) {
    alert('Você precisa estar logado para fazer uma denúncia.');
    return;
  }

  let imageUrls = [];

  if (selectedFiles.length > 0) {
    imageUrls = await Promise.all(
      selectedFiles.map(async (file) => {
        const fileRef = ref(storage, `reports/${userId}/${file.name}`);
        await uploadBytes(fileRef, file);
        return getDownloadURL(fileRef);
      })
    );
  }

  try {
    await addDoc(collection(db, 'reports'), {
      ...reportData,
      imageUrls,
      userId,
      createdAt: new Date().toISOString(),
    });
    setDialogOpen(true);
    setReportData({
      reason: '',
      link: '',
      description: '',
      imageUrls: [],
    });
    setSelectedFiles([]);
    setImageFiles([]);
  } catch (error) {
    console.error('Error adding document: ', error);
    alert('Erro ao enviar a denúncia. Tente novamente.');
  }
};


  return (
    <form onSubmit={handleSubmit}>
        
    <SuccessDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} />

      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Denunciar um Problema</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Preencha o formulário abaixo para denunciar fraudes, conversas abusivas, spam ou anúncios inadequados.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label htmlFor="reason" className="block text-sm font-medium leading-6 text-gray-900">
                Motivo da Denúncia
              </label>
              <div className="mt-2">
                <select
                  id="reason"
                  name="reason"
                  value={reportData.reason}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  <option value="">Selecione um motivo</option>
                  <option value="fraude">Fraude</option>
                  <option value="abuso">Conversas Abusivas</option>
                  <option value="spam">Spam</option>
                  <option value="inadequado">Anúncios Inadequados</option>
                </select>
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="link" className="block text-sm font-medium leading-6 text-gray-900">
                Link da Postagem
              </label>
              <div className="mt-2">
                <input
                  type="url"
                  name="link"
                  id="link"
                  value={reportData.link}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                Descrição
              </label>
              <div className="mt-2">
                <textarea
                  id="description"
                  name="description"
                  value={reportData.description}
                  onChange={handleChange}
                  rows="4"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="photos" className="block text-sm font-medium leading-6 text-gray-900">
                Fotos da Postagem
              </label>
              <div className="mt-2 flex flex-col items-center rounded-lg border border-dashed border-gray-900/25 p-6">
                <div className="flex flex-wrap gap-2 justify-center">
                  {imageFiles.map((image, index) => (
                    <div key={index} className="relative">
                      <img src={image.url} alt={`Preview ${index + 1}`} className="w-24 h-24 rounded-md object-cover" />
                      <button
                        onClick={(e) => removeImage(index, e)}
                        className="absolute top-0 right-0 bg-red-600 rounded-full p-1 text-white"
                        aria-label="Remove image"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="photos"
                    className={`relative cursor-pointer rounded-md bg-white font-semibold text-red-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-red-600 focus-within:ring-offset-2 hover:text-red-500 ${imageFiles.length >= 4 ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span>Carregar mais arquivos</span>
                    <input
                      id="photos"
                      name="photos"
                      type="file"
                      className="sr-only"
                      multiple
                      onChange={handleImageChange}
                      disabled={imageFiles.length >= 4}
                    />
                  </label>
                  <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF até 10MB cada (máximo de 4 imagens)</p>
                </div>
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
          Enviar Denúncia
        </button>
      </div>
    </form>
  );
}
