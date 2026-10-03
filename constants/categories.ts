export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  subcategories: Subcategory[];
  order: number;
  searchCount?: number;
}

export interface Subcategory {
  name: string;
  slug: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'ev-tadilat',
    name: 'Ev & Tadilat',
    slug: 'ev-tadilat',
    icon: 'home-outline',
    color: '#F97316',
    order: 1,
    subcategories: [
      { name: 'Marangoz', slug: 'marangoz' },
      { name: 'Boyacı', slug: 'boyaci' },
      { name: 'Tesisatçı', slug: 'tesisatci' },
      { name: 'Elektrikçi', slug: 'elektrikci' },
      { name: 'Kombi & Klima', slug: 'kombi-klima' },
      { name: 'Cam & Çerçeve', slug: 'cam-cerceve' },
      { name: 'Çilingir', slug: 'cilingir' },
      { name: 'Temizlik', slug: 'temizlik' },
    ],
  },
  {
    id: 'yeme-icme',
    name: 'Yeme & İçme',
    slug: 'yeme-icme',
    icon: 'silverware-fork-knife',
    color: '#EF4444',
    order: 2,
    subcategories: [
      { name: 'Restoran', slug: 'restoran' },
      { name: 'Kasap', slug: 'kasap' },
      { name: 'Fırın', slug: 'firin' },
      { name: 'Pastane', slug: 'pastane' },
      { name: 'Manav', slug: 'manav' },
      { name: 'Kuruyemişçi', slug: 'kuruyemisci' },
      { name: 'Cafe', slug: 'cafe' },
      { name: 'Dondurma', slug: 'dondurma' },
    ],
  },
  {
    id: 'saglik',
    name: 'Sağlık',
    slug: 'saglik',
    icon: 'hospital-box-outline',
    color: '#10B981',
    order: 3,
    subcategories: [
      { name: 'Doktor', slug: 'doktor' },
      { name: 'Diş Hekimi', slug: 'dis-hekimi' },
      { name: 'Eczane', slug: 'eczane' },
      { name: 'Optik', slug: 'optik' },
      { name: 'Veteriner', slug: 'veteriner' },
      { name: 'Psikolog', slug: 'psikolog' },
      { name: 'Fizyoterapi', slug: 'fizyoterapi' },
    ],
  },
  {
    id: 'egitim',
    name: 'Eğitim',
    slug: 'egitim',
    icon: 'school-outline',
    color: '#3B82F6',
    order: 4,
    subcategories: [
      { name: 'Özel Ders', slug: 'ozel-ders' },
      { name: 'Dershane', slug: 'dershane' },
      { name: 'Kreş', slug: 'kres' },
      { name: 'Müzik Kursu', slug: 'muzik-kursu' },
      { name: 'Sürücü Kursu', slug: 'surucu-kursu' },
      { name: 'Dil Kursu', slug: 'dil-kursu' },
    ],
  },
  {
    id: 'oto-ulasim',
    name: 'Oto & Ulaşım',
    slug: 'oto-ulasim',
    icon: 'car-outline',
    color: '#6366F1',
    order: 5,
    subcategories: [
      { name: 'Oto Tamirci', slug: 'oto-tamirci' },
      { name: 'Lastikçi', slug: 'lastikci' },
      { name: 'Oto Yıkama', slug: 'oto-yikama' },
      { name: 'Oto Elektrik', slug: 'oto-elektrik' },
      { name: 'Nakliyat', slug: 'nakliyat' },
      { name: 'Rent a Car', slug: 'rent-a-car' },
    ],
  },
  {
    id: 'guzellik-bakim',
    name: 'Güzellik & Bakım',
    slug: 'guzellik-bakim',
    icon: 'content-cut',
    color: '#EC4899',
    order: 6,
    subcategories: [
      { name: 'Erkek Kuaförü', slug: 'erkek-kuaforu' },
      { name: 'Kadın Kuaförü', slug: 'kadin-kuaforu' },
      { name: 'Güzellik Salonu', slug: 'guzellik-salonu' },
      { name: 'Berber', slug: 'berber' },
      { name: 'Cilt Bakım', slug: 'cilt-bakim' },
    ],
  },
  {
    id: 'giyim-alisveris',
    name: 'Giyim & Alışveriş',
    slug: 'giyim-alisveris',
    icon: 'shopping-outline',
    color: '#8B5CF6',
    order: 7,
    subcategories: [
      { name: 'Giyim Mağazası', slug: 'giyim-magazasi' },
      { name: 'Terzi', slug: 'terzi' },
      { name: 'Kuru Temizleme', slug: 'kuru-temizleme' },
      { name: 'Ayakkabıcı', slug: 'ayakkabici' },
      { name: 'Kırtasiye', slug: 'kirtasiye' },
    ],
  },
  {
    id: 'teknoloji',
    name: 'Teknoloji',
    slug: 'teknoloji',
    icon: 'laptop',
    color: '#0EA5E9',
    order: 8,
    subcategories: [
      { name: 'Bilgisayarcı', slug: 'bilgisayarci' },
      { name: 'Telefon Tamiri', slug: 'telefon-tamiri' },
      { name: 'Güvenlik Kamera', slug: 'guvenlik-kamera' },
      { name: 'Elektrik/Elektronik', slug: 'elektrik-elektronik' },
    ],
  },
  {
    id: 'hukuk-finans',
    name: 'Hukuk & Finans',
    slug: 'hukuk-finans',
    icon: 'scale-balance',
    color: '#78716C',
    order: 9,
    subcategories: [
      { name: 'Avukat', slug: 'avukat' },
      { name: 'Muhasebeci', slug: 'muhasebeci' },
      { name: 'Noter', slug: 'noter' },
      { name: 'Sigorta', slug: 'sigorta' },
      { name: 'Emlakçı', slug: 'emlakci' },
    ],
  },
  {
    id: 'resmi-kurumlar',
    name: 'Resmi Kurumlar',
    slug: 'resmi-kurumlar',
    icon: 'bank-outline',
    color: '#0D9488',
    order: 10,
    subcategories: [
      { name: 'Belediye', slug: 'belediye' },
      { name: 'Kaymakamlık', slug: 'kaymakamlik' },
      { name: 'Tapu', slug: 'tapu' },
      { name: 'Nüfus', slug: 'nufus' },
      { name: 'PTT', slug: 'ptt' },
      { name: 'SGK', slug: 'sgk' },
    ],
  },
  {
    id: 'spor-eglence',
    name: 'Spor & Eğlence',
    slug: 'spor-eglence',
    icon: 'soccer',
    color: '#16A34A',
    order: 11,
    subcategories: [
      { name: 'Spor Salonu', slug: 'spor-salonu' },
      { name: 'Halı Saha', slug: 'hali-saha' },
      { name: 'Yüzme Havuzu', slug: 'yuzme-havuzu' },
      { name: 'Park', slug: 'park' },
    ],
  },
  {
    id: 'tarim-hayvancilik',
    name: 'Tarım & Hayvancılık',
    slug: 'tarim-hayvancilik',
    icon: 'sprout-outline',
    color: '#65A30D',
    order: 12,
    subcategories: [
      { name: 'Ziraat', slug: 'ziraat' },
      { name: 'Veteriner', slug: 'veteriner-tarim' },
      { name: 'Tarım Market', slug: 'tarim-market' },
      { name: 'Gübre & İlaç', slug: 'gubre-ilac' },
    ],
  },
  {
    id: 'dugun-organizasyon',
    name: 'Düğün & Organizasyon',
    slug: 'dugun-organizasyon',
    icon: 'party-popper',
    color: '#D946EF',
    order: 13,
    subcategories: [
      { name: 'Düğün Salonu', slug: 'dugun-salonu' },
      { name: 'Fotoğrafçı', slug: 'fotografci' },
      { name: 'Çiçekçi', slug: 'cicekci' },
      { name: 'Müzisyen', slug: 'muzisyen' },
      { name: 'Organizasyon', slug: 'organizasyon' },
    ],
  },
  {
    id: 'cenaze-dini',
    name: 'Cenaze & Dini',
    slug: 'cenaze-dini',
    icon: 'mosque',
    color: '#57534E',
    order: 14,
    subcategories: [
      { name: 'Cenaze Hizmetleri', slug: 'cenaze-hizmetleri' },
      { name: 'Cami', slug: 'cami' },
      { name: 'Hac & Umre', slug: 'hac-umre' },
    ],
  },
];

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return CATEGORIES.find((cat) => cat.slug === slug);
};

export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find((cat) => cat.id === id);
};

export const searchCategories = (query: string): Category[] => {
  const lowerQuery = query.toLowerCase();
  return CATEGORIES.filter(
    (cat) =>
      cat.name.toLowerCase().includes(lowerQuery) ||
      cat.subcategories.some((sub) =>
        sub.name.toLowerCase().includes(lowerQuery)
      )
  );
};
