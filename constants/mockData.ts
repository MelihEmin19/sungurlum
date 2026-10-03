// Mock data for UI development — will be replaced with Firebase data

export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  phone: string;
  whatsapp: string;
  address: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  reviewCount: number;
  images: string[];
  coverImage: string;
  isFeatured: boolean;
  isPublicPlace: boolean;
  membershipTier: 'basic' | 'pro' | 'premium';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  isOpen?: boolean;
}

export interface Campaign {
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  description: string;
  image: string;
  status: 'pending' | 'active' | 'expired';
  createdAt: string;
}

export interface Review {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Classified {
  id: string;
  title: string;
  description: string;
  price: string;
  category: 'emlak' | 'vasita' | 'ikinci-el' | 'is-ilanlari';
  location: string;
  createdAt: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  images: string[];
}

export const MOCK_BUSINESSES: Business[] = [
  {
    id: '1',
    name: 'Ali Usta Marangoz',
    description: '25 yıllık tecrübe ile mutfak dolabı, vestiyer, gardırop ve her türlü mobilya imalatı. Kaliteli malzeme ve uygun fiyat garantisi.',
    category: 'ev-tadilat',
    subcategory: 'marangoz',
    phone: '05321234567',
    whatsapp: '905321234567',
    address: 'Sanayi Sitesi No:42, Sungurlu',
    location: { latitude: 40.1650, longitude: 34.3700 },
    rating: 4.8,
    reviewCount: 23,
    images: [],
    coverImage: '',
    isFeatured: true,
    isPublicPlace: false,
    membershipTier: 'premium',
    status: 'approved',
  },
  {
    id: '2',
    name: 'Güler Kuaför',
    description: 'Kadın ve erkek kuaförü. Saç kesim, boya, fön, cilt bakım ve makyaj hizmetleri. Modern ve hijyenik salonumuzda sizi bekliyoruz.',
    category: 'guzellik-bakim',
    subcategory: 'kadin-kuaforu',
    phone: '05339876543',
    whatsapp: '905339876543',
    address: 'Fatih Mah. Cumhuriyet Cad. No:15, Sungurlu',
    location: { latitude: 40.1680, longitude: 34.3750 },
    rating: 4.5,
    reviewCount: 15,
    images: [],
    coverImage: '',
    isFeatured: true,
    isPublicPlace: false,
    membershipTier: 'pro',
    status: 'approved',
  },
  {
    id: '3',
    name: 'Merkez Kasap',
    description: 'Taze et, kıyma, tavuk ve şarküteri ürünleri. Her gün taze kesim. Toptan ve perakende satış.',
    category: 'yeme-icme',
    subcategory: 'kasap',
    phone: '05441112233',
    whatsapp: '905441112233',
    address: 'Atatürk Cad. No:8, Sungurlu',
    location: { latitude: 40.1700, longitude: 34.3800 },
    rating: 4.6,
    reviewCount: 31,
    images: [],
    coverImage: '',
    isFeatured: false,
    isPublicPlace: false,
    membershipTier: 'basic',
    status: 'approved',
  },
  {
    id: '4',
    name: 'Öğretmen Ayşe - Matematik',
    description: 'Ortaokul ve lise düzeyinde matematik özel ders. LGS ve YKS hazırlık. 10 yıllık öğretmenlik deneyimi.',
    category: 'egitim',
    subcategory: 'ozel-ders',
    phone: '05551234567',
    whatsapp: '905551234567',
    address: 'Yeni Mah. Okul Sok. No:3, Sungurlu',
    rating: 4.9,
    reviewCount: 18,
    images: [],
    coverImage: '',
    isFeatured: true,
    isPublicPlace: false,
    membershipTier: 'pro',
    status: 'approved',
  },
  {
    id: '5',
    name: 'Oto Doktor Mehmet',
    description: 'Her marka araç bakım ve onarım. Motor, şanzıman, fren, süspansiyon tamiri. Bilgisayarlı arıza tespiti.',
    category: 'oto-ulasim',
    subcategory: 'oto-tamirci',
    phone: '05421234567',
    whatsapp: '905421234567',
    address: 'Sanayi Sitesi 2. Blok No:18, Sungurlu',
    rating: 4.3,
    reviewCount: 27,
    images: [],
    coverImage: '',
    isFeatured: false,
    isPublicPlace: false,
    membershipTier: 'basic',
    status: 'approved',
  },
  {
    id: '6',
    name: 'Sungurlu Devlet Hastanesi',
    description: 'Acil servis, poliklinikler ve yataklı tedavi hizmetleri.',
    category: 'resmi-kurumlar',
    subcategory: 'belediye',
    phone: '03643116000',
    whatsapp: '',
    address: 'Hastane Cad. Sungurlu/Çorum',
    rating: 3.8,
    reviewCount: 45,
    images: [],
    coverImage: '',
    isFeatured: false,
    isPublicPlace: true,
    membershipTier: 'basic',
    status: 'approved',
  },
  {
    id: '7',
    name: 'Lezzet Durağı Restoran',
    description: 'Geleneksel Türk mutfağı, ızgara çeşitleri, pide ve lahmacun. Ailece gelebileceğiniz huzurlu bir mekan.',
    category: 'yeme-icme',
    subcategory: 'restoran',
    phone: '05361234567',
    whatsapp: '905361234567',
    address: 'İstasyon Mah. Çarşı Sok. No:22, Sungurlu',
    rating: 4.4,
    reviewCount: 52,
    images: [],
    coverImage: '',
    isFeatured: true,
    isPublicPlace: false,
    membershipTier: 'premium',
    status: 'approved',
  },
  {
    id: '8',
    name: 'Teknoloji Çözüm',
    description: 'Bilgisayar, telefon, tablet tamiri. Veri kurtarma, yazılım yükleme. Güvenlik kamera sistemleri kurulumu.',
    category: 'teknoloji',
    subcategory: 'bilgisayarci',
    phone: '05371234567',
    whatsapp: '905371234567',
    address: 'Cumhuriyet Cad. No:55, Sungurlu',
    rating: 4.7,
    reviewCount: 14,
    images: [],
    coverImage: '',
    isFeatured: false,
    isPublicPlace: false,
    membershipTier: 'pro',
    status: 'approved',
  },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    businessId: '3',
    businessName: 'Merkez Kasap',
    title: 'Tavuk Kanat Kampanyası',
    description: 'Tavuk kanat kg fiyatı 300₺ yerine sadece 250₺! Stoklar ile sınırlıdır.',
    image: '',
    status: 'active',
    createdAt: '2026-07-01',
  },
  {
    id: '2',
    businessId: '7',
    businessName: 'Lezzet Durağı',
    title: 'Aile Menüsü %20 İndirim',
    description: '4 kişilik aile menülerinde %20 indirim! Her gün 12:00-15:00 arası geçerli.',
    image: '',
    status: 'active',
    createdAt: '2026-07-02',
  },
  {
    id: '3',
    businessId: '2',
    businessName: 'Güler Kuaför',
    title: 'Saç Boyama Kampanyası',
    description: 'Bu hafta saç boyama + bakım 500₺ yerine 350₺! Randevu ile gelin.',
    image: '',
    status: 'active',
    createdAt: '2026-07-03',
  },
  {
    id: '4',
    businessId: '5',
    businessName: 'Oto Doktor Mehmet',
    title: 'Yaz Bakım Paketi',
    description: 'Yağ + filtre + klima bakım paketi 1500₺ yerine 1000₺! Tüm araçlara geçerli.',
    image: '',
    status: 'active',
    createdAt: '2026-07-04',
  },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    businessId: '1',
    userId: 'user1',
    userName: 'Mehmet A.',
    rating: 5,
    comment: 'Çok temiz ve düzgün iş çıkardı. Mutfak dolabımız harika oldu. Kesinlikle tavsiye ederim.',
    status: 'approved',
    createdAt: '2026-06-15',
  },
  {
    id: '2',
    businessId: '1',
    userId: 'user2',
    userName: 'Ayşe K.',
    rating: 4,
    comment: 'Fiyatı uygun ve işçiliği güzel ama biraz geç teslim etti. Genel olarak memnunum.',
    status: 'approved',
    createdAt: '2026-06-10',
  },
  {
    id: '3',
    businessId: '1',
    userId: 'user3',
    userName: 'Hasan T.',
    rating: 5,
    comment: 'Gardırobumuz tam istediğimiz gibi oldu. Ali usta işinin ehli birisi.',
    status: 'approved',
    createdAt: '2026-06-05',
  },
];

export const MOCK_CLASSIFIEDS: Classified[] = [
  {
    id: '1',
    title: '2015 Model Temiz Ford Focus',
    description: 'Sahibinden temiz, bakımları zamanında yapılmış, boyasız değişensiz aile aracı. Sadece hafta sonları kullanıldı.',
    price: '850.000 ₺',
    category: 'vasita',
    location: 'Fatih Mah.',
    createdAt: 'Bugün',
    sellerId: 's1',
    sellerName: 'Ahmet Yılmaz',
    sellerPhone: '05551234567',
    images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=600&auto=format&fit=crop'],
  },
  {
    id: '2',
    title: 'Sahibinden Kiralık 3+1 Daire',
    description: 'Merkezde, çarşıya yürüme mesafesinde. Doğalgazlı, yalıtımlı ara kat daire. Memura veya kefilli aileye verilecektir.',
    price: '15.000 ₺ / Ay',
    category: 'emlak',
    location: 'Cumhuriyet Mah.',
    createdAt: 'Dün',
    sellerId: 's2',
    sellerName: 'Mustafa K.',
    sellerPhone: '05329876543',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop'],
  },
  {
    id: '3',
    title: 'Az Kullanılmış iPhone 13 Pro',
    description: 'Batarya %89. Kutusunda, garantisi yeni bitti. Çizik ezik yoktur. Alıcısına hayırlı olsun.',
    price: '32.000 ₺',
    category: 'ikinci-el',
    location: 'Yeni Mah.',
    createdAt: '3 gün önce',
    sellerId: 's3',
    sellerName: 'Caner B.',
    sellerPhone: '05441112233',
    images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=600&auto=format&fit=crop'],
  },
  {
    id: '4',
    title: 'Fırın Ustası Aranıyor',
    description: 'Merkezdeki pastanemize tecrübeli fırın ustası alınacaktır. Maaş + SGK + Yemek.',
    price: 'Dolgun Maaş',
    category: 'is-ilanlari',
    location: 'Merkez',
    createdAt: '1 hafta önce',
    sellerId: 's4',
    sellerName: 'Gül Pastanesi',
    sellerPhone: '05364445566',
    images: [],
  },
];
