'use client'

// components/Map.js
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const mapOptions = {
  mapId: 'ca23c2661d065b79',  
};

function MyMap({ setLocation }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ['marker'],
  });

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [markerPosition, setMarkerPosition] = useState({ lat: -3.745, lng: -38.523 });

  const createMarker = (position) => {
    const { AdvancedMarkerElement } = google.maps.marker;
    const marker = new AdvancedMarkerElement({
      map: mapRef.current,
      position,
      title: 'Você está aqui',
    });
    return marker;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setMarkerPosition(newPos);
        setLocation(newPos);
        if (mapRef.current) {
          if (markerRef.current) {
            markerRef.current.setMap(null);
          }
          markerRef.current = createMarker(newPos);
          mapRef.current.panTo(newPos);
        }

        // Atualizar o endereço
        const geocodeLatLng = async () => {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${newPos.lat},${newPos.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();
          if (data.results && data.results[0]) {
            setLocation({
              lat: newPos.lat,
              lng: newPos.lng,
              address: data.results[0].formatted_address,
            });
          }
        };
        geocodeLatLng();
      });
    }
  }, [setLocation]);

  const handleMapClick = async (event) => {
    const newPos = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setMarkerPosition(newPos);
    setLocation(newPos);
    if (mapRef.current) {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      markerRef.current = createMarker(newPos);
      mapRef.current.panTo(newPos);
    }

    // Atualizar o endereço
    const geocodeLatLng = async () => {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${newPos.lat},${newPos.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results[0]) {
        setLocation({
          lat: newPos.lat,
          lng: newPos.lng,
          address: data.results[0].formatted_address,
        });
      }
    };
    geocodeLatLng();
  };

  const onLoad = useCallback(function callback(map) {
    mapRef.current = map;
    markerRef.current = createMarker(markerPosition);

    // Adicionar evento de clique no mapa
    map.addListener('click', handleMapClick);
  }, [markerPosition]);

  const onUnmount = useCallback(function callback(map) {
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    mapRef.current = null;
  }, []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={markerPosition}
      zoom={10}
      options={mapOptions}  // Adiciona o Map ID aqui
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}  // Adiciona o evento de clique no mapa
    />
  ) : (
    <></>
  );
}

export default React.memo(MyMap);
