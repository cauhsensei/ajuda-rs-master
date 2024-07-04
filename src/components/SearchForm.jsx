import React, { useState } from 'react';

export default function SearchForm({ setSearchLocation }) {
  const [address, setAddress] = useState('');

  const handleChange = (e) => {
    setAddress(e.target.value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (address) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        console.log('Geocode data:', data); // Debug log
        if (data.results && data.results[0]) {
          const location = data.results[0].geometry.location;
          setSearchLocation(location);
        } else {
          alert('Endereço não encontrado!');
        }
      } catch (error) {
        console.error('Error fetching geocode data: ', error);
        alert('Erro ao buscar o endereço!');
      }
    }
  };

  return (
    <form onSubmit={handleSearch} className="mb-4">
      <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">
        Informe o endereço
      </label>
      <div className="mt-2 flex">
        <input
          type="text"
          id="address"
          name="address"
          value={address}
          onChange={handleChange}
          className="flex-grow rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
          placeholder="Digite o endereço ou cidade"
        />
        <button
          type="submit"
          className="ml-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
