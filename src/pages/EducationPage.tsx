import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { BookOpen, Video, FileText, Bug, Droplets, Crown, Shield, Flower2, Search, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Article {
  id: string;
  title: string;
  category: "beginner" | "diseases" | "harvest" | "queen" | "seasonal" | "equipment";
  content: string;
  videoUrl?: string;
  readTime: number;
  emoji: string;
}

const articles: Article[] = [
  {
    id: "1",
    title: "أساسيات تربية النحل للمبتدئين",
    category: "beginner",
    emoji: "🐝",
    readTime: 8,
    content: `## مقدمة في عالم النحل

تربية النحل من أقدم الأنشطة الزراعية وأكثرها فائدة. إليك أهم الأساسيات:

### 1. اختيار الموقع المناسب
- يجب أن يكون الموقع بعيداً عن الضوضاء والطرق المزدحمة
- توفر مصادر مياه نظيفة قريبة
- حماية من الرياح القوية (سور أو أشجار)
- تعرض لأشعة الشمس صباحاً

### 2. الأدوات الأساسية
- **بدلة النحال**: لحماية الجسم من اللسعات
- **المدخن**: لتهدئة النحل أثناء الفحص
- **العتلة**: لفتح الخلايا وتحريك الإطارات
- **الفرشاة**: لإزاحة النحل برفق

### 3. أول خلية
- ابدأ بخليتين على الأقل للمقارنة
- اشترِ طوائف من مربي موثوق
- تأكد من وجود ملكة ملقحة ونشيطة

### 4. الفحص الأسبوعي
- افحص كل 7-10 أيام في الموسم النشط
- ابحث عن: البيض، الحضنة، مخزون الغذاء، حالة الملكة
- سجّل ملاحظاتك في كل فحص`,
  },
  {
    id: "2",
    title: "مكافحة حلم الفاروا - الدليل الشامل",
    category: "diseases",
    emoji: "🔬",
    readTime: 12,
    content: `## حلم الفاروا (Varroa destructor)

أخطر آفة تهدد نحل العسل عالمياً. إليك كيفية التعامل معها:

### أعراض الإصابة
- نحل مشوه الأجنحة (DWV)
- ضعف عام في الطائفة
- حضنة متقطعة وغير منتظمة
- رؤية الحلم بالعين المجردة على النحل

### طرق الكشف
1. **اختبار السكر البودرة**: رش 300 نحلة بالسكر وعد الحلم المتساقط
2. **اختبار الكحول**: غسل 300 نحلة في كحول وعد الحلم
3. **لوحة القاع**: ضع لوحة لاصقة أسفل الخلية لمدة 3 أيام

### العلاج
#### العلاج العضوي (مفضل)
- **حمض الأوكساليك**: فعال جداً في فترة عدم وجود حضنة
- **حمض الفورميك**: يخترق خلايا الحضنة المغلقة
- **الثيمول**: مناسب للمناطق الحارة

#### العلاج الكيميائي (عند الضرورة)
- أميتراز (Apivar)
- فلوميثرين (Bayvarol)
- ⚠️ استخدمه كحل أخير وبحذر لتجنب المقاومة

### الوقاية
- فحص دوري كل شهر
- استخدام سلالات مقاومة
- تقصير فترة الحضنة المغلقة`,
  },
  {
    id: "3",
    title: "حصاد العسل - من الخلية للعبوة",
    category: "harvest",
    emoji: "🍯",
    readTime: 10,
    content: `## دليل حصاد العسل

### متى تحصد؟
- عندما يكون 80% من الإطار مختوماً بالشمع
- تجنب الحصاد في الشتاء أو فترات الجفاف
- اترك كمية كافية للنحل (15-20 كغ على الأقل)

### أدوات الحصاد
- سكين كشط ساخن أو كهربائي
- فراز عسل (يدوي أو كهربائي)
- مصفاة عسل (200 ميكرون)
- أوعية تخزين نظيفة

### خطوات الحصاد
1. **اختر الوقت**: صباحاً باكراً أو مساءً
2. **استخدم المدخن**: دخّن الخلية بلطف
3. **أزل الإطارات**: اختر المختومة بالكامل
4. **كشط الشمع**: بالسكين الساخن
5. **الفرز**: ضع الإطارات في الفراز
6. **التصفية**: صفّ العسل مرتين
7. **التعبئة**: في عبوات زجاجية نظيفة

### تخزين العسل
- في مكان جاف وبارد (تحت 25°)
- عبوات محكمة الإغلاق
- بعيداً عن أشعة الشمس المباشرة
- العسل لا يفسد إذا خُزّن بشكل صحيح!`,
  },
  {
    id: "4",
    title: "تربية الملكات وتحسين السلالات",
    category: "queen",
    emoji: "👑",
    readTime: 15,
    content: `## فن تربية الملكات

### لماذا نربي ملكات؟
- تحسين إنتاجية الطوائف
- استبدال ملكات كبيرة السن
- إنتاج طوائف جديدة
- الحفاظ على سلالات محلية متميزة

### طريقة التطعيم (Grafting)
1. **اختر يرقات عمرها يوم واحد** من أفضل طائفة
2. **انقلها بإبرة التطعيم** إلى أكواب ملكية
3. **ضعها في طائفة بادئة** (بدون ملكة)
4. **بعد 10 أيام**: انقل البيوت الملكية للنويات
5. **بعد أسبوعين**: تحقق من تلقيح الملكة

### صفات الملكة الجيدة
- حجم كبير ومتناسق
- إنتاج بيض غزير ومنتظم
- طائفة هادئة الطباع
- مقاومة للأمراض
- إنتاج عسل مرتفع

### السلالات المحلية المميزة
- **النحل اليمني**: متأقلم مع الحرارة
- **النحل المصري**: مقاوم للأمراض
- **نحل المغرب**: غزير الإنتاج`,
  },
  {
    id: "5",
    title: "إدارة النحل في فصل الشتاء",
    category: "seasonal",
    emoji: "❄️",
    readTime: 7,
    content: `## تجهيز الخلايا لفصل الشتاء

### قبل الشتاء (أكتوبر-نوفمبر)
- تقليل عدد الإطارات حسب قوة الطائفة
- دمج الطوائف الضعيفة
- معالجة الفاروا قبل البرد
- التأكد من مخزون غذائي كافٍ (15+ كغ)

### خلال الشتاء
- لا تفتح الخلايا إلا عند الضرورة
- تضييق المدخل لمنع دخول الفئران
- تأكد من التهوية الجيدة لمنع الرطوبة
- لا تغذّ بالسكر السائل في البرد (استخدم كاندي)

### علامات طائفة شتوية سليمة
- سماع طنين خفيف عند الطرق
- نشاط بسيط في الأيام الدافئة
- عدم وجود نحل ميت كثير عند المدخل`,
  },
  {
    id: "6",
    title: "أمراض الحضنة وعلاجها",
    category: "diseases",
    emoji: "🦠",
    readTime: 11,
    content: `## أمراض الحضنة الشائعة

### 1. تعفن الحضنة الأمريكي (AFB)
- **الأعراض**: حضنة متحللة ذات رائحة كريهة، أغطية غائرة ومثقوبة
- **العلاج**: لا يوجد علاج - يجب حرق الخلية والإطارات ⚠️
- **الوقاية**: فحص دوري، عدم نقل إطارات بين خلايا

### 2. تعفن الحضنة الأوروبي (EFB)
- **الأعراض**: يرقات ملتوية بلون أصفر/بني، رائحة حامضة
- **العلاج**: تغيير الملكة + تقوية الطائفة
- **الوقاية**: تغذية جيدة وطوائف قوية

### 3. الحضنة الطباشيرية (Chalkbrood)
- **الأعراض**: يرقات متحجرة بيضاء/رمادية
- **العلاج**: تحسين التهوية + تغيير الملكة
- **الوقاية**: مكان جاف ومشمس

### 4. النوزيما (Nosema)
- **الأعراض**: إسهال على واجهة الخلية، ضعف عام
- **العلاج**: فوماجيلين (في بعض الدول)
- **الوقاية**: نظافة المعدات وتهوية جيدة`,
  },
];

const categories = [
  { value: "all", label: "الكل", icon: BookOpen },
  { value: "beginner", label: "مبتدئ", icon: BookOpen },
  { value: "diseases", label: "أمراض", icon: Bug },
  { value: "harvest", label: "حصاد", icon: Droplets },
  { value: "queen", label: "ملكات", icon: Crown },
  { value: "seasonal", label: "موسمي", icon: Flower2 },
  { value: "equipment", label: "معدات", icon: Shield },
];

const EducationPage = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const filtered = articles.filter(a => {
    const matchesSearch = !search || a.title.includes(search) || a.content.includes(search);
    const matchesCategory = selectedCategory === "all" || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout title="المكتبة التعليمية">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="ابحث في المقالات..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Categories */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 pb-2" style={{ minWidth: "max-content" }}>
          {categories.map(c => (
            <button
              key={c.value}
              onClick={() => setSelectedCategory(c.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === c.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <c.icon className="w-3 h-3" />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Video Section */}
      <section className="mb-8">
        <div className="bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl p-5 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Video className="w-5 h-5 text-primary" />
            <h3 className="font-bold">فيديوهات مقترحة</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: "فحص الخلية خطوة بخطوة", duration: "12:30" },
              { title: "كيف تحصد العسل", duration: "8:45" },
              { title: "تربية الملكات للمبتدئين", duration: "15:20" },
              { title: "علاج الفاروا طبيعياً", duration: "10:15" },
            ].map((v, i) => (
              <div key={i} className="bg-card rounded-xl p-3 border border-border hover:border-primary/30 transition-all cursor-pointer">
                <div className="w-full aspect-video bg-muted rounded-lg mb-2 flex items-center justify-center">
                  <Video className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <p className="text-xs font-medium line-clamp-2">{v.title}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{v.duration}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-4">المقالات ({filtered.length})</h3>
        <div className="space-y-3">
          {filtered.map(article => (
            <div
              key={article.id}
              className="bg-card rounded-2xl border border-border overflow-hidden transition-all"
            >
              <button
                className="w-full p-4 flex items-start justify-between text-right"
                onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{article.emoji}</span>
                  <div>
                    <h4 className="font-bold text-sm">{article.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">
                        {categories.find(c => c.value === article.category)?.label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{article.readTime} دقائق قراءة</span>
                    </div>
                  </div>
                </div>
                {expandedArticle === article.id ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                )}
              </button>
              
              {expandedArticle === article.id && (
                <div className="px-4 pb-4 border-t border-border pt-3">
                  <div className="prose prose-sm max-w-none text-foreground">
                    {article.content.split("\n").map((line, i) => {
                      if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold mt-4 mb-2 text-primary">{line.replace("## ", "")}</h2>;
                      if (line.startsWith("### ")) return <h3 key={i} className="text-base font-bold mt-3 mb-1">{line.replace("### ", "")}</h3>;
                      if (line.startsWith("#### ")) return <h4 key={i} className="font-bold mt-2 mb-1 text-sm">{line.replace("#### ", "")}</h4>;
                      if (line.startsWith("- ")) return <li key={i} className="text-sm mr-4 mb-1">{line.replace("- ", "")}</li>;
                      if (line.trim() === "") return <br key={i} />;
                      return <p key={i} className="text-sm mb-1">{line}</p>;
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">لا توجد مقالات مطابقة</p>
        </div>
      )}
    </AppLayout>
  );
};

export default EducationPage;
