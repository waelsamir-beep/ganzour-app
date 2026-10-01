export type CategoryDTO = {
  id: number;
  name: string;
  iconKey: string;
  sortOrder: number;
  isActive: boolean;
  count?: number;
};

export type ProfessionDTO = {
  id: number;
  ownerName: string;
  title: string;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  phone: string;
  whatsapp: string | null;
  address: string | null;
  description: string | null;
  workingHours: string | null;
  mapUrl: string | null;
  lat: number | null;
  lng: number | null;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  avgRating: number;
  ratingCount: number;
  isFavorite: boolean;
};

export type RequestDTO = {
  id: number;
  ownerName: string;
  title: string;
  categoryId: number;
  categoryName: string;
  phone: string;
  whatsapp: string | null;
  address: string | null;
  description: string | null;
  workingHours: string | null;
  mapUrl: string | null;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  userName?: string;
  userPhone?: string;
};

export type NotificationDTO = {
  id: number;
  title: string;
  body: string;
  kind: string;
  read: boolean;
  createdAt: string;
};

export type MemberAdminDTO = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  status: string;
  createdAt: string;
  requestsCount: number;
};

export type AdDTO = {
  id: number;
  text: string;
  ownerName: string;
  phone: string;
  whatsapp: string | null;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  userName?: string | null;
  userPhone?: string | null;
};

export type SessionUserDTO = {
  id: number;
  name: string;
  username: string | null;
  phone: string;
  email: string | null;
  role: "member" | "admin";
  isGuest: boolean;
  imageUrl: string | null;
  onboarded: boolean;
};
