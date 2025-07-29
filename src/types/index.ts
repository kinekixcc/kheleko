export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'player' | 'organizer' | 'admin';
  phone?: string;
  created_at: string;
}

export interface SportsFacility {
  id: string;
  name: string;
  description: string;
  location: string;
  district: string;
  province: string;
  latitude?: number;
  longitude?: number;
  sports_types: string[];
  amenities: string[];
  price_per_hour: number;
  contact_phone: string;
  contact_email?: string;
  images: string[];
  rating: number;
  total_reviews: number;
  is_active: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  facility_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  total_cost: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
}

export interface PlayerStats {
  id: string;
  player_id: string;
  tournament_id: string;
  tournament_name: string;
  sport_type: string;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  hours_played: number;
  performance_rating: number;
  achievements: string[];
  created_at: string;
  updated_at: string;
}

export interface PlayerAchievement {
  id: string;
  player_id: string;
  type: 'tournament_winner' | 'tournament_runner_up' | 'most_improved' | 'fair_play' | 'milestone';
  title: string;
  description: string;
  tournament_id?: string;
  tournament_name?: string;
  earned_date: string;
  badge_color: string;
}

export interface PlayerProfile {
  id: string;
  user_id: string;
  bio?: string;
  favorite_sports: string[];
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  location: string;
  date_of_birth?: string;
  height?: number;
  weight?: number;
  preferred_position?: string;
  social_links?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  privacy_settings: {
    show_stats: boolean;
    show_achievements: boolean;
    show_contact: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  sport_type: string;
  organizer_id: string;
  organizer_name: string;
  facility_id: string;
  facility_name: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_participants: number;
  current_participants: number;
  entry_fee: number;
  prize_pool: number;
  rules: string;
  requirements: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  facility_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Province {
  id: number;
  name: string;
  districts: string[];
}

export const NEPAL_PROVINCES: Province[] = [
  {
    id: 1,
    name: 'Koshi Province',
    districts: ['Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga', 'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Terhathum', 'Udayapur']
  },
  {
    id: 2,
    name: 'Madhesh Province',
    districts: ['Bara', 'Dhanusha', 'Mahottari', 'Parsa', 'Rautahat', 'Saptari', 'Sarlahi', 'Siraha']
  },
  {
    id: 3,
    name: 'Bagmati Province',
    districts: ['Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchok', 'Lalitpur', 'Makwanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli', 'Sindhupalchok']
  },
  {
    id: 4,
    name: 'Gandaki Province',
    districts: ['Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi', 'Nawalpur', 'Parbat', 'Syangja', 'Tanahun']
  },
  {
    id: 5,
    name: 'Lumbini Province',
    districts: ['Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Gulmi', 'Kapilvastu', 'Parasi', 'Palpa', 'Pyuthan', 'Rolpa', 'Rukum East', 'Rupandehi']
  },
  {
    id: 6,
    name: 'Karnali Province',
    districts: ['Dailekh', 'Dolpa', 'Humla', 'Jajarkot', 'Jumla', 'Kalikot', 'Mugu', 'Rukum West', 'Salyan', 'Surkhet']
  },
  {
    id: 7,
    name: 'Sudurpashchim Province',
    districts: ['Achham', 'Baitadi', 'Bajhang', 'Bajura', 'Dadeldhura', 'Darchula', 'Doti', 'Kailali', 'Kanchanpur']
  }
];

export const SPORTS_TYPES = [
  // Physical Sports
  'Football', 'Cricket', 'Basketball', 'Volleyball', 'Badminton', 'Tennis',
  'Table Tennis', 'Swimming', 'Gym/Fitness', 'Futsal', 'Boxing', 'Wrestling',
  'Archery', 'Athletics', 'Cycling', 'Rock Climbing', 'Martial Arts', 'Hockey',
  'Rugby', 'Baseball', 'Softball', 'Golf', 'Bowling', 'Skating', 'Skiing',
  'Surfing', 'Diving', 'Gymnastics', 'Weightlifting', 'Crossfit', 'Yoga',
  'Pilates', 'Dance', 'Aerobics', 'Zumba', 'Kickboxing', 'Taekwondo',
  'Karate', 'Judo', 'Jiu-Jitsu', 'Muay Thai', 'Fencing', 'Equestrian',
  
  // Esports
  'Dota 2', 'League of Legends', 'Counter-Strike 2', 'Valorant', 'PUBG Mobile',
  'Mobile Legends', 'Free Fire', 'Call of Duty', 'Fortnite', 'Apex Legends',
  'Overwatch 2', 'FIFA', 'NBA 2K', 'Rocket League', 'Street Fighter',
  'Tekken', 'Mortal Kombat', 'Chess.com', 'Clash Royale', 'Clash of Clans',
  'Among Us', 'Fall Guys', 'Minecraft', 'Roblox', 'Genshin Impact'
];

export const AMENITIES = [
  'Parking', 'Changing Rooms', 'Showers', 'Equipment Rental', 'Food Court',
  'First Aid', 'CCTV', 'Lighting', 'Seating Area', 'Restrooms', 'WiFi',
  'Air Conditioning', 'Sound System', 'Scoreboard', 'Referee Services'
];

// Platform monetization types
export interface PlatformFee {
  id: string;
  type: 'tournament_commission' | 'facility_booking' | 'premium_listing' | 'advertising' | 'subscription';
  percentage?: number;
  fixed_amount?: number;
  description: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'organizer' | 'facility_owner' | 'player';
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_tournaments?: number;
  max_participants?: number;
  priority_support: boolean;
  analytics_access: boolean;
  custom_branding: boolean;
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  image_url: string;
  target_url: string;
  advertiser_name: string;
  placement: 'banner' | 'sidebar' | 'modal' | 'feed';
  target_audience: 'all' | 'players' | 'organizers' | 'facility_owners';
  price_per_click: number;
  budget: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  // Organizer Plans
  {
    id: 'organizer_basic',
    name: 'Basic Organizer',
    type: 'organizer',
    price_monthly: 999,
    price_yearly: 9999,
    features: [
      'Create up to 5 tournaments per month',
      'Up to 50 participants per tournament',
      'Basic analytics',
      'Email support',
      'Standard listing'
    ],
    max_tournaments: 5,
    max_participants: 50,
    priority_support: false,
    analytics_access: true,
    custom_branding: false
  },
  {
    id: 'organizer_pro',
    name: 'Pro Organizer',
    type: 'organizer',
    price_monthly: 2499,
    price_yearly: 24999,
    features: [
      'Unlimited tournaments',
      'Up to 500 participants per tournament',
      'Advanced analytics & insights',
      'Priority support',
      'Featured listings',
      'Custom branding',
      'Bulk participant management',
      'Revenue analytics'
    ],
    max_tournaments: -1, // unlimited
    max_participants: 500,
    priority_support: true,
    analytics_access: true,
    custom_branding: true
  },
  // Player Plans
  {
    id: 'player_premium',
    name: 'Premium Player',
    type: 'player',
    price_monthly: 299,
    price_yearly: 2999,
    features: [
      'Early tournament access',
      'Reduced platform fees',
      'Advanced player statistics',
      'Priority customer support',
      'Exclusive tournaments',
      'Performance analytics'
    ],
    priority_support: true,
    analytics_access: true,
    custom_branding: false
  }
];

export const PLATFORM_FEES: PlatformFee[] = [
  {
    id: 'tournament_commission',
    type: 'tournament_commission',
    percentage: 5,
    description: '5% commission on tournament entry fees'
  },
  {
    id: 'facility_booking',
    type: 'facility_booking',
    percentage: 3,
    description: '3% commission on facility bookings'
  },
  {
    id: 'premium_listing',
    type: 'premium_listing',
    fixed_amount: 500,
    description: 'रू 500 for featured tournament listing'
  }
];