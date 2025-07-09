import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchLogs } from '../api'; // Import API client
import type { Log } from '../types';
import { Globe2 } from 'lucide-react';

interface AttackLocation {
  ip: string;
  lat: number;
  lng: number;
  count: number;
  events: Log[];
}

// Temporary mock GeoIP data - to be replaced with MaxMind GeoIP lookup later
const mockGeoIP: Record<string, { lat: number; lng: number }> = {
  '192.168.1.100': { lat: 40.7128, lng: -74.0060 }, // New York
  '10.0.0.50': { lat: 51.5074, lng: -0.1278 }, // London
  '203.0.113.45': { lat: 35.6762, lng: 139.6503 }, // Tokyo
  '1.179.185.50': { lat: 13.7563, lng: 100.5018 }, // Bangkok (from your logs)
};

export function AttackMap() {
  const [attackLocations, setAttackLocations] = useState<AttackLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setError(null);
        const logs = await fetchLogs();
        const locationMap = new Map<string, AttackLocation>();

        logs.forEach(log => {
          const geoData = mockGeoIP[log.sourceIP];
          if (geoData) {
            const existing = locationMap.get(log.sourceIP);
            if (existing) {
              existing.count++;
              existing.events.push(log);
            } else {
              locationMap.set(log.sourceIP, {
                ip: log.sourceIP,
                lat: geoData.lat,
                lng: geoData.lng,
                count: 1,
                events: [log],
              });
            }
          }
        });

        setAttackLocations(Array.from(locationMap.values()));
      } catch (err) {
        console.error('Failed to fetch logs:', err);
        setError('Could not load attack locations.');
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const getMarkerSize = (count: number) => {
    const baseSize = 8;
    const scale = Math.log(count + 1) * 2;
    return baseSize + scale;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Globe2 className="w-6 h-6 text-cyan-500 mr-3" />
          <h2 className="text-xl font-bold">Attack Origins</h2>
        </div>
        <div className="text-gray-400">Loading attack map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Globe2 className="w-6 h-6 text-cyan-500 mr-3" />
          <h2 className="text-xl font-bold">Attack Origins</h2>
        </div>
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <Globe2 className="w-6 h-6 text-cyan-500 mr-3" />
        <h2 className="text-xl font-bold">Attack Origins</h2>
      </div>
      
      <div className="h-[400px] rounded-lg overflow-hidden border border-gray-700">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          className="bg-gray-900"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {attackLocations.map((location) => (
            <CircleMarker
              key={location.ip}
              center={[location.lat, location.lng]}
              radius={getMarkerSize(location.count)}
              fillColor="#ef4444"
              color="#991b1b"
              weight={1}
              opacity={0.8}
              fillOpacity={0.6}
            >
              <Popup className="bg-gray-800 text-white border-gray-700">
                <div className="p-2">
                  <h3 className="font-bold mb-2">IP: {location.ip}</h3>
                  <p className="text-sm mb-2">Attacks: {location.count}</p>
                  <div className="max-h-32 overflow-y-auto">
                    {location.events.map((event, index) => (
                      <div
                        key={index}
                        className="text-xs border-t border-gray-700 pt-2 mt-2"
                      >
                        <p className="text-gray-400">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                        <p className="text-cyan-500">{event.event}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
