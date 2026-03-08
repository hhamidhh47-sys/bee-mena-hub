import { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Plus, Navigation, Trash2 } from "lucide-react";
import { useHives } from "@/hooks/useDatabase";
import { db } from "@/lib/db";
import { toast } from "@/hooks/use-toast";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface ApiaryLocation {
  id?: number;
  name: string;
  lat: number;
  lng: number;
}

const MapPage = () => {
  const hives = useHives() ?? [];
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [locations, setLocations] = useState<ApiaryLocation[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [clickedLatLng, setClickedLatLng] = useState<{ lat: number; lng: number } | null>(null);

  // Load locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("nahali-apiary-locations");
    if (saved) setLocations(JSON.parse(saved));
  }, []);

  // Save locations
  useEffect(() => {
    localStorage.setItem("nahali-apiary-locations", JSON.stringify(locations));
  }, [locations]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([24.7136, 46.6753], 6); // Saudi Arabia center
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      setClickedLatLng({ lat: e.latlng.lat, lng: e.latlng.lng });
      setDialogOpen(true);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    const beeIcon = L.divIcon({
      html: `<div style="font-size:28px;text-align:center;">🐝</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: "",
    });

    locations.forEach((loc) => {
      const hivesAtLocation = hives.filter(h => h.location === loc.name);
      L.marker([loc.lat, loc.lng], { icon: beeIcon })
        .addTo(map)
        .bindPopup(`
          <div style="text-align:right;font-family:Tajawal;min-width:150px;">
            <strong>📍 ${loc.name}</strong><br/>
            <span>🐝 ${hivesAtLocation.length} خلية</span><br/>
            <small>${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}</small>
          </div>
        `);
    });
  }, [locations, hives]);

  const handleAddLocation = () => {
    if (!newName.trim() || !clickedLatLng) return;
    setLocations(prev => [...prev, { id: Date.now(), name: newName.trim(), ...clickedLatLng }]);
    setNewName("");
    setClickedLatLng(null);
    setDialogOpen(false);
    toast({ title: "تمت إضافة الموقع بنجاح 📍" });
  };

  const handleLocateMe = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapInstance.current?.setView([pos.coords.latitude, pos.coords.longitude], 12);
      },
      () => toast({ title: "لم نتمكن من تحديد موقعك", variant: "destructive" })
    );
  };

  const removeLocation = (id: number) => {
    setLocations(prev => prev.filter(l => l.id !== id));
    toast({ title: "تم حذف الموقع" });
  };

  return (
    <AppLayout title="خريطة المناحل">
      {/* Map */}
      <div className="relative rounded-2xl overflow-hidden border border-border mb-6" style={{ height: "50vh" }}>
        <div ref={mapRef} className="w-full h-full" />
        <Button
          onClick={handleLocateMe}
          size="icon"
          className="absolute bottom-4 left-4 z-[1000] rounded-full shadow-lg bg-card text-foreground hover:bg-muted"
        >
          <Navigation className="w-5 h-5" />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4 text-center">اضغط على الخريطة لإضافة موقع منحل جديد</p>

      {/* Locations List */}
      <section>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          مواقع المناحل ({locations.length})
        </h3>
        <div className="space-y-2">
          {locations.map((loc) => {
            const hivesCount = hives.filter(h => h.location === loc.name).length;
            return (
              <div key={loc.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
                <div>
                  <p className="font-bold">{loc.name}</p>
                  <p className="text-xs text-muted-foreground">{hivesCount} خلية • {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeLocation(loc.id!)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            );
          })}
          {locations.length === 0 && (
            <p className="text-center text-muted-foreground py-6">لا توجد مواقع بعد. اضغط على الخريطة لإضافة منحل.</p>
          )}
        </div>
      </section>

      {/* Add Location Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>إضافة موقع منحل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {clickedLatLng && (
              <p className="text-sm text-muted-foreground">
                الإحداثيات: {clickedLatLng.lat.toFixed(5)}, {clickedLatLng.lng.toFixed(5)}
              </p>
            )}
            <div>
              <Label>اسم المنحل *</Label>
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="مثال: المزرعة الشمالية"
              />
            </div>
            <Button onClick={handleAddLocation} className="w-full gradient-honey text-primary-foreground">
              <Plus className="w-4 h-4 ml-2" />
              إضافة الموقع
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default MapPage;
