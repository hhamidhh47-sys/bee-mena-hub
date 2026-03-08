import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Phone, MapPin, Star, Search, MessageCircle, Shield, Award, Clock, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Expert {
  id: string;
  name: string;
  title: string;
  specialty: string[];
  country: string;
  city: string;
  phone: string;
  whatsapp?: string;
  rating: number;
  experience: number;
  available: boolean;
  bio: string;
  emoji: string;
}

const experts: Expert[] = [
  {
    id: "1",
    name: "د. عبدالرحمن الشمري",
    title: "طبيب بيطري متخصص بالنحل",
    specialty: ["أمراض النحل", "الفاروا", "علاج الحضنة"],
    country: "السعودية",
    city: "الرياض",
    phone: "+966501234567",
    whatsapp: "+966501234567",
    rating: 4.9,
    experience: 15,
    available: true,
    bio: "متخصص في أمراض نحل العسل مع خبرة 15 سنة. استشاري في وزارة الزراعة السعودية.",
    emoji: "🩺",
  },
  {
    id: "2",
    name: "أ. محمد الحربي",
    title: "خبير تربية ملكات",
    specialty: ["تربية الملكات", "تحسين السلالات", "النحل اليمني"],
    country: "السعودية",
    city: "الباحة",
    phone: "+966507654321",
    whatsapp: "+966507654321",
    rating: 4.8,
    experience: 20,
    available: true,
    bio: "نحال محترف متخصص في تربية الملكات والحفاظ على سلالات النحل المحلية.",
    emoji: "👑",
  },
  {
    id: "3",
    name: "د. أحمد المصري",
    title: "باحث في علوم النحل",
    specialty: ["أبحاث النحل", "الإنتاج المكثف", "تلوث العسل"],
    country: "مصر",
    city: "القاهرة",
    phone: "+201012345678",
    rating: 4.7,
    experience: 12,
    available: false,
    bio: "باحث في المركز القومي للبحوث. متخصص في تحسين إنتاج العسل وجودته.",
    emoji: "🔬",
  },
  {
    id: "4",
    name: "أ. حسن اللبناني",
    title: "مدرب نحالة محترف",
    specialty: ["تدريب المبتدئين", "النحالة العضوية", "عسل الزعتر"],
    country: "لبنان",
    city: "البقاع",
    phone: "+96171234567",
    whatsapp: "+96171234567",
    rating: 4.9,
    experience: 18,
    available: true,
    bio: "مدرب معتمد من الاتحاد العربي للنحالين. أسس أكثر من 50 منحلة في لبنان.",
    emoji: "🎓",
  },
  {
    id: "5",
    name: "م. فاطمة المغربية",
    title: "خبيرة عسل عضوي",
    specialty: ["النحالة العضوية", "تسويق العسل", "عسل الخزامى"],
    country: "المغرب",
    city: "فاس",
    phone: "+212612345678",
    whatsapp: "+212612345678",
    rating: 4.6,
    experience: 10,
    available: true,
    bio: "رائدة في النحالة العضوية في المغرب. مؤسسة تعاونية نسائية للنحالات.",
    emoji: "🌿",
  },
  {
    id: "6",
    name: "د. خالد البغدادي",
    title: "طبيب بيطري",
    specialty: ["أمراض النحل", "الآفات", "صحة الطوائف"],
    country: "العراق",
    city: "بغداد",
    phone: "+9647701234567",
    rating: 4.5,
    experience: 8,
    available: true,
    bio: "طبيب بيطري متخصص في حشرات العسل. يقدم استشارات ميدانية وعن بعد.",
    emoji: "🩺",
  },
];

const emergencyServices = [
  {
    name: "خط طوارئ النحالين - السعودية",
    phone: "+966112345678",
    description: "خدمة 24 ساعة لحالات انهيار الطوائف والتسمم",
    emoji: "🚨",
  },
  {
    name: "جمعية النحالين المصريين",
    phone: "+20221234567",
    description: "دعم فني واستشارات للنحالين في مصر",
    emoji: "🏛️",
  },
  {
    name: "اتحاد النحالين العرب",
    phone: "+96112345678",
    description: "المرجع العربي الأول لتربية النحل",
    emoji: "🌍",
  },
];

const countries = ["الكل", "السعودية", "مصر", "لبنان", "المغرب", "العراق"];

const ExpertsPage = () => {
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("الكل");
  const [expandedExpert, setExpandedExpert] = useState<string | null>(null);

  const filtered = experts.filter(e => {
    const matchesSearch = !search || e.name.includes(search) || e.specialty.some(s => s.includes(search));
    const matchesCountry = selectedCountry === "الكل" || e.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  return (
    <AppLayout title="دليل الخبراء">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="ابحث بالاسم أو التخصص..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Country Filter */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 pb-2" style={{ minWidth: "max-content" }}>
          {countries.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCountry(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                selectedCountry === c
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Services */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-destructive" />
          خدمات الطوارئ
        </h3>
        <div className="space-y-2">
          {emergencyServices.map((s, i) => (
            <div key={i} className="bg-destructive/5 rounded-xl p-3 border border-destructive/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{s.emoji}</span>
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground">{s.description}</p>
                </div>
              </div>
              <a href={`tel:${s.phone}`} className="shrink-0">
                <Button size="sm" variant="outline" className="h-8 text-xs border-destructive/30 text-destructive hover:bg-destructive/10">
                  <Phone className="w-3 h-3 ml-1" />
                  اتصل
                </Button>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Experts List */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-4">الخبراء ({filtered.length})</h3>
        <div className="space-y-3">
          {filtered.map(expert => (
            <div
              key={expert.id}
              className="bg-card rounded-2xl border border-border overflow-hidden transition-all"
            >
              <button
                className="w-full p-4 text-right"
                onClick={() => setExpandedExpert(expandedExpert === expert.id ? null : expert.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl shrink-0">
                    {expert.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm">{expert.name}</h4>
                      {expert.available ? (
                        <Badge className="bg-nature/10 text-nature border-nature/30 text-[10px]">متاح</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">مشغول</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{expert.title}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium">{expert.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{expert.experience} سنة</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{expert.city}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {expandedExpert === expert.id && (
                <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                  <p className="text-sm">{expert.bio}</p>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {expert.specialty.map((s, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <a href={`tel:${expert.phone}`} className="flex-1">
                      <Button variant="outline" className="w-full h-9 text-xs">
                        <Phone className="w-3 h-3 ml-1" />
                        اتصال
                      </Button>
                    </a>
                    {expert.whatsapp && (
                      <a href={`https://wa.me/${expert.whatsapp.replace("+", "")}`} target="_blank" rel="noopener" className="flex-1">
                        <Button className="w-full h-9 text-xs bg-[#25D366] hover:bg-[#20BD5A]">
                          <MessageCircle className="w-3 h-3 ml-1" />
                          واتساب
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">لا يوجد خبراء مطابقون</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-muted/50 rounded-xl p-4 mb-8 text-center">
        <p className="text-xs text-muted-foreground">
          ⓘ أرقام الهواتف تجريبية. التطبيق غير مسؤول عن جودة الخدمات المقدمة.
        </p>
      </div>
    </AppLayout>
  );
};

export default ExpertsPage;
