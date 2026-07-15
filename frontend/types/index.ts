export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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
  view_count?: number;
  user?: UserProfile;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  city: string;
  nickname?: string;
  bio?: string;
  banner?: string | null;
  created_at: string;
  rating?: number;
  reviewsCount?: number;
  activeAdsCount?: number;
  is_donor?: boolean;
  roles?: string[];
  reviews?: Review[];
  featured_team?: {
    id: string;
    name: string;
    avatar: string | null;
    visibility: "PUBLIC" | "PRIVATE";
    member_count: number;
    my_role: string;
  } | null;
}

export interface Review {
  id: string;
  target_user_id?: string;
  author_id: string;
  author_name?: string;
  author_avatar?: string | null;
  rating: number;
  comment: string;
  created_at: string;
}
