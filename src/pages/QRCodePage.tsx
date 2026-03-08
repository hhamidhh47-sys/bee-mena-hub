import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { QRCodeSVG } from "qrcode.react";
import { useHives } from "@/hooks/useDatabase";
import { Button } from "@/components/ui/button";
import { Download, QrCode, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const QRCodePage = () => {
  const hives = useHives() ?? [];
  const [search, setSearch] = useState("");
  const [selectedHive, setSelectedHive] = useState<number | null>(null);

  const filteredHives = hives.filter(h =>
    h.name.includes(search) || h.location.includes(search)
  );

  const getQRValue = (hiveId: number) => {
    return `${window.location.origin}/inspection/${hiveId}`;
  };

  const downloadQR = (hiveId: number, hiveName: string) => {
    const svg = document.getElementById(`qr-${hiveId}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx!.fillStyle = "white";
      ctx!.fillRect(0, 0, 512, 512);
      ctx!.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement("a");
      a.download = `qr-${hiveName}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <AppLayout title="رموز QR للخلايا">
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="بحث عن خلية..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Selected Hive QR - Large */}
      {selectedHive && (
        <div className="bg-card rounded-2xl border border-border p-6 mb-6 text-center">
          <h3 className="font-bold text-lg mb-4">
            {hives.find(h => h.id === selectedHive)?.name}
          </h3>
          <div className="flex justify-center mb-4">
            <QRCodeSVG
              id={`qr-large-${selectedHive}`}
              value={getQRValue(selectedHive)}
              size={220}
              level="H"
              includeMargin
              bgColor="white"
              fgColor="#1a1a1a"
            />
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            امسح هذا الرمز للوصول السريع لصفحة فحص الخلية
          </p>
          <Button
            onClick={() => downloadQR(selectedHive, hives.find(h => h.id === selectedHive)?.name || "hive")}
            variant="outline"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            تحميل الصورة
          </Button>
        </div>
      )}

      {/* Hives Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredHives.map(hive => (
          <div
            key={hive.id}
            onClick={() => setSelectedHive(hive.id!)}
            className={`bg-card rounded-2xl border p-4 text-center cursor-pointer transition-all hover:shadow-honey ${
              selectedHive === hive.id ? "border-primary shadow-honey" : "border-border"
            }`}
          >
            <div className="flex justify-center mb-3">
              <QRCodeSVG
                id={`qr-${hive.id}`}
                value={getQRValue(hive.id!)}
                size={100}
                level="M"
                bgColor="transparent"
                fgColor="currentColor"
              />
            </div>
            <p className="font-bold text-sm">{hive.name}</p>
            <p className="text-xs text-muted-foreground">{hive.location}</p>
          </div>
        ))}
      </div>

      {filteredHives.length === 0 && (
        <div className="text-center py-12">
          <QrCode className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">لا توجد خلايا</p>
        </div>
      )}
    </AppLayout>
  );
};

export default QRCodePage;
