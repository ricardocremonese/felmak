import { MapContainer, TileLayer } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

export default function MapaInterativo() {
  useEffect(() => {
    console.log('Mapa carregado!');
  }, []);

  return (
    <MapContainer
      center={[-22.9099, -47.0626]} // Região de Campinas-SP
      zoom={15}
      scrollWheelZoom={true}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
    </MapContainer>
  );
}