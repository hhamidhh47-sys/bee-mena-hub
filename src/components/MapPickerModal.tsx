import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Check } from "lucide-react";

interface MapPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectLocation: (location: { name: string; lat: number; lng: number; country: string }) => void;
  initialLat?: number;
  initialLng?: number;
}

const MapPickerModal = ({ open, onOpenChange, onSelectLocation, initialLat = 24.7, initialLng = 46.7 }: MapPickerModalProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [placeName, setPlaceName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !mapRef.current) return;

    const timer = setTimeout(() => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }

      const map = L.map(mapRef.current!, { zoomControl: true }).setView([initialLat, initialLng], 6);
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      map.on("click", async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setPickedCoords({ lat, lng });

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }

        // Reverse geocode
        setLoading(true);
        setPlaceName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`
          );
          const data = await res.json();
          const addr = data.address;
          const name = addr?.city || addr?.town || addr?.village || addr?.county || addr?.state || data.display_name?.split(",")[0] || "";
          setPlaceName(name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } catch {
          // keep coordinate name
        } finally {
          setLoading(false);
        }
      });

      setTimeout(() => map.invalidateSize(), 100);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
    };
  }, [open, initialLat, initialLng]);

  const handleConfirm = () => {
    if (!pickedCoords) return;
    onSelectLocation({
      name: placeName || `${pickedCoords.lat.toFixed(4)}, ${pickedCoords.lng.toFixed(4)}`,
      lat: pickedCoords.lat,
      lng: pickedCoords.lng,
      country: "",
    });
    setPickedCoords(null);
    setPlaceName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden" style={{ zIndex: 2000 }}>
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <MapPin className="w-5 h-5 text-primary" />
            اختر موقعاً من الخريطة
          </DialogTitle>
        </DialogHeader>
        <div ref={mapRef} className="w-full h-[350px]" />
        {pickedCoords && (
          <div className="p-4 pt-2 flex items-center justify-between gap-3 border-t border-border">
            <div className="text-sm truncate">
              <span className="font-medium">{loading ? "جارٍ تحديد الموقع..." : placeName}</span>
            </div>
            <Button onClick={handleConfirm} size="sm" className="shrink-0 gap-1">
              <Check className="w-4 h-4" />
              تأكيد
            </Button>
          </div>
        )}
        {!pickedCoords && (
          <div className="p-4 pt-2 text-center text-sm text-muted-foreground border-t border-border">
            انقر على الخريطة لاختيار موقع
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MapPickerModal;
