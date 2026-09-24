export interface Booking {
  id: string;
  name: string;
  phone: string;
  email?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  guests: number;
  tablePreference: string;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled';
  createdAt: string;
  adminNotes?: string;
}

export interface TimeSlot {
  time: string;
  displayTime: string;
  bookedCount: number;
  remainingTables: number;
  totalCapacity: number;
  status: 'available' | 'limited' | 'full';
}

export interface AvailabilityResponse {
  date: string;
  totalBookingsOnDate: number;
  isClosed?: boolean;
  closureReason?: string;
  slots: TimeSlot[];
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'coffee' | 'brunch' | 'mains' | 'pastries' | 'wine';
  price: number;
  description: string;
  dietary?: string[];
  popular?: boolean;
  image?: string;
  hidden?: boolean;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  source: string;
  tag: string;
}

export interface AdminUser {
  username: string;
  name: string;
  role: string;
  cafe: string;
  email?: string;
  avatar?: string;
}

export interface ClosedDate {
  date: string; // YYYY-MM-DD
  reason: string;
}

export interface CafeSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  cleanPhone: string;
  hoursText: string;
  kitchenHours: string;
  openDaysText: string;
  priceGuide: string;
  bannerNotice: string;
  googleMapsUrl: string;
  googleMapsEmbed: string;
  heroHeadline: string;
  heroDescription: string;
  storyQuote: string;
  storyDescription: string;
  maxTablesPerSlot: number;
  slotIntervalMinutes: number;
  // Security & Owner Authentication
  adminEmail: string;
  adminPasswordHash?: string;
  adminRecoveryCode?: string;
  // Off-Day & Closure Control
  offDaysWeekly: string[]; // e.g. ['Monday'] or [] for open 7 days
  specificClosedDates: ClosedDate[];
  offDayNotice: string;
}
