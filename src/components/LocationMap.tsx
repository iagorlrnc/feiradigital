import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;


// Custom User Icon
const userIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #10B981; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(16,185,129,0.5); display: flex; items-center; justify-content: center; color: white;"><div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const FAIR_COORDS: [number, number] = [
  Number(import.meta.env.VITE_FAIR_LAT),
  Number(import.meta.env.VITE_FAIR_LNG)
];

const MAP_TILE_URL = import.meta.env.VITE_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LocationMap() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(FAIR_COORDS);
  const [loading, setLoading] = useState(false);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-gray-200 shadow-inner group">
      <MapContainer 
        center={FAIR_COORDS} 
        zoom={19} 
        maxZoom={22}
        className="w-full h-full z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={MAP_TILE_URL}
          maxZoom={22}
          maxNativeZoom={19}
        />
        
        <ChangeView center={mapCenter} />


        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-green-600">Sua Localização</h3>
                <p className="text-xs text-gray-600 mt-1">Tempo Real</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Map Controls Overlay */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-3">
        <button
          onClick={handleLocateMe}
          disabled={loading}
          className="bg-white hover:bg-gray-50 text-gray-800 p-4 rounded-2xl shadow-2xl border border-gray-100 transition-all active:scale-95 flex items-center gap-3 group/btn"
        >
          <Navigation className={`w-5 h-5 ${loading ? 'animate-pulse text-palmas-blue' : 'text-gray-600 group-hover/btn:text-palmas-blue'}`} />
          <span className="text-sm font-bold pr-2">{loading ? 'Localizando...' : 'Onde estou?'}</span>
        </button>

        <button
          onClick={() => setMapCenter(FAIR_COORDS)}
          className="bg-white hover:bg-gray-50 text-gray-800 p-4 rounded-2xl shadow-2xl border border-gray-100 transition-all active:scale-95 flex items-center gap-3 group/btn"
        >
          <MapPin className="w-5 h-5 text-gray-600 group-hover/btn:text-palmas-blue" />
          <span className="text-sm font-bold pr-2">Ver Feira</span>
        </button>
      </div>

      <div className="absolute top-6 left-6 z-[1000]">
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Mapa em Tempo Real</span>
        </div>
      </div>
    </div>
  );
}
