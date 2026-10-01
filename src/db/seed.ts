import "dotenv/config";
import { hashSync } from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db, pool } from "./index";
import {
  categories,
  favorites,
  notifications,
  professionRequests,
  professions,
  ratings,
  sessions,
  users,
} from "./schema";

async function seed() {
  const existing = await db.select({ id: categories.id }).from(categories).limit(1);
  if (existing.length > 0) {
    console.log("Database already seeded — skipping.");
    return;
  }

  // ─── الأدمن الأساسي ─────────────────────────────
  const adminPassword = process.env.ADMIN_PASSWORD || "wael1234";
  const [admin] = await db
    .insert(users)
    .values({
      name: "وائل محمود",
      username: "wael",
      phone: "01000000001",
      email: "admin@ganzour.app",
      passwordHash: hashSync(adminPassword, 10),
      role: "admin",
    })
    .returning();

  // ─── أعضاء تجريبيون ─────────────────────────────
  const memberNames = [
    ["أحمد سمير", "01112345601"],
    ["محمد فتحي", "01212345602"],
    ["هدى كمال", "01012345603"],
    ["إبراهيم الدسوقي", "01512345604"],
    ["سلمى طارق", "01112345605"],
    ["يوسف رمضان", "01212345606"],
    ["فاطمة عاشور", "01012345607"],
    ["عمر الجندي", "01512345608"],
    ["محمود الحناوي", "01112345609"],
    ["نورهان صلاح", "01212345610"],
    ["مصطفى بدر", "01012345611"],
    ["شيماء قطب", "01512345612"],
  ] as const;

  const members = [];
  for (const [name, phone] of memberNames) {
    const [u] = await db
      .insert(users)
      .values({ name, phone, passwordHash: hashSync("demo-member-" + phone, 10), role: "member" })
      .returning();
    members.push(u);
  }

  // ─── الأقسام ────────────────────────────────────
  const catDefs = [
    ["الأطباء", "stethoscope", 1],
    ["العيادات", "hospital", 2],
    ["الصيدليات", "pill", 3],
    ["الحرف والمهن", "wrench", 4],
    ["المحلات والأنشطة", "store", 5],
    ["خدمات السيارات", "car", 6],
    ["الخدمات المنزلية", "home", 7],
    ["الخدمات المهنية", "briefcase", 8],
  ] as const;

  const cats: Record<string, number> = {};
  for (const [name, iconKey, sortOrder] of catDefs) {
    const [c] = await db
      .insert(categories)
      .values({ name, iconKey, sortOrder })
      .returning();
    cats[name] = c.id;
  }

  // ─── المهن المعتمدة ─────────────────────────────
  const G = { lat: 30.4325, lng: 30.9568 }; // مركز قرية جنزور التقريبي
  const prof = (
    ownerName: string,
    title: string,
    cat: string,
    phone: string,
    opts: {
      whatsapp?: string | null;
      address?: string;
      description?: string;
      workingHours?: string;
      d?: [number, number]; // إزاحة عن مركز القرية
    } = {}
  ) => ({
    ownerName,
    title,
    categoryId: cats[cat],
    phone,
    whatsapp: opts.whatsapp === null ? null : opts.whatsapp ?? phone,
    address: opts.address ?? "جنزور — مركز بركة السبع، المنوفية",
    description: opts.description ?? "",
    workingHours: opts.workingHours ?? "",
    mapUrl: null,
    lat: G.lat + (opts.d?.[0] ?? 0),
    lng: G.lng + (opts.d?.[1] ?? 0),
    imageUrl: null,
    status: "approved" as const,
  });

  const seedProfessions = [
    prof("د. أحمد محمد عبدالعزيز", "طبيب باطنة وجهاز هضمي", "الأطباء", "01001234501", {
      address: "شارع المدرسة الإعدادية — أمام الوحدة الصحية",
      description: "كشف وعلاج أمراض الباطنة والجهاز الهضمي، متابعة الضغط والسكر، عمل موجات صوتية بالعيادة.",
      workingHours: "السبت – الأربعاء: 5 مساءً – 9 مساءً",
      d: [0.0012, 0.0021],
    }),
    prof("د. منى الشاذلي", "طبيبة أطفال وحديثي الولادة", "الأطباء", "01101234502", {
      address: "شارع المسجد الكبير — بجوار الصيدلية",
      description: "متابعة نمو الأطفال، تطعيمات، علاج حساسية الصدر والربو عند الأطفال.",
      workingHours: "يوميًا عدا الجمعة: 4 عصرًا – 8 مساءً",
      d: [-0.0018, 0.0011],
    }),
    prof("د. خالد سمير", "طبيب عظام ومفاصل", "الأطباء", "01201234503", {
      whatsapp: null,
      address: "مدخل القرية — عمارة الحاج سعد",
      description: "تشخيص وعلاج الكسور وخشونة المفاصل وآلام العمود الفقري.",
      workingHours: "الأحد والثلاثاء والخميس: 6 مساءً – 9 مساءً",
      d: [0.003, -0.0015],
    }),
    prof("د. سارة إبراهيم", "طبيبة أسنان", "الأطباء", "01501234504", {
      address: "شارع السوق — فوق مكتبة النور",
      description: "حشو وعلاج جذور الأسنان، تركيبات، تجميل وتنظيف الأسنان.",
      workingHours: "السبت – الخميس: 10 صباحًا – 2 ظهرًا",
      d: [0.0008, 0.003],
    }),
    prof("مجمع جنزور التخصصي", "عيادات تخصصية متكاملة", "العيادات", "01001234505", {
      address: "الطريق الرئيسي — أمام موقف السيارات",
      description: "عيادات باطنة وأطفال ونساء وعظام وأسنان تحت سقف واحد، مع معمل تحاليل.",
      workingHours: "يوميًا: 9 صباحًا – 10 مساءً",
      d: [0.0022, 0.0008],
    }),
    prof("مركز النور الطبي", "عيادة نساء وتوليد", "العيادات", "01101234506", {
      address: "شارع الوحدة المحلية",
      description: "متابعة الحمل والولادة، سونار رباعي الأبعاد، تنظيم الأسرة.",
      workingHours: "السبت – الأربعاء: 11 صباحًا – 7 مساءً",
      d: [-0.0025, -0.002],
    }),
    prof("صيدلية الشفاء", "صيدلية", "الصيدليات", "01201234507", {
      address: "ميدان القرية الرئيسي",
      description: "جميع الأدوية والمستلزمات الطبية، خدمة توصيل للمنازل داخل القرية.",
      workingHours: "يوميًا: 8 صباحًا – 12 منتصف الليل",
      d: [0.0005, 0.0005],
    }),
    prof("صيدلية جنزور", "صيدلية — خدمة 24 ساعة", "الصيدليات", "01501234508", {
      address: "مدخل القرية البحري",
      description: "صيدلية ليلية، ألبان أطفال، مستحضرات تجميل وعناية.",
      workingHours: "24 ساعة",
      d: [-0.001, 0.0026],
    }),
    prof("أسطى محمد عبدالله", "كهربائي منازل ومباني", "الحرف والمهن", "01001234509", {
      address: "حارة العمدة",
      description: "تأسيس وتشطيب كهرباء المنازل، إصلاح الأعطال، تركيب أطباق دش وكاميرات.",
      workingHours: "يوميًا: 8 صباحًا – 8 مساءً",
      d: [0.0016, -0.0012],
    }),
    prof("الحاج محمود عيد", "سباك صحي وتأسيس", "الحرف والمهن", "01101234510", {
      address: "شارع البحر",
      description: "تأسيس السباكة الكاملة، كشف تسريبات المياه، تركيب أدوات صحية.",
      workingHours: "يوميًا عدا الجمعة",
      d: [-0.0021, 0.0004],
    }),
    prof("أسطى رمضان السيد", "نجار موبيليا وأبواب", "الحرف والمهن", "01201234511", {
      whatsapp: null,
      address: "ورشته بجوار الجمعية الزراعية",
      description: "تصنيع غرف النوم والمطابخ والأبواب والشبابيك الخشبية، إصلاح وصيانة.",
      workingHours: "السبت – الخميس: 9 صباحًا – 6 مساءً",
      d: [0.0028, 0.0019],
    }),
    prof("حسن فاروق", "حداد ولحام وأبواب حديد", "الحرف والمهن", "01501234512", {
      address: "طريق المقابر",
      description: "أبواب وشبابيك حديد، أسوار، مشغولات حديدية، لحام متنقل.",
      workingHours: "يوميًا: 8 صباحًا – 5 مساءً",
      d: [0.0033, 0.0028],
    }),
    prof("سوبر ماركت جنزور", "بقالة وتموين ومنظفات", "المحلات والأنشطة", "01001234513", {
      address: "شارع السوق الرئيسي",
      description: "جميع السلع الغذائية والتموينية والخضروات الطازجة، أسعار الجملة.",
      workingHours: "يوميًا: 7 صباحًا – 1 صباحًا",
      d: [0.0003, -0.0006],
    }),
    prof("مخبز البركة", "مخبز بلدي ونصف آلي", "المحلات والأنشطة", "01101234514", {
      address: "أول شارع المدرسة",
      description: "خبز بلدي طازج على مدار اليوم، فطير وفينو ومعجنات.",
      workingHours: "يوميًا: 5 صباحًا – 10 مساءً",
      d: [-0.0014, -0.0018],
    }),
    prof("ورشة النصر للسيارات", "ميكانيكي سيارات", "خدمات السيارات", "01201234515", {
      address: "الطريق السريع — مدخل القرية",
      description: "صيانة محركات، كشف أعطال بالكمبيوتر، تغيير زيوت وفلاتر.",
      workingHours: "يوميًا عدا الجمعة: 8 صباحًا – 9 مساءً",
      d: [0.0036, 0.001],
    }),
    prof("كهرباء الأمان للسيارات", "كهربائي سيارات", "خدمات السيارات", "01501234516", {
      whatsapp: null,
      address: "شارع الترعة",
      description: "إصلاح دينامو ومارش، بطاريات، تكييف سيارات، إنذار وسماعات.",
      workingHours: "يوميًا: 9 صباحًا – 8 مساءً",
      d: [-0.0028, 0.0022],
    }),
    prof("صابر أنور", "دهانات ونقاشة", "الخدمات المنزلية", "01001234517", {
      address: "متنقل داخل القرية",
      description: "دهانات حديثة وورق حائط ومعالجات رطوبة، معاينة مجانية.",
      workingHours: "بالاتفاق الهاتفي",
      d: [0.001, 0.0015],
    }),
    prof("مكتب الفتح للمحاسبة", "محاسب قانوني وخدمات ضريبية", "الخدمات المهنية", "01101234518", {
      address: "عمارة البريد — الدور الثاني",
      description: "إعداد الإقرارات الضريبية، سجلات تجارية، خدمات التراخيص.",
      workingHours: "السبت – الخميس: 10 صباحًا – 4 عصرًا",
      d: [0.0019, -0.0024],
    }),
    prof("مكتب العدل للخدمات العقارية", "وساطة عقارية وتوثيق عقود", "الخدمات المهنية", "01201234519", {
      address: "ميدان القرية — بجوار الوحدة المحلية",
      description: "بيع وشراء وإيجار الأراضي والعقارات، توثيق العقود والاستشارات.",
      workingHours: "يوميًا: 9 صباحًا – 9 مساءً",
      d: [-0.0007, -0.0029],
    }),
  ];

  const inserted = await db.insert(professions).values(seedProfessions).returning();

  // تقييمات مبدئية
  const raterPool = members;
  let rIdx = 0;
  for (const p of inserted) {
    const count = (p.id % 3) + 2;
    for (let i = 0; i < count; i++) {
      const rater = raterPool[rIdx++ % raterPool.length];
      const stars = 4 + ((p.id + i) % 2); // 4 أو 5
      await db
        .insert(ratings)
        .values({ userId: rater.id, professionId: p.id, stars })
        .onConflictDoNothing();
    }
  }

  // ─── طلبات قيد المراجعة ─────────────────────────
  const req1 = await db
    .insert(professionRequests)
    .values({
      userId: members[0].id,
      ownerName: "أسطى سيد عبده",
      title: "فني تركيب أطباق دش وشبكات",
      categoryId: cats["الحرف والمهن"],
      phone: "01012340001",
      whatsapp: "01012340001",
      address: "حارة السوق — جنزور",
      description: "تركيب وصيانة أطباق الدش، تأسيس شبكات إنترنت منزلية.",
      workingHours: "يوميًا من 9 صباحًا حتى 7 مساءً",
      status: "pending",
    })
    .returning();

  const req2 = await db
    .insert(professionRequests)
    .values({
      userId: members[3].id,
      ownerName: "محل الخير للأعلاف",
      title: "بيع أعلاف ودواجن",
      categoryId: cats["المحلات والأنشطة"],
      phone: "01112340002",
      whatsapp: null,
      address: "طريق الجمعية الزراعية",
      description: "أعلاف ماشية ودواجن بأسعار الجملة، توصيل متاح.",
      workingHours: "من 7 صباحًا حتى 9 مساءً",
      status: "pending",
    })
    .returning();

  for (const r of [...req1, ...req2]) {
    await db.insert(notifications).values({
      userId: admin.id,
      title: "🔔 طلب مهنة جديد",
      body: `قام أحد الأعضاء بإرسال طلب لإضافة مهنة جديدة: ${r.title}`,
      kind: "request",
    });
  }

  // إشعار ترحيب للأدمن
  await db.insert(notifications).values({
    userId: admin.id,
    title: "مرحبًا بك في لوحة التحكم 👋",
    body: "تم تجهيز الدليل المهني لقرية جنزور. يمكنك الآن مراجعة الطلبات وإدارة المحتوى.",
    kind: "info",
  });

  // مفضلة تجريبية
  await db.insert(favorites).values({ userId: members[0].id, professionId: inserted[0].id });

  console.log("Seed complete:", {
    admin: admin.username,
    members: members.length,
    categories: Object.keys(cats).length,
    professions: inserted.length,
    requests: 2,
  });
}

seed()
  .then(() => pool.end())
  .catch(async (err) => {
    console.error(err);
    process.exitCode = 1;
  });
