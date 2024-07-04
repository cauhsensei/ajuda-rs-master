import { useState } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, PlusCircleIcon } from '@heroicons/react/20/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const ImagePreviewDialog = ({ isOpen, onClose, onSend }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (selectedFiles.length + files.length <= 4) {
      setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    } else {
      alert('Você pode selecionar no máximo 4 imagens.');
    }
  };

  const handleRemoveImage = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    onSend(selectedFiles);
    onClose();
    setSelectedFiles([]);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center">
                  Pré-visualizar Imagens
                  <button onClick={onClose}>
                    <XMarkIcon className="h-6 w-6 text-gray-500" />
                  </button>
                </Dialog.Title>
                
                <div className="mt-2">
                  <Tab.Group as="div" className="flex flex-col-reverse">
                    <div className="mx-auto mt-6 hidden w-full max-w-lg sm:block lg:max-w-none">
                      <Tab.List className="grid grid-cols-4 gap-4">
                        {selectedFiles.map((file, index) => (
                          <Tab
                            key={index}
                            className="relative flex h-20 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4"
                          >
                            {({ selected }) => (
                              <>
                                <span className="sr-only">Imagem {index + 1}</span>
                                <span className="absolute inset-0 overflow-hidden rounded-md">
                                  <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover object-center" />
                                </span>
                                <button
                                  type="button"
                                  className="absolute top-0 right-0 m-1 bg-white rounded-full p-1 shadow"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage(index);
                                  }}
                                >
                                  <XMarkIcon className="h-4 w-4 text-gray-500" />
                                </button>
                                <span
                                  className={classNames(
                                    selected ? 'ring-indigo-500' : 'ring-transparent',
                                    'pointer-events-none absolute inset-0 rounded-md ring-2 ring-offset-2'
                                  )}
                                  aria-hidden="true"
                                />
                              </>
                            )}
                          </Tab>
                        ))}
                      </Tab.List>
                    </div>

                    <Tab.Panels className="aspect-h-1 aspect-w-1 w-full">
                      {selectedFiles.map((file, index) => (
                        <Tab.Panel key={index} className="flex justify-center items-center">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="max-h-80 w-auto object-cover object-center sm:rounded-lg"
                          />
                        </Tab.Panel>
                      ))}
                    </Tab.Panels>
                  </Tab.Group>
                </div>

                <div className="mt-4">
                  <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="flex items-center mt-4 cursor-pointer justify-center">
                  <PlusCircleIcon className="w-6 h-6 text-gray-600 mr-2" />
                  <span className="text-gray-600">Adicionar imagens</span>
                  </label>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    onClick={handleSend}
                  >
                    Enviar
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ImagePreviewDialog;
