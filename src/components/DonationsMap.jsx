'use client';

import { useEffect, useState, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { db } from '@/firebase/firebaseConfig';

const Map = () => {
  const [currentPosition, setCurrentPosition] = useState({ lat: -25.4541824, lng: -49.0733568 });
  const [donations, setDonations] = useState([]);
  const [searchLocation, setSearchLocation] = useState('');
  const mapRef = useRef(null);
  const infoWindowRef = useRef(null); // Use ref to store infoWindow
  const router = useRouter(); // Add router for navigation

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  };

  const fetchDonations = async () => {
    const donationsRef = collection(db, "donations");
    const q = query(donationsRef, where("category", "==", "Roupas e Calçados"));
    const querySnapshot = await getDocs(q);

    const donationsData = await Promise.all(querySnapshot.docs.map(async donationDoc => {
      const donation = donationDoc.data();
      const userDocRef = doc(db, "users", donation.userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          ...donation,
          id: donationDoc.id, // Add donation ID for navigation
          lat: userData.lat,
          lng: userData.lng
        };
      } else {
        return null;
      }
    }));

    setDonations(donationsData.filter(donation => donation !== null));
  };

  const geocodeByAddress = async (address) => {
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK') {
          const { lat, lng } = results[0].geometry.location;
          resolve({ lat: lat(), lng: lng });
        } else {
          reject(new Error(`Geocode was not successful for the following reason: ${status}`));
        }
      });
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const location = await geocodeByAddress(searchLocation);
      setCurrentPosition({
        lat: location.lat,
        lng: location.lng,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const initializeMap = async () => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
    });

    await loader.load();
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    mapRef.current = new Map(document.getElementById('map'), {
      center: currentPosition,
      zoom: 10,
      mapId: "YOUR_MAP_ID", // Use seu próprio mapId aqui
    });

    const infoWindow = new InfoWindow();
    infoWindowRef.current = infoWindow; // Store infoWindow in ref

    // Agrupar doações por localização
    const groupedDonations = donations.reduce((acc, donation) => {
      const key = `${donation.lat},${donation.lng}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(donation);
      return acc;
    }, {});

    Object.keys(groupedDonations).forEach((key, i) => {
      const [lat, lng] = key.split(',').map(Number);
      const pin = new PinElement({
        glyph: `${i + 1}`,
        scale: 1.5,
      });
      const marker = new AdvancedMarkerElement({
        position: { lat, lng },
        map: mapRef.current,
        title: `Donation Location ${i + 1}`,
        content: pin.element,
        gmpClickable: true,
      });

      marker.addListener("click", ({ domEvent, latLng }) => {
        const donationsAtLocation = groupedDonations[key];
        const contentString = donationsAtLocation.map(donation => `
          <div>
            <div style="display: flex; align-items: center;">
              <img src="${donation.photos[0]}" alt="${donation.title}" style="width: 50px; height: 50px; border-radius: 50%; margin-right: 10px;">
              <div>
                <h3 style="margin-bottom: 5px;"><strong>${donation.title}</strong></h3>
                <p style="margin-bottom: 5px;"><strong>Categoria:</strong> ${donation.category}</p>
                <p style="margin-bottom: 5px;"><strong>Quantidade:</strong> ${donation.quantity}</p>
                <p style="margin-bottom: 5px;"><strong>Descrição:</strong> ${donation.description}</p>
                <button onclick="window.location.href='/donation/${donation.id}'" style="color: blue; text-decoration: underline; cursor: pointer;">Ver mais detalhes</button>
              </div>
            </div>
          </div>
        `).join('<hr>');

        infoWindow.close();
        infoWindow.setContent(contentString);
        infoWindow.open(marker.map, marker);
      });
    });
  };

  useEffect(() => {
    getCurrentLocation();
    fetchDonations();
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setCenter(currentPosition);
    } else {
      initializeMap();
    }
  }, [currentPosition]);

  useEffect(() => {
    if (mapRef.current) {
      const infoWindow = infoWindowRef.current; // Get infoWindow from ref
      donations.forEach((donation, i) => {
        const pin = new google.maps.marker.PinElement({
          glyph: `${i + 1}`,
          scale: 1.5,
        });
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: donation.lat, lng: donation.lng },
          map: mapRef.current,
          title: `${i + 1}. ${donation.title}`,
          content: pin.element,
          gmpClickable: true,
        });

        marker.addListener("click", ({ domEvent, latLng }) => {
          const donationsAtLocation = donations.filter(d => d.lat === donation.lat && d.lng === donation.lng);
          const contentString = donationsAtLocation.map(d => `
            <div>
              <div style="display: flex; align-items: center;">
                <img src="${d.photos[0]}" alt="${d.title}" style="width: 50px; height: 50px; border-radius: 50%; margin-right: 10px;">
                <div>
                  <h3 style="margin-bottom: 5px;"><strong>${d.title}</strong></h3>
                  <p style="margin-bottom: 5px;"><strong>Categoria:</strong> ${d.category}</p>
                  <p style="margin-bottom: 5px;"><strong>Quantidade:</strong> ${d.quantity}</p>
                  <p style="margin-bottom: 5px;"><strong>Descrição:</strong> ${d.description}</p>
                  <button onclick="window.location.href='/donation/${d.id}'" style="color: blue; text-decoration: underline; cursor: pointer;">Ver mais detalhes</button>
                </div>
              </div>
            </div>
          `).join('<hr>');

          infoWindow.close();
          infoWindow.setContent(contentString);
          infoWindow.open(marker.map, marker);
        });
      });
    }
  }, [donations]);

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="mb-4 flex w-full">
        <input
          type="text"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          placeholder="Digite o endereço ou cidade"
          className="flex-grow rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
        />
        <button 
          type="submit" 
          className="ml-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
           Faça uma busca
        </button>
      </form>
      <div id="map" style={{ width: '100%', height: '500px' }}></div>
    </div>
  );
};

export default Map;
