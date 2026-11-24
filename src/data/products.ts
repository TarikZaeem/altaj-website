export type ProductCategory = 'production' | 'decor';
export type PotProfileType = 'tapered' | 'soft' | 'round' | 'tall' | 'square' | 'stainless';

export interface ProductColorOption {
  id: string;
  nameAr: string;
  nameEn: string;
  hex: string;
  isMetal?: boolean;
}

export interface ProductItem {
  id: string;
  sku: string;
  /** Product names remain in English as in the original Al Taj catalog */
  name: string;
  category: ProductCategory;
  subcategory: 'nursery-pot' | 'decor-plastic' | 'decor-stainless';
  sizeLabel: string;
  dimensionsCm: string;
  capacityLiters: number;
  materialAr: string;
  materialEn: string;
  descriptionAr: string;
  descriptionEn: string;
  /** Editable placeholder wholesale/unit price in SAR (null = "اطلب السعر" / "Request Price") */
  priceSar: number | null;
  minOrderQty: number;
  packQty: number;
  packUnitAr: string;
  packUnitEn: string;
  image: string;
  colors: ProductColorOption[];
  profileType: PotProfileType;
  dimensions3d: {
    topRadius: number;
    bottomRadius: number;
    height: number;
    ribs: number;
    hasPlant?: boolean;
  };
  featured?: boolean;
}

export const COLOR_SWATCHES: Record<string, ProductColorOption> = {
  terracotta: {
    id: 'terracotta',
    nameAr: 'تيراكوتا',
    nameEn: 'Terracotta',
    hex: '#c7623f',
  },
  black: {
    id: 'black',
    nameAr: 'أسود مطفي',
    nameEn: 'Matte Black',
    hex: '#1d2224',
  },
  teal: {
    id: 'teal',
    nameAr: 'فيروزي التاج',
    nameEn: 'Al Taj Teal',
    hex: '#2acbd2',
  },
  white: {
    id: 'white',
    nameAr: 'أبيض عاجي',
    nameEn: 'Off-White',
    hex: '#f3f1ec',
  },
  green: {
    id: 'green',
    nameAr: 'أخضر نباتي',
    nameEn: 'Botanical Green',
    hex: '#2f6e49',
  },
  sand: {
    id: 'sand',
    nameAr: 'رملي دافئ',
    nameEn: 'Warm Sand',
    hex: '#d2c2aa',
  },
  steel: {
    id: 'steel',
    nameAr: 'ستانلس ستيل مصقول',
    nameEn: 'Brushed Stainless',
    hex: '#cfd6da',
    isMetal: true,
  },
  champagneSteel: {
    id: 'champagneSteel',
    nameAr: 'ستانلس ذهبي مطفي',
    nameEn: 'Champagne Steel',
    hex: '#c7b59b',
    isMetal: true,
  },
};

// Generated local studio & factory assets (zero 404 guarantee; swap with final SKU photos before launch)
const IMG_NURSERY = 'src/assets/images/prod_nursery_set_1795437449483.jpg';
const IMG_PRODUCTION = 'src/assets/images/cat_production_supplies_1795437449850.jpg';
const IMG_DECOR = 'src/assets/images/cat_decor_planters_1795437449154.jpg';
const IMG_HERO_POSTER = 'src/assets/images/hero_pots_poster_1795437449315.jpg';

export const PRODUCTS: ProductItem[] = [
  // ==========================================
  // PRODUCTION SUPPLIES (8 Catalog Items)
  // ==========================================
  {
    id: 'prod-55x8',
    sku: 'TJ-NP-055',
    name: 'flower pot 5.5x8 cm',
    category: 'production',
    subcategory: 'nursery-pot',
    sizeLabel: '5.5 × 8 cm',
    dimensionsCm: 'Ø 5.5 × H 8 cm',
    capacityLiters: 0.14,
    materialAr: 'بولي بروبيلين مرن مقاوم للأشعة فوق البنفسجية',
    materialEn: 'UV-stabilized injection-molded polypropylene (PP)',
    descriptionAr:
      'أصيص تشتيل مدمج مثالي للعقل الصغيرة والشتلات المبكرة والنباتات العصارية مع فتحات تصريف سفلية دقيقة.',
    descriptionEn:
      'Compact propagation pot engineered for cuttings, micro-seedlings, and succulents with precision bottom drainage.',
    priceSar: 0.25, // EDITABLE PLACEHOLDER
    minOrderQty: 500,
    packQty: 500,
    packUnitAr: 'كرتون (500 حبة)',
    packUnitEn: 'Carton (500 pcs)',
    image: IMG_NURSERY,
    colors: [COLOR_SWATCHES.black, COLOR_SWATCHES.terracotta],
    profileType: 'tapered',
    dimensions3d: { topRadius: 0.55, bottomRadius: 0.36, height: 0.95, ribs: 2 },
  },
  {
    id: 'prod-7x7',
    sku: 'TJ-NP-070',
    name: 'flower pot 7x7 cm',
    category: 'production',
    subcategory: 'nursery-pot',
    sizeLabel: '7 × 7 cm',
    dimensionsCm: '7 × 7 × H 7 cm',
    capacityLiters: 0.24,
    materialAr: 'بولي بروبيلين عالي المتانة',
    materialEn: 'Heavy-duty nursery polypropylene',
    descriptionAr:
      'أصيص شتلات مربع مقاس 7×7 سم يوفّر أقصى استغلال لمساحة صواني وطاولات المشاتل التجارية.',
    descriptionEn:
      'Square 7×7 cm nursery pot designed to maximize bench density and tray alignment in commercial greenhouses.',
    priceSar: 0.35, // EDITABLE PLACEHOLDER
    minOrderQty: 500,
    packQty: 500,
    packUnitAr: 'كرتون (500 حبة)',
    packUnitEn: 'Carton (500 pcs)',
    image: IMG_PRODUCTION,
    colors: [COLOR_SWATCHES.black, COLOR_SWATCHES.terracotta, COLOR_SWATCHES.green],
    profileType: 'square',
    dimensions3d: { topRadius: 0.62, bottomRadius: 0.45, height: 0.85, ribs: 1 },
  },
  {
    id: 'prod-soft-9',
    sku: 'TJ-SP-090',
    name: 'flower pot soft 9 cm',
    category: 'production',
    subcategory: 'nursery-pot',
    sizeLabel: '9 cm (Soft)',
    dimensionsCm: 'Ø 9 × H 7.5 cm',
    capacityLiters: 0.35,
    materialAr: 'بلاستيك سوفت مرن خفيف الوزن',
    materialEn: 'Flexible thin-wall thermoformed PP',
    descriptionAr:
      'أصيص سوفت مرن مقاس 9 سم سهل الخلع عند تدوير الشتلات دون إتلاف الجذور الحساسة.',
    descriptionEn:
      'Flexible 9 cm soft-wall pot allowing effortless de-potting during transplanting without root disturbance.',
    priceSar: 0.32, // EDITABLE PLACEHOLDER
    minOrderQty: 500,
    packQty: 500,
    packUnitAr: 'ربطة (500 حبة)',
    packUnitEn: 'Bundle (500 pcs)',
    image: IMG_NURSERY,
    colors: [COLOR_SWATCHES.terracotta, COLOR_SWATCHES.black],
    profileType: 'soft',
    dimensions3d: { topRadius: 0.72, bottomRadius: 0.48, height: 0.78, ribs: 3, hasPlant: true },
    featured: true,
  },
  {
    id: 'prod-soft-12',
    sku: 'TJ-SP-120',
    name: 'flower pot soft 12 cm',
    category: 'production',
    subcategory: 'nursery-pot',
    sizeLabel: '12 cm (Soft)',
    dimensionsCm: 'Ø 12 × H 10 cm',
    capacityLiters: 0.75,
    materialAr: 'بلاستيك سوفت مرن مع حافة مقوّاة',
    materialEn: 'Flexible PP with reinforced stacking rim',
    descriptionAr:
      'المقاس الأكثر طلباً للمشاتل لنمو الزهور الموسمية والأعشاب العطرية مع حافة علوية تسهل الرص الآلي.',
    descriptionEn:
      'Nursery workhorse 12 cm soft pot built for seasonal bedding plants and herbs with a smooth auto-destacking rim.',
    priceSar: 0.48, // EDITABLE PLACEHOLDER
    minOrderQty: 300,
    packQty: 300,
    packUnitAr: 'ربطة (300 حبة)',
    packUnitEn: 'Bundle (300 pcs)',
    image: IMG_NURSERY,
    colors: [COLOR_SWATCHES.terracotta, COLOR_SWATCHES.black, COLOR_SWATCHES.teal],
    profileType: 'soft',
    dimensions3d: { topRadius: 0.85, bottomRadius: 0.56, height: 0.92, ribs: 4 },
  },
  {
    id: 'prod-soft-15',
    sku: 'TJ-SP-150',
    name: 'flower pot soft 15 cm',
    category: 'production',
    subcategory: 'nursery-pot',
    sizeLabel: '15 cm (Soft)',
    dimensionsCm: 'Ø 15 × H 12.5 cm',
    capacityLiters: 1.5,
    materialAr: 'بلاستيك سوفت مرن عالي التحمل الحراري',
    materialEn: 'Heat-tolerant flexible nursery PP',
    descriptionAr:
      'أصيص سوفت 15 سم يتحمل حرارة الصيف في المملكة مع ثقوب تهوية وتصريف مزدوجة للجذور.',
    descriptionEn:
      '15 cm soft agricultural pot engineered for Saudi summer heat with dual-level drainage and root aeration.',
    priceSar: 0.72, // EDITABLE PLACEHOLDER
    minOrderQty: 250,
    packQty: 250,
    packUnitAr: 'ربطة (250 حبة)',
    packUnitEn: 'Bundle (250 pcs)',
    image: IMG_PRODUCTION,
    colors: [COLOR_SWATCHES.terracotta, COLOR_SWATCHES.black],
    profileType: 'soft',
    dimensions3d: { topRadius: 0.98, bottomRadius: 0.66, height: 1.05, ribs: 4 },
  },
  {
    id: 'prod-12',
    sku: 'TJ-RP-120',
    name: 'flower pot 12 cm',
    category: 'production',
    subcategory: 'nursery-pot',
    sizeLabel: '12 cm (Rigid)',
    dimensionsCm: 'Ø 12 × H 10.5 cm',
    capacityLiters: 0.85,
    materialAr: 'بولي بروبيلين صلب بسمك جدار إضافي',
    materialEn: 'Rigid heavy-wall injection-molded PP',
    descriptionAr:
      'أصيص زراعي صلب مقاس 12 سم مثالي للبيع المباشر في المراكز الزراعية ونباتات الزينة الداخلية.',
    descriptionEn:
      'Rigid 12 cm retail-ready nursery pot with thick walls ideal for indoor ornamentals and garden center display.',
    priceSar: 0.95, // EDITABLE PLACEHOLDER
    minOrderQty: 200,
    packQty: 200,
    packUnitAr: 'كرتون (200 حبة)',
    packUnitEn: 'Carton (200 pcs)',
    image: IMG_NURSERY,
    colors: [COLOR_SWATCHES.terracotta, COLOR_SWATCHES.teal, COLOR_SWATCHES.black],
    profileType: 'tapered',
    dimensions3d: { topRadius: 0.86, bottomRadius: 0.58, height: 0.98, ribs: 2, hasPlant: true },
    featured: true,
  },
  {
    id: 'prod-16',
    sku: 'TJ-RP-160',
    name: 'flower pot 16 cm',
    category: 'production',
    subcategory: 'nursery-pot',
    sizeLabel: '16 cm (Rigid)',
    dimensionsCm: 'Ø 16 × H 14 cm',
    capacityLiters: 2.1,
    materialAr: 'بولي بروبيلين صلب مقاوم للصدمات',
    materialEn: 'Impact-resistant virgin/recycled PP blend',
    descriptionAr:
      'أصيص زراعي 16 سم متوسط الحجم للشجيرات الصغيرة ونباتات التظليل مع حافة عريضة مريحة للحمل.',
    descriptionEn:
      'Mid-size 16 cm rigid container for young shrubs and foliage plants featuring an ergonomic wide carrying lip.',
    priceSar: 1.65, // EDITABLE PLACEHOLDER
    minOrderQty: 150,
    packQty: 150,
    packUnitAr: 'ربطة (150 حبة)',
    packUnitEn: 'Bundle (150 pcs)',
    image: IMG_NURSERY,
    colors: [COLOR_SWATCHES.terracotta, COLOR_SWATCHES.black, COLOR_SWATCHES.green],
    profileType: 'tapered',
    dimensions3d: { topRadius: 1.05, bottomRadius: 0.72, height: 1.18, ribs: 3 },
  },
  {
    id: 'prod-35',
    sku: 'TJ-AP-350',
    name: 'plant pot 35 cm',
    category: 'production',
    subcategory: 'nursery-pot',
    sizeLabel: '35 cm (Heavy)',
    dimensionsCm: 'Ø 35 × H 30 cm',
    capacityLiters: 20,
    materialAr: 'بولي إيثيلين عالي الكثافة (HDPE) مع حماية UV',
    materialEn: 'UV-protected heavy-duty HDPE agricultural grade',
    descriptionAr:
      'حوض زراعي كبير مقاس 35 سم مخصص لأشجار الزينة، الحمضيات، والزيتون مع مقابض حمل مدمجة وثقوب تصريف متعددة.',
    descriptionEn:
      'Large 35 cm heavy-duty agricultural container for ornamental trees, citrus, and olives with reinforced carry rim.',
    priceSar: 14.5, // EDITABLE PLACEHOLDER
    minOrderQty: 25,
    packQty: 25,
    packUnitAr: 'بالة (25 حبة)',
    packUnitEn: 'Stack (25 pcs)',
    image: IMG_PRODUCTION,
    colors: [COLOR_SWATCHES.black, COLOR_SWATCHES.terracotta, COLOR_SWATCHES.green],
    profileType: 'tapered',
    dimensions3d: { topRadius: 1.32, bottomRadius: 0.92, height: 1.38, ribs: 5, hasPlant: true },
    featured: true,
  },

  // ==========================================
  // DECORATIVE PLANTERS (10 Plastic & Stainless Variants)
  // ==========================================
  {
    id: 'dec-fluted-40',
    sku: 'TJ-DC-F40',
    name: 'Al-Yamamah Fluted Cylinder 40 cm',
    category: 'decor',
    subcategory: 'decor-plastic',
    sizeLabel: '40 × 45 cm',
    dimensionsCm: 'Ø 40 × H 45 cm',
    capacityLiters: 42,
    materialAr: 'بلاستيك هندسي مطفي مضلع مقاوم للشمس',
    materialEn: 'Architectural matte fluted UV-resistant polymer',
    descriptionAr:
      'حوض ديكور مضلع بتصميم معماري هادئ يناسب المداخل والحدائق المنزلية والمشاريع التجارية.',
    descriptionEn:
      'Architectural fluted matte planter crafted for residential courtyards, hospitality lobbies, and terraces.',
    priceSar: 68, // EDITABLE PLACEHOLDER
    minOrderQty: 10,
    packQty: 10,
    packUnitAr: 'طقم (10 أحواض)',
    packUnitEn: 'Pack (10 pcs)',
    image: IMG_DECOR,
    colors: [COLOR_SWATCHES.white, COLOR_SWATCHES.teal, COLOR_SWATCHES.sand],
    profileType: 'round',
    dimensions3d: { topRadius: 1.02, bottomRadius: 0.92, height: 1.32, ribs: 8, hasPlant: true },
    featured: true,
  },
  {
    id: 'dec-tall-taper-55',
    sku: 'TJ-DC-T55',
    name: 'Najd Tall Tapered Planter 55 cm',
    category: 'decor',
    subcategory: 'decor-plastic',
    sizeLabel: '36 × 55 cm',
    dimensionsCm: 'Ø 36 × H 55 cm',
    capacityLiters: 38,
    materialAr: 'بولي بروبيلين مزدوج الجدار بلمسة ساتان',
    materialEn: 'Double-wall satin-finish architectural PP',
    descriptionAr:
      'حوض طويل بانسيابية ناعمة يعزل حرارة الجذور في المساحات الخارجية المفتوحة والمجالس.',
    descriptionEn:
      'Slender tall tapered planter with double-wall thermal insulation protecting roots in sunlit outdoor lounges.',
    priceSar: 92, // EDITABLE PLACEHOLDER
    minOrderQty: 8,
    packQty: 8,
    packUnitAr: 'كرتون (8 أحواض)',
    packUnitEn: 'Carton (8 pcs)',
    image: IMG_DECOR,
    colors: [COLOR_SWATCHES.teal, COLOR_SWATCHES.terracotta, COLOR_SWATCHES.black],
    profileType: 'tall',
    dimensions3d: { topRadius: 0.9, bottomRadius: 0.64, height: 1.68, ribs: 0, hasPlant: true },
    featured: true,
  },
  {
    id: 'dec-steel-cyl-45',
    sku: 'TJ-SS-C45',
    name: 'Al-Olaya Brushed Stainless Cylinder 45 cm',
    category: 'decor',
    subcategory: 'decor-stainless',
    sizeLabel: '45 × 45 cm',
    dimensionsCm: 'Ø 45 × H 45 cm',
    capacityLiters: 54,
    materialAr: 'ستانلس ستيل 304 مقاوم للصدأ ببطانة داخلية',
    materialEn: 'Grade 304 brushed stainless steel with removable liner',
    descriptionAr:
      'حوض ستانلس ستيل مصقول بلمسة فاخرة مخصص للأبراج الإدارية والفنادق والفلل العصرية.',
    descriptionEn:
      'Precision-brushed 304 stainless steel cylinder built for corporate towers, luxury hotels, and modern villas.',
    priceSar: null, // Request Quote
    minOrderQty: 4,
    packQty: 4,
    packUnitAr: 'طقم (4 أحواض)',
    packUnitEn: 'Set (4 pcs)',
    image: IMG_DECOR,
    colors: [COLOR_SWATCHES.steel, COLOR_SWATCHES.champagneSteel],
    profileType: 'stainless',
    dimensions3d: { topRadius: 1.08, bottomRadius: 1.08, height: 1.25, ribs: 0, hasPlant: true },
    featured: true,
  },
  {
    id: 'dec-round-bowl-38',
    sku: 'TJ-DC-B38',
    name: 'Diriyah Soft Bowl Planter 38 cm',
    category: 'decor',
    subcategory: 'decor-plastic',
    sizeLabel: '38 × 24 cm',
    dimensionsCm: 'Ø 38 × H 24 cm',
    capacityLiters: 18,
    materialAr: 'بلاستيك سميك بملمس الحجر الطبيعي',
    materialEn: 'Stone-textured thick-wall polymer',
    descriptionAr:
      'حوض كروي منخفض مثالي لتنسيقات الصباريات والنباتات العصارية فوق الطاولات والمداخل.',
    descriptionEn:
      'Low organic bowl planter ideal for succulent arrangements, tabletop centerpieces, and terrace accents.',
    priceSar: 49, // EDITABLE PLACEHOLDER
    minOrderQty: 12,
    packQty: 12,
    packUnitAr: 'كرتون (12 حبة)',
    packUnitEn: 'Carton (12 pcs)',
    image: IMG_HERO_POSTER,
    colors: [COLOR_SWATCHES.terracotta, COLOR_SWATCHES.sand, COLOR_SWATCHES.white],
    profileType: 'round',
    dimensions3d: { topRadius: 1.14, bottomRadius: 0.68, height: 0.78, ribs: 0, hasPlant: true },
  },
  {
    id: 'dec-square-cube-40',
    sku: 'TJ-DC-Q40',
    name: 'Qiddiya Architectural Cube 40 cm',
    category: 'decor',
    subcategory: 'decor-plastic',
    sizeLabel: '40 × 40 cm',
    dimensionsCm: '40 × 40 × H 40 cm',
    capacityLiters: 52,
    materialAr: 'بوليمر معماري مقاوم للصدمات والبهتان',
    materialEn: 'Fade-proof architectural matte polymer',
    descriptionAr:
      'حوض مربع بخطوط هندسية حادة وحواف ناعمة لصفوف النباتات الحدودية في الممرات والمطاعم.',
    descriptionEn:
      'Crisp geometric cube planter with softly radiused corners for architectural borders and patio walkways.',
    priceSar: 74, // EDITABLE PLACEHOLDER
    minOrderQty: 8,
    packQty: 8,
    packUnitAr: 'كرتون (8 أحواض)',
    packUnitEn: 'Carton (8 pcs)',
    image: IMG_HERO_POSTER,
    colors: [COLOR_SWATCHES.black, COLOR_SWATCHES.teal, COLOR_SWATCHES.white],
    profileType: 'square',
    dimensions3d: { topRadius: 0.96, bottomRadius: 0.88, height: 1.1, ribs: 0 },
  },
  {
    id: 'dec-steel-tall-70',
    sku: 'TJ-SS-T70',
    name: 'Kingdom Tower Steel Planter 70 cm',
    category: 'decor',
    subcategory: 'decor-stainless',
    sizeLabel: '38 × 70 cm',
    dimensionsCm: 'Ø 38 × H 70 cm',
    capacityLiters: 64,
    materialAr: 'ستانلس ستيل 304 سماكة 1.5 مم مع طبقة حماية',
    materialEn: '1.5 mm Grade 304 stainless steel with anti-fingerprint coat',
    descriptionAr:
      'حوض ستانلس طويل الارتفاع للمشاريع الفاخرة والمجمعات التجارية مع حوض داخلي سهل التنظيف.',
    descriptionEn:
      'Monumental 70 cm brushed steel planter engineered for luxury commercial atriums and grand entrances.',
    priceSar: null, // Request Quote
    minOrderQty: 2,
    packQty: 2,
    packUnitAr: 'زوج (2 حوض)',
    packUnitEn: 'Pair (2 pcs)',
    image: IMG_DECOR,
    colors: [COLOR_SWATCHES.steel, COLOR_SWATCHES.champagneSteel],
    profileType: 'stainless',
    dimensions3d: { topRadius: 0.88, bottomRadius: 0.8, height: 1.78, ribs: 1, hasPlant: true },
  },
  {
    id: 'dec-ribbed-vase-32',
    sku: 'TJ-DC-V32',
    name: 'Tuwaiq Ribbed Dome Pot 32 cm',
    category: 'decor',
    subcategory: 'decor-plastic',
    sizeLabel: '32 × 30 cm',
    dimensionsCm: 'Ø 32 × H 30 cm',
    capacityLiters: 19,
    materialAr: 'بلاستيك بوليمر بلمسة خزفية ناعمة',
    materialEn: 'Ceramic-feel smooth injection-molded polymer',
    descriptionAr:
      'حوض ديكور بتضليع أفقي ناعم وملمس يحاكي الخزف مع خفة وزن البلاستيك ومقاومته للكسر.',
    descriptionEn:
      'Gently ribbed dome planter offering ceramic tactile warmth with shatterproof lightweight durability.',
    priceSar: 42, // EDITABLE PLACEHOLDER
    minOrderQty: 12,
    packQty: 12,
    packUnitAr: 'كرتون (12 حبة)',
    packUnitEn: 'Carton (12 pcs)',
    image: IMG_HERO_POSTER,
    colors: [COLOR_SWATCHES.green, COLOR_SWATCHES.white, COLOR_SWATCHES.terracotta],
    profileType: 'round',
    dimensions3d: { topRadius: 0.92, bottomRadius: 0.72, height: 1.02, ribs: 6, hasPlant: true },
  },
  {
    id: 'dec-selfwater-28',
    sku: 'TJ-DC-S28',
    name: 'Oasis Self-Watering Pot 28 cm',
    category: 'decor',
    subcategory: 'decor-plastic',
    sizeLabel: '28 × 26 cm',
    dimensionsCm: 'Ø 28 × H 26 cm',
    capacityLiters: 12,
    materialAr: 'بلاستيك بولي بروبيلين نقي مع خزان ري ذاتي',
    materialEn: 'Virgin PP with integrated sub-irrigation reservoir',
    descriptionAr:
      'حوض ديكور مزود بخزان مياه سفلي ومؤشر منسوب يحافظ على رطوبة النبات لفترات أطول.',
    descriptionEn:
      'Self-watering interior planter with hidden lower reservoir and level indicator for low-maintenance care.',
    priceSar: 36, // EDITABLE PLACEHOLDER
    minOrderQty: 16,
    packQty: 16,
    packUnitAr: 'كرتون (16 حبة)',
    packUnitEn: 'Carton (16 pcs)',
    image: IMG_HERO_POSTER,
    colors: [COLOR_SWATCHES.white, COLOR_SWATCHES.teal, COLOR_SWATCHES.green],
    profileType: 'tapered',
    dimensions3d: { topRadius: 0.88, bottomRadius: 0.68, height: 1.05, ribs: 1, hasPlant: true },
  },
  {
    id: 'dec-steel-cube-50',
    sku: 'TJ-SS-Q50',
    name: 'Riyadh Mirror-Edge Steel Box 50 cm',
    category: 'decor',
    subcategory: 'decor-stainless',
    sizeLabel: '50 × 50 cm',
    dimensionsCm: '50 × 50 × H 50 cm',
    capacityLiters: 98,
    materialAr: 'ستانلس ستيل 304 ملحوم بالليزر غير مرئي',
    materialEn: 'Seamless laser-welded Grade 304 stainless steel',
    descriptionAr:
      'صندوق نباتات فاخر من الستانلس ستيل مع قواعد رفع خفية لحماية الأرضيات الرخامية.',
    descriptionEn:
      'Architectural stainless steel cube planter with concealed leveling glides to protect marble flooring.',
    priceSar: null, // Request Quote
    minOrderQty: 2,
    packQty: 2,
    packUnitAr: 'طقم (2 حوض)',
    packUnitEn: 'Pair (2 pcs)',
    image: IMG_DECOR,
    colors: [COLOR_SWATCHES.steel, COLOR_SWATCHES.champagneSteel],
    profileType: 'stainless',
    dimensions3d: { topRadius: 1.1, bottomRadius: 1.1, height: 1.1, ribs: 0 },
  },
  {
    id: 'dec-terrace-trough-80',
    sku: 'TJ-DC-R80',
    name: 'Al-Nakheel Partition Planter 80 cm',
    category: 'decor',
    subcategory: 'decor-plastic',
    sizeLabel: '80 × 32 × 45 cm',
    dimensionsCm: 'L 80 × W 32 × H 45 cm',
    capacityLiters: 90,
    materialAr: 'بوليمر مقوى للأحواض الطولية والفواصل',
    materialEn: 'Reinforced structural UV-stabilized polymer',
    descriptionAr:
      'حوض طولي أنيق لفصل جلسات الكافيهات والحدائق والأسطح مع ثبات عالٍ ومقاومة لأشعة الشمس.',
    descriptionEn:
      'Elongated privacy divider planter crafted for hospitality terraces, rooftop gardens, and walkway framing.',
    priceSar: 145, // EDITABLE PLACEHOLDER
    minOrderQty: 4,
    packQty: 4,
    packUnitAr: 'بالة (4 أحواض)',
    packUnitEn: 'Pack (4 pcs)',
    image: IMG_DECOR,
    colors: [COLOR_SWATCHES.black, COLOR_SWATCHES.sand, COLOR_SWATCHES.teal],
    profileType: 'square',
    dimensions3d: { topRadius: 1.15, bottomRadius: 1.02, height: 1.0, ribs: 2 },
  },
];
