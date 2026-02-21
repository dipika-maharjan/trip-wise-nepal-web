import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

// Fix default icon for Leaflet markers
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function MapSection({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const mapCenter: LatLngExpression = [lat, lng];
  return (
    <MapContainer
      center={mapCenter}
      zoom={15}
      style={{ height: "400px", width: "100%", marginBottom: "1rem" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={mapCenter}>
        <Popup>{name}</Popup>
      </Marker>
    </MapContainer>
  );
}
