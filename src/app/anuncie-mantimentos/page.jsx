'use client'

import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation'; 
import { RadioGroup } from '@headlessui/react';
import { CheckCircleIcon, TrashIcon } from '@heroicons/react/20/solid';
import { PhotoIcon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { db, storage, auth } from '@/firebase/firebaseConfig'; 
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import DonationDialog from '@/components/DonationDialog';
import MedicationWarningDialog from '@/components/MedicationWarningDialog';
import ConfirmDialog from '@/components/ConfirmationDialog';
import { onAuthStateChanged } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import Header from '@/components/Header';

export default function AnuncieMantimentos() {
  const [formValues, setFormValues] = useState({
    title: '',
    category: '',
    type: '',
    quantity: '',
    presentation: '',
    batch: '',
    expirationDate: '',
    sizes: '',
    description: '',
    photos: null,
  });

  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [showBatch, setShowBatch] = useState(false);
  const [showExpirationDate, setShowExpirationDate] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [showMedicationWarning, setShowMedicationWarning] = useState(false);
  const [showMedicationDateError, setShowMedicationDateError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sessionTag, setSessionTag] = useState(uuidv4());

  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/cadastro');
      }
    });
  }, [router]);

  const openConfirmDialog = () => {
    setConfirmOpen(true);
  };

  const closeConfirmDialog = () => {
    setConfirmOpen(false);
  };

  const finalizeDonation = () => {
    setLoading(true);
    setItems([]);
    setLoading(false);
    setConfirmOpen(false);
    router.push('/obrigado-por-doar'); 
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });

    if (name === 'category' && value === "Roupas e Calçados") {
      setShowSizes(true);
    } else if (name === 'category') {
      setShowSizes(false);
    }

    if (name === 'category' && value === "Medicamentos e utensílios") {
      setShowMedicationWarning(true);
    } else {
      setShowMedicationWarning(false);
    }
  };

  const handleTypeChange = (e) => {
    setFormValues({ ...formValues, type: e.target.value });
  };
  
  useEffect(() => {
    const category = formValues.category;
    setShowBatch(category === "Itens de cesta básica" || category === "Itens de higiene pessoal" || category === "Medicamentos e utensílios" || category === "Fraldas infantis e geriátricas");
    setShowExpirationDate(category === "Itens de cesta básica" || category === "Itens de higiene pessoal" || category === "Medicamentos e utensílios");
    setShowSizes(category === "Roupas e Calçados" || category === "Cobertores e roupa de cama" || category === "Fraldas infantis e geriátricas");
  }, [formValues.category]);

  useEffect(() => {
    return () => {
      // Limpa todos os URLs de objeto quando o componente é desmontado
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const isDateValid = (date) => {
    const selectedDate = new Date(date);
    const currentDate = new Date();
    const threeMonthsLater = new Date(currentDate.setMonth(currentDate.getMonth() + 3));

    return selectedDate > threeMonthsLater;
  };
  

  const handleFinishDonation = () => {
    setOpenDialog(false);
    router.push('/obrigado-por-doar'); 
  };

  const handleImageChange = (e) => {
    const { files } = e.target;
    const newFiles = Array.from(files).map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
  
    if (imageFiles.length + newFiles.length > 4) {
      alert("Você pode carregar no máximo 4 imagens.");
      return; 
    }
  
    setImageFiles(prev => [...prev, ...newFiles]);
  };
  

  const removeImage = (index) => {
    const filteredFiles = imageFiles.filter((_, idx) => idx !== index);
    setImageFiles(filteredFiles);
  
    // Libera a URL de objeto para evitar vazamento de memória
    URL.revokeObjectURL(imageFiles[index].url);
  };

  const uploadPhotos = async (files) => {
    // Verifique se files é null ou undefined antes de tentar convertê-lo em uma array
    if (!files || files.length === 0) return [];
    const fileList = Array.from(files);  // Array.from lança um erro se files for null

    const uploadPromises = fileList.map(file => {
      const storageRef = ref(storage, `donations/${file.name}`);
      return uploadBytesResumable(storageRef, file).then(uploadTask => getDownloadURL(uploadTask.ref));
    });
  
    return Promise.all(uploadPromises);
};

useEffect(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUser(user);
    } else {
      setUser(null);
    }
  });
}, []);

const handleAddItem = async () => {
  if (!user) {
    alert("Você precisa estar logado para adicionar um item.");
    return;
  }

  setLoading(true);
  try {
    const photoURLs = await uploadPhotos(imageFiles.map(file => file.file)); // Obtém as URLs das fotos
    const newItem = {
      ...formValues,
      photos: photoURLs,
      userId: user.uid, 
      sessionTag: sessionTag,
    };

    setItems(prevItems => [...prevItems, newItem]);

    setFormValues({
      title: '',
      category: '',
      quantity: '',
      presentation: '',
      batch: '',
      expirationDate: '',
      sizes: '',
      description: '',
      photos: [] 
    });
    setImageFiles([]);

    localStorage.setItem('sessionTag', sessionTag);

    await addDoc(collection(db, 'donations'), newItem);

    setLoading(false);
    setOpenDialog(false);
  } catch (error) {
    console.error('Error uploading photos: ', error);
    setLoading(false);
  }
};

const isDateNotExpired = (date) => {
  const selectedDate = new Date(date);
  const currentDate = new Date();
  return selectedDate >= currentDate;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const categoriesWithThreeMonthsRequirement = ["Medicamentos e utensílios"];
  const categoriesWithNoExpiredRequirement = ["Itens de cesta básica", "Itens de higiene pessoal"];

  if ((formValues.category === "Medicamentos e utensílios" && !isDateValid(formValues.expirationDate)) ||
      (["Itens de cesta básica", "Itens de higiene pessoal"].includes(formValues.category) && !isDateNotExpired(formValues.expirationDate))) {
    const errorMessage = formValues.category === "Medicamentos e utensílios"
      ? "A data de validade deve ser superior a 3 meses. Verifique e tente novamente."
      : "A data de validade não pode estar vencida. Verifique e tente novamente.";
    setShowMedicationDateError(true);
    setErrorMessage(errorMessage);
    return;
  }

  if (imageFiles.length === 0) {
    setErrorMessage("É necessário adicionar pelo menos uma imagem para fazer a doação.");
    setShowMedicationDateError(true);
    return;
  }

  setOpenDialog(true);
};


function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

  return (
    <div className="bg-gray-50">
      <DonationDialog
        open={openDialog}
        setOpen={setOpenDialog}
        handleAddMore={handleAddItem}
        handleFinish={handleFinishDonation}
        handleAddItem={handleAddItem}
        loading={loading}
      />

      <MedicationWarningDialog
        isOpen={showMedicationWarning}
        onClose={() => setShowMedicationWarning(false)}
        title="Aviso Importante Sobre Medicamentos"
        message="Só são aceitos medicamentos com a data de validade superior a 3 meses. Verifique a validade antes de prosseguir com a doação."
      />

      <MedicationWarningDialog
        isOpen={showMedicationDateError}
        onClose={() => setShowMedicationDateError(false)}
        title={errorMessage === "É necessário adicionar pelo menos uma imagem para fazer a doação." 
              ? "Falta de Imagem" 
              : (formValues.category === "Medicamentos e utensílios" ? "Erro na data de validade" : "Data de validade vencida")}
        message={errorMessage}
      />

      <ConfirmDialog 
       open={confirmOpen} 
       onClose={closeConfirmDialog} 
       onConfirm={finalizeDonation} 
      /> 

      <Header />
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Checkout</h2>

        <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-lg font-medium text-gray-900">Anuncie Mantimentos</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Preencha as informações abaixo para anunciar mantimentos.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900">
                Categoria
              </label>
              <div className="mt-2">
                <select
                  id="category"
                  name="category"
                  value={formValues.category}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:max-w-md sm:text-sm sm:leading-6"
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Itens de cesta básica">Itens de cesta básica</option>
                  <option value="Itens de higiene pessoal">Itens de higiene pessoal</option>
                  <option value="Medicamentos e utensílios">Medicamentos e utensílios</option>
                  <option value="Roupas e Calçados">Roupas e Calçados</option>
                  <option value="Cobertores e roupa de cama">Cobertores e roupa de cama</option>
                  <option value="Fraldas infantis e geriátricas">Fraldas infantis e geriátricas</option>
                  <option value="Eletrodomésticos e Móveis">Eletrodomésticos e Móveis</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="quantity" className="block text-sm font-medium leading-6 text-gray-900">
                Quantidade
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="quantity"
                  id="quantity"
                  value={formValues.quantity}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                  placeholder="Informe a quantidade de itens"
                  
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="presentation" className="block text-sm font-medium leading-6 text-gray-900">
                Apresentação
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="presentation"
                  id="presentation"
                  value={formValues.presentation}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                  placeholder="Descreva o estado do item"
                  title="Informe como os itens estão embalados ou apresentados. Ex: em caixas, sacolas, soltos, novo, usado e etc."
                />
              </div>
            </div>

            {showBatch && (
            <div className="sm:col-span-3">
              <label htmlFor="batch" className="block text-sm font-medium leading-6 text-gray-900">
                Lote
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="batch"
                  id="batch"
                  value={formValues.batch}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                  placeholder="Informe o lote da embalagem"
                  title="Informe o número de lote da embalagem"
                />
              </div>
            </div>
             )}

          {showExpirationDate && (
            <div className="sm:col-span-3">
              <label htmlFor="expirationDate" className="block text-sm font-medium leading-6 text-gray-900">
                Data de Validade
              </label>
              <div className="mt-2">
                <input
                  type="date"
                  name="expirationDate"
                  id="expirationDate"
                  value={formValues.expirationDate}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          )}

          {formValues.category === "Fraldas infantis e geriátricas" && (
            <>
              <div className="sm:col-span-4">
                <h2 className="block text-sm font-medium leading-6 text-gray-900">Tipo de Fralda</h2>
                <fieldset className="mt-4">
                  <legend className="sr-only">Tipo de Fralda</legend>
                  <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                    {['Infantil', 'Geriatrica'].map((fraldaType, idx) => (
                      <div key={fraldaType} className="flex items-center">
                        <input
                          id={fraldaType}
                          name="fralda-type"
                          type="radio"
                          checked={formValues.type === fraldaType}
                          onChange={() => setFormValues({...formValues, type: fraldaType})}
                          className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                        />
                        <label htmlFor={fraldaType} className="ml-3 block text-sm font-medium text-gray-700">
                          {fraldaType}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="sizes" className="block text-sm font-medium leading-6 text-gray-900">
                  Tamanhos
                </label>
                <div className="mt-2">
                  <select
                    id="sizes"
                    name="sizes"
                    value={formValues.sizes}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                  >
                    <option value="">Selecione um tamanho</option>
                    {formValues.type === 'Infantil' ? 
                      ['RN', 'XP/PP/RN+', 'P', 'M', 'G', 'GG/XG', 'XXG'].map(size => <option key={size} value={size}>{size}</option>) : 
                      ['P', 'M', 'G', 'EG'].map(size => <option key={size} value={size}>{size}</option>)
                    }
                  </select>
                </div>
              </div>
            </>
          )}


        {formValues.category === "Roupas e Calçados" && (
          <>
            <div className="sm:col-span-4">
              <h2 className="block text-sm font-medium leading-6 text-gray-900">Tipo de Item</h2>
              <fieldset className="mt-4">
                <legend className="sr-only">Tipo de Item</legend>
                <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                  {['Roupa', 'Calçado'].map((itemType, idx) => (
                    <div key={itemType} className="flex items-center">
                      <input
                        id={itemType}
                        name="item-type"
                        type="radio"
                        checked={formValues.type === itemType}
                        onChange={() => setFormValues({...formValues, type: itemType})}
                        className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <label htmlFor={itemType} className="ml-3 block text-sm font-medium text-gray-700">
                        {itemType}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="sizes" className="block text-sm font-medium leading-6 text-gray-900">
                Tamanhos
              </label>
              <div className="mt-2">
                <select
                  id="sizes"
                  name="sizes"
                  value={formValues.sizes}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                >
                  <option value="">Selecione um tamanho</option>
                  {formValues.type === 'Roupa' ? ['PP','P', 'M', 'G', 'GG', 'XG'].map(size => <option key={size} value={size}>{size}</option>) : ['13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']
.map(size => <option key={size} value={size}>{size}</option>)}
                </select>
              </div>
            </div>
          </>
        )}

        {formValues.category === "Cobertores e roupa de cama" && (
          <div className="sm:col-span-3">
            <label htmlFor="sizes" className="block text-sm font-medium leading-6 text-gray-900">
              Tamanhos
            </label>
            <div className="mt-2">
              <select
                id="sizes"
                name="sizes"
                value={formValues.sizes}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
              >
                <option value="">Selecione um tamanho</option>
                <option value="cama queen">Cama Queen</option>
                <option value="cama casal">Cama Casal</option>
                <option value="cama solteiro">Cama Solteiro</option>
              </select>
            </div>
          </div>
        )}

            <div className="col-span-full">
              <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                Título
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formValues.title}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                  placeholder="Informe um título para a doação"
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
                  rows={3}
                  value={formValues.description}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                  placeholder="Descreva os itens doados"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="photos" className="block text-sm font-medium text-gray-900">
                Fotos dos itens
              </label>
              <div className="mt-2 flex flex-col items-center rounded-lg border border-dashed border-gray-900/25 p-6">
                <div className="flex flex-wrap gap-2 justify-center">
                  {imageFiles.map((image, index) => (
                    <div key={index} className="relative">
                      <img src={image.url} alt={`Preview ${index + 1}`} className="w-24 h-24 rounded-md object-cover" />
                      <button
                        onClick={() => removeImage(index)}
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

        
        {/* Order summary */}
        <div className="mt-10 lg:mt-0">
          <h2 className="text-lg font-medium text-gray-900">Seus itens:</h2>
          <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
            <h3 className="sr-only">Items in your donation cart</h3>
            {items.length > 0 ? (
              <ul role="list" className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <li key={index} className="flex px-4 py-6 sm:px-6">
                    {item.photos && item.photos.length > 0 && (
                      <div className="flex-shrink-0">
                        <img src={item.photos[0]} alt="Preview of donation" className="w-20 h-20 rounded-md object-cover" />
                      </div>
                    )}
                    <div className="ml-6 flex flex-1 flex-col">
                      <div className="flex">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium text-gray-700">{item.category}</h4>
                          <p className="mt-1 text-sm text-gray-500">Quantidade: {item.quantity}</p>
                          {item.type && <p className="mt-1 text-sm text-gray-500">Tipo: {item.type}</p>}
                          {item.sizes && <p className="mt-1 text-sm text-gray-500">Tamanho: {item.sizes}</p>}
                        </div>
                        <div className="ml-4 flow-root flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = items.filter((_, i) => i !== index);
                              setItems(newItems);
                            }}
                            className="-m-2.5 flex items-center justify-center bg-white p-2.5 text-gray-400 hover:text-gray-500"
                          >
                            <span className="sr-only">Remove</span>
                            <TrashIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 sm:px-6">
                <p>Ainda não foi adicionada nenhuma doação.</p>
              </div>
            )}

            <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
              <button
                type="submit"
                className="w-full rounded-md border border-transparent bg-red-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-50"
              >
                Anunciar doação
              </button>
              {items.length > 0 && (
              <button
                type="button"
                onClick={openConfirmDialog} // Continua abrindo o ConfirmDialog
                className="mt-4 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-50"
              >
                Finalizar agora
              </button>
              )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
