export interface Participant {
  id: string;
  name: string;
  hasOwnGear: boolean;
  needsRental: boolean;
  peopleCount: number;
}

export interface GameList {
  id: string;
  name: string;
  date: string;
  time: string;
  type: "public" | "private";
  maxPlayers: number;
  observation?: string;
  inviteLink?: string;
  participants: Participant[];
  createdBy: string;
}

export interface Field {
  id: string;
  name: string;
  city: string;
  address: string;
  price: number;
  description: string;
  rules: string[];
  contact: string;
  photos: string[];
  coordinates: { lat: number; lng: number };
  amenities: string[];
  schedules: {
    day: string;
    slots: string[];
  }[];
}
