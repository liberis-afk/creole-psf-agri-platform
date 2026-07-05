"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export type ParcelMarker = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function ParcelMap({
  markers,
  center,
  pickedPosition,
  onPick,
  className,
}: {
  markers: ParcelMarker[];
  center?: [number, number];
  pickedPosition?: [number, number] | null;
  onPick?: (lat: number, lng: number) => void;
  className?: string;
}) {
  const defaultCenter: [number, number] =
    center ?? (markers[0] ? [markers[0].latitude, markers[0].longitude] : [18.9712, -72.2852]);

  return (
    <div className={className}>
      <MapContainer
        center={defaultCenter}
        zoom={markers.length || pickedPosition ? 12 : 8}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {onPick && <ClickHandler onPick={onPick} />}
        {markers.map((m) => (
          <Marker key={m.id} position={[m.latitude, m.longitude]} icon={markerIcon}>
            <Popup>{m.name}</Popup>
          </Marker>
        ))}
        {pickedPosition && (
          <Marker position={pickedPosition} icon={markerIcon}>
            <Popup>Nouvelle parcelle</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
