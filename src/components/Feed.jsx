'use client'

import { Fragment, useState } from 'react'
import { Dialog, Disclosure, Transition } from '@headlessui/react'
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/20/solid'
import FeedDonations from './FeedDonations'

const filters = [
  {
    id: 'category',
    name: 'Categoria',
    options: [
      { value: 'Itens de cesta básica', label: 'Itens de cesta básica' },
      { value: 'Itens de higiene pessoal', label: 'Itens de higiene pessoal' },
      { value: 'Medicamentos e utensílios', label: 'Medicamentos e utensílios' },
      { value: 'Roupas e Calçados', label: 'Roupas e Calçados' },
      { value: 'Cobertores e roupa de cama', label: 'Cobertores e roupa de cama' },
      { value: 'Fraldas infantis e geriátricas', label: 'Fraldas infantis e geriátricas' },
      { value: 'Eletrodomésticos e Móveis', label: 'Eletrodomésticos e Móveis' },
    ],
  },
  {
    id: 'sizesfraldas',
    name: 'Tamanhos de fraldas',
    options: [
      { value: 'RN', label: 'RN' },
      { value: 'XP/PP/RN+', label: 'XP/PP/RN+' },
      { value: 'P', label: 'P' },
      { value: 'M', label: 'M' },
      { value: 'G', label: 'G' },
      { value: 'GG/XG', label: 'GG/XG' },
      { value: 'XXG', label: 'XXG' },
      { value: 'EG', label: 'EG' }
    ]
  },
  {
    id: 'sizesroupas',
    name: 'Tamanhos de roupas',
    options: [
      { value: 'PP', label: 'PP' },
      { value: 'P', label: 'P' },
      { value: 'M', label: 'M' },
      { value: 'G', label: 'G' },
      { value: 'GG', label: 'GG' },
      { value: 'XG', label: 'XG' },
    ],
  },
  {
    id: 'sizescalçados',
    name: 'Tamanhos de calçados',
    options: [
      { value: '13', label: '13' },
      { value: '14', label: '14' },
      { value: '15', label: '15' },
      { value: '16', label: '16' },
      { value: '17', label: '17' },
      { value: '18', label: '18' },
      { value: '19', label: '19' },
      { value: '20', label: '20' },
      { value: '21', label: '21' },
      { value: '22', label: '22' },
      { value: '23', label: '23' },
      { value: '24', label: '24' },
      { value: '25', label: '25' },
      { value: '26', label: '26' },
      { value: '27', label: '27' },
      { value: '28', label: '28' },
      { value: '29', label: '29' },
      { value: '30', label: '30' },
      { value: '31', label: '31' },
      { value: '32', label: '32' },
      { value: '33', label: '33' },
      { value: '34', label: '34' },
      { value: '35', label: '35' },
      { value: '36', label: '36' },
      { value: '37', label: '37' },
      { value: '38', label: '38' },
      { value: '39', label: '39' },
      { value: '40', label: '40' },
      { value: '41', label: '41' },
      { value: '42', label: '42' },
      { value: '43', label: '43' },
      { value: '44', label: '44' },
      { value: '45', label: '45' },
      { value: '46', label: '46' }
    ]
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Feed() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    category: [],
    sizesfraldas: [],
    sizesroupas: [],
    sizescalçados: []
  })
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (sectionId, value) => {
    setSelectedFilters((prevState) => {
      const currentFilters = prevState[sectionId];
      const isSelected = currentFilters.includes(value);

      if (isSelected) {
        return {
          ...prevState,
          [sectionId]: currentFilters.filter((filterValue) => filterValue !== value),
        };
      } else {
        return {
          ...prevState,
          [sectionId]: [...currentFilters, value],
        };
      }
    });
  }

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  }

  return (
    <div className="bg-white">
      <div>
        <Transition.Root show={mobileFiltersOpen} as={Fragment}>
          <Dialog className="relative z-40 lg:hidden" onClose={setMobileFiltersOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-6 shadow-xl">
                  <div className="flex items-center justify-between px-4">
                    <h2 className="text-lg font-medium text-gray-900">Filtros</h2>
                    <button
                      type="button"
                      className="-mr-2 flex h-10 w-10 items-center justify-center p-2 text-gray-400 hover:text-gray-500"
                      onClick={() => setMobileFiltersOpen(false)}
                    >
                      <span className="sr-only">Close menu</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  <form className="mt-4">
                    {filters.map((section) => (
                      <Disclosure as="div" key={section.name} className="border-t border-gray-200 pb-4 pt-4">
                        {({ open }) => (
                          <fieldset>
                            <legend className="w-full px-2">
                              <Disclosure.Button className="flex w-full items-center justify-between p-2 text-gray-400 hover:text-gray-500">
                                <span className="text-sm font-medium text-gray-900">{section.name}</span>
                                <span className="ml-6 flex h-7 items-center">
                                  <ChevronDownIcon
                                    className={classNames(open ? '-rotate-180' : 'rotate-0', 'h-5 w-5 transform')}
                                    aria-hidden="true"
                                  />
                                </span>
                              </Disclosure.Button>
                            </legend>
                            <Disclosure.Panel className="px-4 pb-2 pt-4">
                              <div className="space-y-6">
                                {section.options.map((option, optionIdx) => (
                                  <div key={option.value} className="flex items-center">
                                    <input
                                      id={`${section.id}-${optionIdx}-mobile`}
                                      name={`${section.id}[]`}
                                      defaultValue={option.value}
                                      type="checkbox"
                                      onChange={() => handleFilterChange(section.id, option.value)}
                                      className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    />
                                    <label
                                      htmlFor={`${section.id}-${optionIdx}-mobile`}
                                      className="ml-3 text-sm text-gray-500"
                                    >
                                      {option.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </Disclosure.Panel>
                          </fieldset>
                        )}
                      </Disclosure>
                    ))}
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        <main className="mx-auto max-w-2xl px-4 lg:max-w-7xl lg:px-8">
          <div className="border-b border-gray-200 pb-10 pt-16">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Mantimentos</h1>
            <p className="mt-4 text-base text-gray-500">
              Selecione os mantimentos que você precisa e entre em contato com o doador!
            </p>
          </div>

          <div className="pb-24 pt-12 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
            <aside>
              <h2 className="sr-only">Filtros</h2>

              <button
                type="button"
                className="inline-flex items-center lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <span className="text-sm font-medium text-gray-700">Filtros</span>
                <PlusIcon className="ml-1 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              </button>

              <div className="hidden lg:block">
                <form className="space-y-10 divide-y divide-gray-200">
                  {filters.map((section, sectionIdx) => (
                    <div key={section.name} className={sectionIdx === 0 ? null : 'pt-10'}>
                      <fieldset>
                        <legend className="block text-sm font-medium text-gray-900">{section.name}</legend>
                        <div className="space-y-3 pt-6">
                          {section.options.map((option, optionIdx) => (
                            <div key={option.value} className="flex items-center">
                              <input
                                id={`${section.id}-${optionIdx}`}
                                name={`${section.id}[]`}
                                defaultValue={option.value}
                                type="checkbox"
                                onChange={() => handleFilterChange(section.id, option.value)}
                                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                              />
                              <label htmlFor={`${section.id}-${optionIdx}`} className="ml-3 text-sm text-gray-600">
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </fieldset>
                    </div>
                  ))}
                </form>
              </div>
            </aside>

            <div className="mt-6 lg:col-span-2 lg:mt-0 xl:col-span-3">
              <div className="relative mb-4">
                
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Pesquisar doações"
                  className="w-full p-2 pl-10 rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600"
                />
              </div>

              <FeedDonations selectedFilters={selectedFilters} searchQuery={searchQuery} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
