import { type Hive, type Task } from "./db";

export interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  type: Task["type"];
  priority: "high" | "medium" | "low";
  hiveId?: number;
  hiveName?: string;
  icon: string;
}

export interface HiveAlert {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  hiveId?: number;
  hiveName?: string;
  icon: string;
}

// Parse "قبل X أيام" style dates to approximate days ago
function parseLastInspection(text: string): number {
  if (text.includes("اليوم")) return 0;
  if (text.includes("أمس") || text.includes("يوم")) return 1;
  if (text.includes("يومين")) return 2;
  const match = text.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1]);
    if (text.includes("أسبوع")) return num * 7;
    if (text.includes("شهر")) return num * 30;
    return num; // days
  }
  return 14; // default: assume 2 weeks if unknown
}

// Get current month (1-12)
function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

// Determine beekeeping season
function getSeason(): "spring" | "summer" | "autumn" | "winter" {
  const month = getCurrentMonth();
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export function generateSmartSuggestions(hives: Hive[], existingTasks: Task[]): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  const season = getSeason();
  const todayStr = new Date().toISOString().split("T")[0];
  const existingToday = existingTasks.filter(t => t.date === todayStr && !t.completed);

  for (const hive of hives) {
    const daysSinceInspection = parseLastInspection(hive.lastInspection);
    const hasExistingTask = (type: string) =>
      existingToday.some(t => t.hiveId === hive.id && t.type === type);

    // 1. Overdue inspection (>10 days)
    if (daysSinceInspection > 10 && !hasExistingTask("inspection")) {
      suggestions.push({
        id: `inspect-${hive.id}`,
        title: `فحص ${hive.name}`,
        description: `آخر فحص كان منذ ${daysSinceInspection} يوم — يُنصح بالفحص كل 7-10 أيام`,
        type: "inspection",
        priority: daysSinceInspection > 14 ? "high" : "medium",
        hiveId: hive.id,
        hiveName: hive.name,
        icon: "🔍",
      });
    }

    // 2. Queen issues
    if (hive.queenStatus === "missing" && !hasExistingTask("inspection")) {
      suggestions.push({
        id: `queen-missing-${hive.id}`,
        title: `البحث عن ملكة ${hive.name}`,
        description: "الملكة مفقودة! يجب فحص الخلية فوراً والبحث عن بيوت ملكات أو إدخال ملكة جديدة",
        type: "inspection",
        priority: "high",
        hiveId: hive.id,
        hiveName: hive.name,
        icon: "👑",
      });
    }

    if (hive.queenStatus === "virgin") {
      suggestions.push({
        id: `queen-virgin-${hive.id}`,
        title: `مراقبة تلقيح ملكة ${hive.name}`,
        description: "الملكة عذراء — راقب رحلات التلقيح خلال 7-14 يوم. لا تفتح الخلية كثيراً لتجنب إزعاجها",
        type: "inspection",
        priority: "high",
        hiveId: hive.id,
        hiveName: hive.name,
        icon: "💍",
      });
    }

    if (hive.queenStatus === "cell") {
      suggestions.push({
        id: `queen-cell-${hive.id}`,
        title: `مراقبة خروج ملكة ${hive.name}`,
        description: "يوجد بيت ملكة — توقع خروج الملكة خلال 1-7 أيام. لا تزعج الخلية واحذر من التطريد",
        type: "inspection",
        priority: "high",
        hiveId: hive.id,
        hiveName: hive.name,
        icon: "🏠",
      });
    }

    if (hive.queenStatus === "weak" && !hasExistingTask("medication")) {
      suggestions.push({
        id: `queen-weak-${hive.id}`,
        title: `تقوية ملكة ${hive.name}`,
        description: "الملكة ضعيفة — فكّر في استبدالها أو تقوية الخلية بإطارات حضنة من خلية قوية",
        type: "medication",
        priority: "medium",
        hiveId: hive.id,
        hiveName: hive.name,
        icon: "⚠️",
      });
    }

    // 3. Low production alert
    if (hive.honeyProduction < 5 && season !== "winter" && !hasExistingTask("feeding")) {
      suggestions.push({
        id: `low-prod-${hive.id}`,
        title: `تغذية ${hive.name}`,
        description: `إنتاج العسل منخفض (${hive.honeyProduction} كغ) — قد تحتاج الخلية لتغذية تكميلية`,
        type: "feeding",
        priority: "medium",
        hiveId: hive.id,
        hiveName: hive.name,
        icon: "🍯",
      });
    }

    // 4. Hive with alerts
    if (hive.alerts && hive.alerts > 0 && !hasExistingTask("inspection")) {
      suggestions.push({
        id: `alerts-${hive.id}`,
        title: `معالجة تنبيهات ${hive.name}`,
        description: `يوجد ${hive.alerts} تنبيه — تحقق من حالة الخلية وعالج المشاكل`,
        type: "inspection",
        priority: "high",
        hiveId: hive.id,
        hiveName: hive.name,
        icon: "🚨",
      });
    }
  }

  // 5. Seasonal suggestions (not hive-specific)
  if (season === "spring") {
    suggestions.push({
      id: "season-spring-swarm",
      title: "الاستعداد لموسم التطريد",
      description: "موسم الربيع = موسم التطريد. تأكد من توسيع الخلايا وإضافة إطارات فارغة لمنع التطريد",
      type: "other",
      priority: "medium",
      icon: "🌸",
    });
    if (!existingToday.some(t => t.type === "harvest")) {
      suggestions.push({
        id: "season-spring-harvest",
        title: "التحضير لحصاد الربيع",
        description: "موسم إزهار الحمضيات والأزهار البرية — جهّز صناديق العسل الإضافية",
        type: "harvest",
        priority: "low",
        icon: "🌺",
      });
    }
  }

  if (season === "summer") {
    suggestions.push({
      id: "season-summer-water",
      title: "توفير الماء للنحل",
      description: "في الحر الشديد، تأكد من وجود مصدر ماء قريب وظل كافٍ للخلايا",
      type: "other",
      priority: "medium",
      icon: "💧",
    });
    suggestions.push({
      id: "season-summer-varroa",
      title: "علاج الفاروا الصيفي",
      description: "أفضل وقت لعلاج الفاروا بعد حصاد العسل. استخدم شرائط الأميتراز أو حمض الأكساليك",
      type: "medication",
      priority: "high",
      icon: "🦟",
    });
  }

  if (season === "autumn") {
    suggestions.push({
      id: "season-autumn-feed",
      title: "التغذية الخريفية",
      description: "ابدأ بتغذية النحل بمحلول السكر (2:1) لتجهيز مخزون الشتاء",
      type: "feeding",
      priority: "high",
      icon: "🍂",
    });
    suggestions.push({
      id: "season-autumn-combine",
      title: "دمج الخلايا الضعيفة",
      description: "الخلايا الضعيفة لن تنجو من الشتاء — فكّر في دمجها مع خلايا أقوى",
      type: "other",
      priority: "medium",
      icon: "🤝",
    });
  }

  if (season === "winter") {
    suggestions.push({
      id: "season-winter-check",
      title: "فحص مخزون الغذاء",
      description: "تأكد من وزن الخلايا — يجب أن يكون لديها 15-20 كغ من العسل لتعيش الشتاء",
      type: "inspection",
      priority: "high",
      icon: "❄️",
    });
    suggestions.push({
      id: "season-winter-ventilation",
      title: "تحسين التهوية الشتوية",
      description: "تأكد من وجود تهوية كافية لمنع الرطوبة داخل الخلية مع الحفاظ على الدفء",
      type: "other",
      priority: "medium",
      icon: "🌬️",
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return suggestions;
}

export function generateHiveAlerts(hives: Hive[]): HiveAlert[] {
  const alerts: HiveAlert[] = [];
  const season = getSeason();

  for (const hive of hives) {
    const daysSinceInspection = parseLastInspection(hive.lastInspection);

    // Critical: Queen missing
    if (hive.queenStatus === "missing") {
      alerts.push({
        id: `alert-queen-missing-${hive.id}`,
        title: `ملكة مفقودة — ${hive.name}`,
        description: "خطر! الخلية بدون ملكة ستضعف خلال أسابيع. أدخل ملكة جديدة أو اترك بيت ملكة",
        severity: "critical",
        hiveId: hive.id,
        hiveName: hive.name,
        icon: "🚨",
      });
    }

    // Warning: Queen cell - swarm risk
    if (hive.queenStatus === "cell" && season === "spring") {
      alerts.push({
        id: `alert-swarm-risk-${hive.id}`,
        title: `خطر تطريد — ${hive.name}`,
        description: "بيت ملكة في الربيع = احتمال تطريد عالي! افحص وقرر: هل تريد تقسيم أم منع التطريد؟",
        severity: "critical",
        hiveId: hive.id,
        hiveName: hive.name,
        icon: "⚡",
      });
    }

    // Warning: Virgin queen mating window
    if (hive.queenStatus === "virgin") {
      alerts.push({
        id: `alert-mating-${hive.id}`,
        title: `نافذة تلقيح — ${hive.name}`,
        description: "الملكة العذراء تحتاج 7-14 يوم للتلقيح. إذا لم تُلقّح خلال 3 أسابيع، قد تصبح ملكة بيض ذكور",
        severity: "warning",
        hiveId: hive.id,
        hiveName: hive.name,
        icon: "💍",
      });
    }

    // Warning: Weak queen
    if (hive.queenStatus === "weak") {
      alerts.push({
        id: `alert-weak-queen-${hive.id}`,
        title: `ملكة ضعيفة — ${hive.name}`,
        description: "الملكة ضعيفة وقد تحتاج استبدال. راقب نمط وضع البيض",
        severity: "warning",
        hiveId: hive.id,
        hiveName: hive.name,
        icon: "⚠️",
      });
    }

    // Warning: Long time since inspection
    if (daysSinceInspection > 14) {
      alerts.push({
        id: `alert-inspection-overdue-${hive.id}`,
        title: `فحص متأخر — ${hive.name}`,
        description: `لم يتم فحص الخلية منذ ${daysSinceInspection} يوم! الفحص الدوري ضروري كل 7-10 أيام`,
        severity: daysSinceInspection > 21 ? "critical" : "warning",
        hiveId: hive.id,
        hiveName: hive.name,
        icon: "🔍",
      });
    }

    // Info: High production hive
    if (hive.honeyProduction > 12) {
      alerts.push({
        id: `alert-high-prod-${hive.id}`,
        title: `إنتاج ممتاز — ${hive.name}`,
        description: `${hive.honeyProduction} كغ عسل! خلية نشطة — تأكد من وجود مساحة كافية لمنع الازدحام`,
        severity: "info",
        hiveId: hive.id,
        hiveName: hive.name,
        icon: "⭐",
      });
    }
  }

  // Sort by severity
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}
