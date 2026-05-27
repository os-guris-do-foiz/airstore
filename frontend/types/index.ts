export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  whatsapp?: string;
  location: string;
  model: string;
  type: string;
  category: string;
  condition: string;
  brand: string;
  fps?: number;
  accepts_trade: boolean;
  images: string[];
  user_id: string;
  created_at: string;
  is_donor?: boolean;
  is_sold?: boolean;
  user?: UserProfile;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  city: string;
  created_at: string;
  rating?: number;
  reviewsCount?: number;
  activeAdsCount?: number;
  is_donor?: boolean;
  roles?: string[];
  ads?: Ad[];
  reviews?: Review[];
}

export interface Review {
  id: string;
  target_user_id: string;
  author_id: string;
  author_name?: string;
  rating: number;
  comment: string;
  created_at: string;
}
