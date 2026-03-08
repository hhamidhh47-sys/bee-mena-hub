import { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Plus, Navigation, Trash2, Edit2, HelpCircle, X, ZoomIn, MousePointer, Move } from "lucide-react";
import { useHives } from "@/hooks/useDatabase";
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
  const [editingLocation, setEditingLocation] = useState<ApiaryLocation | null>(null);
  const [newName, setNewName] = useState("");
  const [newLat, setNewLat] = useState("");
  const [newLng, setNewLng] = useState("");
  const [clickedLatLng, setClickedLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);

  // Check first visit
  useEffect(() => {
    const visited = localStorage.getItem("nahali-map-visited");
    if (!visited) {
      setFirstVisit(true);
      setShowHelp(true);
      localStorage.setItem("nahali-map-visited", "true");
    }
  }, []);

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

    const map = L.map(mapRef.current).setView([24.7136, 46.6753], 6);
    const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    });
    const satelliteLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "© Esri",
    });

    streetLayer.addTo(map);

    L.control.layers(
      { "خريطة عادية": streetLayer, "قمر صناعي 🛰️": satelliteLayer },
      {},
      { position: "topright" }
    ).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      setEditingLocation(null);
      setNewName("");
      setNewLat(e.latlng.lat.toFixed(5));
      setNewLng(e.latlng.lng.toFixed(5));
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
      html: `<div style="font-size:28px;text-align:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🐝</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: "",
    });

    locations.forEach((loc) => {
      const hivesAtLocation = hives.filter(h => h.location === loc.name);
      const marker = L.marker([loc.lat, loc.lng], { icon: beeIcon, draggable: true })
        .addTo(map)
        .bindPopup(`
          <div style="text-align:right;font-family:Tajawal;min-width:180px;direction:rtl;">
            <strong style="font-size:15px;">📍 ${loc.name}</strong><br/>
            <span>🐝 ${hivesAtLocation.length} خلية</span><br/>
            <small style="color:#888;">${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}</small>
            <hr style="margin:6px 0;border-color:#eee;"/>
            <div style="text-align:center;font-size:12px;color:#888;">
              اسحب العلامة لتحريك الموقع
            </div>
          </div>
        `);

      // Handle drag end - update location
      marker.on("dragend", () => {
        const newPos = marker.getLatLng();
        setLocations(prev =>
          prev.map(l =>
            l.id === loc.id ? { ...l, lat: newPos.lat, lng: newPos.lng } : l
          )
        );
        toast({ title: `تم تحديث موقع "${loc.name}" 📍` });
      });
    });
  }, [locations, hives]);

  const handleAddLocation = () => {
    if (!newName.trim()) return;
    const lat = clickedLatLng?.lat ?? parseFloat(newLat);
    const lng = clickedLatLng?.lng ?? parseFloat(newLng);
    if (isNaN(lat) || isNaN(lng)) {
      toast({ title: "الإحداثيات غير صحيحة", variant: "destructive" });
      return;
    }

    if (editingLocation) {
      setLocations(prev =>
        prev.map(l =>
          l.id === editingLocation.id ? { ...l, name: newName.trim(), lat, lng } : l
        )
      );
      toast({ title: `تم تحديث "${newName.trim()}" بنجاح ✏️` });
    } else {
      setLocations(prev => [...prev, { id: Date.now(), name: newName.trim(), lat, lng }]);
      toast({ title: "تمت إضافة الموقع بنجاح 📍" });
    }

    setNewName("");
    setNewLat("");
    setNewLng("");
    setClickedLatLng(null);
    setEditingLocation(null);
    setDialogOpen(false);
  };

  const openEditDialog = (loc: ApiaryLocation) => {
    setEditingLocation(loc);
    setNewName(loc.name);
    setNewLat(loc.lat.toFixed(5));
    setNewLng(loc.lng.toFixed(5));
    setClickedLatLng({ lat: loc.lat, lng: loc.lng });
    setDialogOpen(true);
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

  const flyToLocation = (loc: ApiaryLocation) => {
    mapInstance.current?.flyTo([loc.lat, loc.lng], 12, { duration: 1.5 });
  };

  return (
    <AppLayout title="خريطة المناحل">
      {/* Help Overlay */}
      {showHelp && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowHelp(false)} />
          <div className="relative z-[3001] bg-background rounded-2xl p-6 w-full max-w-md shadow-2xl border border-border">
            <button onClick={() => setShowHelp(false)} className="absolute top-3 left-3 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-5 text-center">🗺️ كيفية استخدام الخريطة</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-3">
                <div className="bg-primary/10 rounded-lg p-2 shrink-0">
                  <MousePointer className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm">اضغط على الخريطة</p>
                  <p className="text-xs text-muted-foreground">اضغط على أي مكان في الخريطة لإضافة منحل جديد في ذلك الموقع</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-3">
                <div className="bg-primary/10 rounded-lg p-2 shrink-0">
                  <Move className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm">اسحب العلامة</p>
                  <p className="text-xs text-muted-foreground">اضغط مطولاً على علامة 🐝 ثم اسحبها لتغيير موقع المنحل</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-3">
                <div className="bg-primary/10 rounded-lg p-2 shrink-0">
                  <ZoomIn className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm">تكبير وتصغير</p>
                  <p className="text-xs text-muted-foreground">استخدم أزرار +/- أو أصابعك للتكبير والتصغير والتنقل في الخريطة</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-3">
                <div className="bg-primary/10 rounded-lg p-2 shrink-0">
                  <Edit2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm">تعديل وحذف</p>
                  <p className="text-xs text-muted-foreground">استخدم أيقونات التعديل والحذف في قائمة المناحل أسفل الخريطة</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowHelp(false)} className="w-full mt-5 gradient-honey text-primary-foreground">
              فهمت، ابدأ الآن! 🚀
            </Button>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="relative rounded-2xl overflow-hidden border border-border mb-4" style={{ height: "50vh" }}>
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Map Controls */}
        <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2">
          <Button
            onClick={handleLocateMe}
            size="icon"
            className="rounded-full shadow-lg bg-card text-foreground hover:bg-muted"
          >
            <Navigation className="w-5 h-5" />
          </Button>
          <Button
            onClick={() => setShowHelp(true)}
            size="icon"
            className="rounded-full shadow-lg bg-card text-foreground hover:bg-muted"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">اضغط على الخريطة أو استخدم الزر لإضافة موقع</p>
        <Button
          onClick={() => {
            setEditingLocation(null);
            setNewName("");
            setNewLat("24.71360");
            setNewLng("46.67530");
            setClickedLatLng({ lat: 24.7136, lng: 46.6753 });
            setDialogOpen(true);
          }}
          size="sm"
          className="gradient-honey text-primary-foreground"
        >
          <Plus className="w-4 h-4 ml-1" />
          إضافة منحل
        </Button>
      </div>

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
              <div
                key={loc.id}
                className="bg-card rounded-xl p-4 border border-border flex items-center justify-between cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => flyToLocation(loc)}
              >
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); removeLocation(loc.id!); }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); openEditDialog(loc); }}
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="font-bold">{loc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {hivesCount} خلية • {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            );
          })}
          {locations.length === 0 && (
            <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed border-border">
              <MapPin className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground">لا توجد مواقع بعد</p>
              <p className="text-xs text-muted-foreground mt-1">اضغط على الخريطة أو زر "إضافة منحل"</p>
            </div>
          )}
        </div>
      </section>

      {/* Add/Edit Location Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => { setDialogOpen(false); setEditingLocation(null); }} />
          <div className="relative z-[2001] bg-background rounded-xl p-6 w-full max-w-sm shadow-2xl border border-border">
            <button
              onClick={() => { setDialogOpen(false); setEditingLocation(null); }}
              className="absolute top-3 left-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-4 text-right">
              {editingLocation ? "تعديل موقع المنحل ✏️" : "إضافة موقع منحل 📍"}
            </h3>
            <div className="space-y-4">
              <div>
                <Label>اسم المنحل *</Label>
                <Input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="مثال: المزرعة الشمالية"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>خط الطول</Label>
                  <Input
                    value={newLng}
                    onChange={e => setNewLng(e.target.value)}
                    placeholder="46.6753"
                    type="number"
                    step="any"
                  />
                </div>
                <div>
                  <Label>خط العرض</Label>
                  <Input
                    value={newLat}
                    onChange={e => setNewLat(e.target.value)}
                    placeholder="24.7136"
                    type="number"
                    step="any"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                يمكنك تعديل الإحداثيات يدوياً أو الضغط على الخريطة
              </p>
              <Button onClick={handleAddLocation} className="w-full gradient-honey text-primary-foreground">
                {editingLocation ? (
                  <><Edit2 className="w-4 h-4 ml-2" />حفظ التعديلات</>
                ) : (
                  <><Plus className="w-4 h-4 ml-2" />إضافة الموقع</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default MapPage;
