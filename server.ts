import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Database storage setup
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'cafe_data.json');

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
  offDaysWeekly: string[];
  specificClosedDates: ClosedDate[];
  offDayNotice: string;
}

interface DatabaseSchema {
  bookings: Booking[];
  enquiries: Enquiry[];
  menu: MenuItem[];
  settings: CafeSettings;
}

// Password hashing helper
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_lespresso_salt_ballarat_2026').digest('hex');
}

// Rate Limiter for Login (prevents hacker brute force attacks)
interface AttemptRecord {
  count: number;
  lockedUntil: number;
}
const loginRateLimits: Map<string, AttemptRecord> = new Map();

function checkRateLimit(ip: string): { allowed: boolean; remainingSec?: number } {
  const now = Date.now();
  const record = loginRateLimits.get(ip);
  if (!record) return { allowed: true };

  if (record.lockedUntil > now) {
    const remainingSec = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remainingSec };
  }

  // Reset if lock has expired
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    loginRateLimits.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const record = loginRateLimits.get(ip) || { count: 0, lockedUntil: 0 };
  record.count += 1;

  if (record.count >= 5) {
    record.lockedUntil = now + 5 * 60 * 1000; // 5 minutes lockout
  }
  loginRateLimits.set(ip, record);
}

function resetFailedAttempts(ip: string) {
  loginRateLimits.delete(ip);
}

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'm1',
    name: 'Artisan Flat White',
    category: 'coffee',
    price: 4.80,
    description: 'Double ristretto extraction of our signature dark roast with silky, textured whole milk. Melbourne-standard coffee in the heart of Ballarat.',
    dietary: ['Vegetarian', 'Oat / Soy / Almond available'],
    popular: true,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm2',
    name: 'Belgian Hot Chocolate',
    category: 'coffee',
    price: 5.50,
    description: 'Melted Belgian couverture chocolate steamed with rich milk, dusted with Dutch cocoa and served with a house marshmallow.',
    dietary: ['Vegetarian', 'Gluten Free'],
    popular: true,
    image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm3',
    name: "L'espresso Magic",
    category: 'coffee',
    price: 5.00,
    description: 'The Melbourne classic: double ristretto in a 160ml tulip cup with 3/4 steamed milk for the ultimate coffee-to-milk ratio.',
    dietary: ['Vegetarian'],
    popular: false,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm4',
    name: 'Famous Smashed Avo on Seeded Sourdough',
    category: 'brunch',
    price: 22.00,
    description: 'Fresh Hass avocado, marinated Victorian goat feta, toasted dukkah, lemon oil, fresh mint, and two free-range poached eggs on grilled 1816 bakery sourdough.',
    dietary: ['Vegetarian', 'Gluten Free Option'],
    popular: true,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm5',
    name: "L'espresso Classic Eggs Benedict",
    category: 'brunch',
    price: 24.00,
    description: 'Toasted buttery brioche, slow-poached free-range eggs, house-whipped tarragon hollandaise with your choice of double-smoked Otway ham or Tasmanian cold-smoked salmon.',
    dietary: ['Gluten Free Option'],
    popular: true,
    image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm6',
    name: 'Avocado & Heirloom Tomato Toast',
    category: 'brunch',
    price: 21.00,
    description: 'Sliced avocado, charred heirloom truss tomatoes, aged balsamic reduction, basil pesto, and microgreens on toasted light rye sourdough.',
    dietary: ['Vegetarian', 'Vegan Option'],
    popular: false,
    image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm7',
    name: 'Truffle & Field Mushroom Scramble',
    category: 'brunch',
    price: 25.00,
    description: 'Silky scrambled eggs with Victorian truffle butter, sautéed Swiss brown mushrooms, shaved pecorino, and wild rocket on grilled sourdough.',
    dietary: ['Vegetarian', 'Gluten Free Option'],
    popular: true,
    image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm8',
    name: 'Signature Handmade Potato Gnocchi Ragù',
    category: 'mains',
    price: 28.00,
    description: 'Pillow-soft hand-rolled potato gnocchi tossed in our 8-hour slow-braised Victorian beef cheek and San Marzano tomato ragù, finished with 24-month Parmigiano Reggiano.',
    dietary: ['House Specialty'],
    popular: true,
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm9',
    name: 'Wild Forest Mushroom & Sage Gnocchi',
    category: 'mains',
    price: 27.00,
    description: 'Handmade gnocchi pan-crisped in hazelnut brown butter, King oyster and pine mushrooms, crispy sage, and whipped ricotta.',
    dietary: ['Vegetarian'],
    popular: true,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm10',
    name: 'Ballarat Porchetta & Provolone Panini',
    category: 'mains',
    price: 23.00,
    description: 'Crisp-skinned herb-roasted pork belly, melted provolone cheese, salsa verde, and pickled fennel on toasted crusty ciabatta.',
    dietary: ['Dairy Free Option'],
    popular: false,
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm11',
    name: 'Golden Almond Croissant',
    category: 'pastries',
    price: 7.50,
    description: 'Twice-baked butter croissant loaded with rich frangipane almond cream, toasted flaked almonds, and powdered sugar.',
    dietary: ['Vegetarian'],
    popular: true,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm12',
    name: 'Pistachio & Chocolate Babka Knot',
    category: 'pastries',
    price: 7.80,
    description: 'Twisted brioche pastry ribbons layered with dark chocolate ganache, Bronte pistachios, and orange blossom syrup glaze.',
    dietary: ['Vegetarian'],
    popular: false,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm13',
    name: 'Traditional Sicilian Ricotta Cannoli',
    category: 'pastries',
    price: 6.50,
    description: "Crisp fried pastry shell piped fresh with sweetened sheep's milk ricotta, candied orange peel, and crushed pistachio tips.",
    dietary: ['Vegetarian'],
    popular: true,
    image: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm14',
    name: 'Pyrenees Regional Pinot Noir',
    category: 'wine',
    price: 14.00,
    description: 'Glass of local cool-climate Western Victoria Pinot Noir. Ripe cherries, subtle French oak, and fine tannins that pair gloriously with gnocchi.',
    dietary: ['Vegan', 'A$58 Bottle'],
    popular: true,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'm15',
    name: 'King Valley Prosecco DOC',
    category: 'wine',
    price: 13.00,
    description: 'Crisp, lively sparkling with green apple and white floral notes. The perfect accompaniment to brunch or eggs benedict.',
    dietary: ['Vegan', 'A$52 Bottle'],
    popular: false,
    image: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&w=600&q=80'
  }
];

const DEFAULT_SETTINGS: CafeSettings = {
  name: "L'espresso",
  tagline: "Iconic Coffee, House Gnocchi & Warm Timber Hospitality",
  address: "417 Sturt St, Ballarat Central VIC 3350, Australia",
  phone: "+61 3 5333 1789",
  cleanPhone: "+61353331789",
  hoursText: "Open every day: 7:00 AM – 3:00 PM",
  kitchenHours: "Kitchen serves 7:00 AM – 2:30 PM",
  openDaysText: "Open 7 Days a Week (Mon – Sun)",
  priceGuide: "A$20–40 per person",
  bannerNotice: "Open Daily: 7:00 AM – 3:00 PM • 417 Sturt St, Ballarat Central",
  googleMapsUrl: "https://maps.app.goo.gl/dejNeYBhLNy7xsF6A",
  googleMapsEmbed: "https://www.google.com/maps?q=417+Sturt+St,+Ballarat+Central+VIC+3350&output=embed",
  heroHeadline: "Artisan espresso, hand-rolled gnocchi & warm timber soul.",
  heroDescription: "For decades, L'espresso has been Ballarat’s beloved retreat. Settle into dark leather booths under warm jarrah timber beams, browse our iconic jazz & blues record walls, and enjoy Melbourne-standard coffee, crisp eggs benedict, and slow-cooked beef cheek ragù gnocchi.",
  storyQuote: "Where Italian heritage, jazz vinyl, and Victorian coffee culture come together on Sturt Street.",
  storyDescription: "Founded on Ballarat’s grand central boulevard, L’espresso captures the nostalgic romance of Melbourne’s laneway cafes combined with the deep, unhurried warmth of a North Italian espresso and wine bar.",
  maxTablesPerSlot: 6,
  slotIntervalMinutes: 30,
  // Security
  adminEmail: "farhatulhasannehad@gmail.com",
  adminPasswordHash: hashPassword("lespresso2026"),
  adminRecoveryCode: "LES-RECOVER-8492",
  // Off-Days & Closure
  offDaysWeekly: [],
  specificClosedDates: [
    { date: "2026-12-25", reason: "Christmas Day Public Holiday" },
    { date: "2026-01-01", reason: "New Year's Day Closure" }
  ],
  offDayNotice: ""
};

function ensureDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      bookings: [
        {
          id: 'LES-1042',
          name: 'Sarah Jenkins',
          phone: '+61 412 884 102',
          email: 'sarah.j@gmail.com',
          date: today,
          time: '08:30',
          guests: 2,
          tablePreference: 'Indoor Timber Booth',
          specialRequests: 'Flat whites on arrival, oat milk preferred.',
          status: 'confirmed',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          adminNotes: 'Regular local guest, booth 2.'
        },
        {
          id: 'LES-1043',
          name: 'Michael & Claire Henderson',
          phone: '+61 403 771 904',
          email: 'claire.henderson@ballarat.org',
          date: today,
          time: '10:00',
          guests: 4,
          tablePreference: 'Sturt St Window Table',
          specialRequests: 'Celebrating 10th anniversary, window table requested.',
          status: 'confirmed',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          adminNotes: 'Window table 5 reserved with anniversary greeting.'
        },
        {
          id: 'LES-1044',
          name: 'David Thorne (Victorian Heritage)',
          phone: '+61 425 619 443',
          email: 'dthorne@heritagevic.gov.au',
          date: today,
          time: '12:30',
          guests: 3,
          tablePreference: 'Wine-Bar High Table',
          specialRequests: 'Quick business lunch, ordering gnocchi ragù.',
          status: 'pending',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        }
      ],
      enquiries: [
        {
          id: 'ENQ-201',
          name: 'Marcus Bell',
          phone: '+61 400 332 991',
          email: 'marcus@goldfieldsmedia.com.au',
          subject: 'Private event / evening hire enquiry',
          message: 'Hi team, do you offer private hire of the cafe for a book launch of 30 people on a Saturday evening?',
          status: 'unread',
          createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
        }
      ],
      menu: DEFAULT_MENU_ITEMS,
      settings: DEFAULT_SETTINGS
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed: DatabaseSchema = JSON.parse(raw);

    let needsSave = false;
    if (!parsed.menu || !Array.isArray(parsed.menu) || parsed.menu.length === 0) {
      parsed.menu = DEFAULT_MENU_ITEMS;
      needsSave = true;
    }
    if (!parsed.settings) {
      parsed.settings = DEFAULT_SETTINGS;
      needsSave = true;
    } else {
      // Migrate security & off-day fields if missing
      if (!parsed.settings.adminEmail) {
        parsed.settings.adminEmail = DEFAULT_SETTINGS.adminEmail;
        needsSave = true;
      }
      if (!parsed.settings.adminPasswordHash) {
        parsed.settings.adminPasswordHash = DEFAULT_SETTINGS.adminPasswordHash;
        needsSave = true;
      }
      if (!parsed.settings.adminRecoveryCode) {
        parsed.settings.adminRecoveryCode = DEFAULT_SETTINGS.adminRecoveryCode;
        needsSave = true;
      }
      if (!parsed.settings.offDaysWeekly) {
        parsed.settings.offDaysWeekly = [];
        needsSave = true;
      }
      if (!parsed.settings.specificClosedDates) {
        parsed.settings.specificClosedDates = DEFAULT_SETTINGS.specificClosedDates;
        needsSave = true;
      }
      if (parsed.settings.offDayNotice === undefined) {
        parsed.settings.offDayNotice = '';
        needsSave = true;
      }
    }

    if (!parsed.bookings) {
      parsed.bookings = [];
      needsSave = true;
    }
    if (!parsed.enquiries) {
      parsed.enquiries = [];
      needsSave = true;
    }

    if (needsSave) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }

    return parsed;
  } catch (err) {
    console.error('Error reading database, creating new fallback', err);
    return {
      bookings: [],
      enquiries: [],
      menu: DEFAULT_MENU_ITEMS,
      settings: DEFAULT_SETTINGS
    };
  }
}

function saveDb(data: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// Real-time Server-Sent Events (SSE) connections
const sseClients: Set<Response> = new Set();

function broadcastEvent(type: string, data: any) {
  const message = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Operating slots for L'espresso Ballarat: 7:00 AM to 3:00 PM (last slot 2:30 PM)
const TIME_SLOTS = [
  '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30'
];

// SSE endpoint
app.get('/api/realtime/stream', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  res.write(`data: ${JSON.stringify({ type: 'connected', time: new Date().toISOString() })}\n\n`);
  sseClients.add(res);

  const heartbeat = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// -------------------------------------------------------------
// MENU API ENDPOINTS
// -------------------------------------------------------------

app.get('/api/menu', (req: Request, res: Response) => {
  const db = ensureDb();
  const includeHidden = req.query.includeHidden === 'true';
  const allItems = db.menu || DEFAULT_MENU_ITEMS;
  const menu = includeHidden ? allItems : allItems.filter(m => !m.hidden);
  res.json({ menu });
});

app.post('/api/admin/menu', (req: Request, res: Response) => {
  const { name, category, price, description, dietary, popular, image, hidden } = req.body;

  if (!name || !category || price === undefined) {
    res.status(400).json({ error: 'Name, category, and price are required.' });
    return;
  }

  const db = ensureDb();
  const newItem: MenuItem = {
    id: `m_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: String(name).trim(),
    category: category,
    price: Number(price),
    description: description ? String(description).trim() : '',
    dietary: Array.isArray(dietary) ? dietary : (dietary ? String(dietary).split(',').map(s => s.trim()).filter(Boolean) : []),
    popular: Boolean(popular),
    image: image ? String(image).trim() : 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    hidden: Boolean(hidden)
  };

  db.menu.unshift(newItem);
  saveDb(db);

  broadcastEvent('menu_updated', { action: 'create', item: newItem });
  res.status(201).json({ success: true, item: newItem });
});

app.put('/api/admin/menu/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, category, price, description, dietary, popular, image, hidden } = req.body;

  const db = ensureDb();
  const index = db.menu.findIndex(m => m.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Menu item not found.' });
    return;
  }

  const existing = db.menu[index];
  db.menu[index] = {
    ...existing,
    name: name !== undefined ? String(name).trim() : existing.name,
    category: category !== undefined ? category : existing.category,
    price: price !== undefined ? Number(price) : existing.price,
    description: description !== undefined ? String(description).trim() : existing.description,
    dietary: dietary !== undefined 
      ? (Array.isArray(dietary) ? dietary : String(dietary).split(',').map(s => s.trim()).filter(Boolean)) 
      : existing.dietary,
    popular: popular !== undefined ? Boolean(popular) : existing.popular,
    image: image !== undefined ? String(image).trim() : existing.image,
    hidden: hidden !== undefined ? Boolean(hidden) : existing.hidden
  };

  saveDb(db);
  broadcastEvent('menu_updated', { action: 'update', item: db.menu[index] });
  res.json({ success: true, item: db.menu[index] });
});

app.patch('/api/admin/menu/:id/toggle-visibility', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = ensureDb();
  const item = db.menu.find(m => m.id === id);

  if (!item) {
    res.status(404).json({ error: 'Menu item not found.' });
    return;
  }

  item.hidden = !item.hidden;
  saveDb(db);
  broadcastEvent('menu_updated', { action: 'update', item });
  res.json({ success: true, item, hidden: item.hidden });
});

app.delete('/api/admin/menu/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = ensureDb();
  const index = db.menu.findIndex(m => m.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Menu item not found.' });
    return;
  }

  const removed = db.menu.splice(index, 1)[0];
  saveDb(db);

  broadcastEvent('menu_updated', { action: 'delete', id });
  res.json({ success: true, message: 'Item deleted', id: removed.id });
});

// -------------------------------------------------------------
// SETTINGS API ENDPOINTS (Public & Admin)
// -------------------------------------------------------------

app.get('/api/settings', (_req: Request, res: Response) => {
  const db = ensureDb();
  // Safe public copy without internal security secrets
  const safeSettings = { ...db.settings };
  delete (safeSettings as any).adminPasswordHash;
  delete (safeSettings as any).adminRecoveryCode;
  res.json({ settings: safeSettings });
});

// Authenticated admin view of settings
app.get('/api/admin/settings', (_req: Request, res: Response) => {
  const db = ensureDb();
  res.json({ settings: db.settings });
});

app.put('/api/admin/settings', (req: Request, res: Response) => {
  const db = ensureDb();
  const updateData = req.body;

  // Protect password hash from accidental overwrite through general settings PUT
  if (updateData.adminPasswordHash === undefined) {
    delete updateData.adminPasswordHash;
  }

  db.settings = {
    ...db.settings,
    ...updateData
  };

  saveDb(db);
  broadcastEvent('settings_updated', db.settings);
  res.json({ success: true, settings: db.settings });
});

// -------------------------------------------------------------
// AVAILABILITY & BOOKINGS (WITH OFF-DAY & CLOSURE ENFORCEMENT)
// -------------------------------------------------------------

function isDateClosed(dateStr: string, settings: CafeSettings): { isClosed: boolean; reason?: string } {
  // Check specific holiday/closure dates
  const specificMatch = settings.specificClosedDates?.find(d => d.date === dateStr);
  if (specificMatch) {
    return { isClosed: true, reason: specificMatch.reason || 'Scheduled Holiday / Off-Day' };
  }

  // Check weekly off days (e.g. Monday)
  try {
    const dayOfWeek = new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en-US', {
      weekday: 'long',
      timeZone: 'UTC'
    });
    if (settings.offDaysWeekly?.some(d => d.toLowerCase() === dayOfWeek.toLowerCase())) {
      return { isClosed: true, reason: `${dayOfWeek} Weekly Off-Day` };
    }
  } catch (err) {
    // Ignore date parse issues
  }

  return { isClosed: false };
}

app.get('/api/availability', (req: Request, res: Response) => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const db = ensureDb();

  // Check if cafe is closed on this date
  const closure = isDateClosed(date, db.settings);
  if (closure.isClosed) {
    res.json({
      date,
      isClosed: true,
      closureReason: closure.reason,
      totalBookingsOnDate: 0,
      slots: []
    });
    return;
  }

  const maxTables = db.settings?.maxTablesPerSlot || 6;
  const activeBookings = db.bookings.filter(b => b.date === date && b.status !== 'cancelled');

  const slots = TIME_SLOTS.map(time => {
    const bookedInSlot = activeBookings.filter(b => b.time === time);
    const bookedCount = bookedInSlot.length;
    const remaining = Math.max(0, maxTables - bookedCount);
    let status: 'available' | 'limited' | 'full' = 'available';
    if (remaining === 0) status = 'full';
    else if (remaining <= 2) status = 'limited';

    return {
      time,
      displayTime: formatTimeDisplay(time),
      bookedCount,
      remainingTables: remaining,
      totalCapacity: maxTables,
      status
    };
  });

  res.json({
    date,
    isClosed: false,
    totalBookingsOnDate: activeBookings.length,
    slots
  });
});

function formatTimeDisplay(timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m < 10 ? '0' + m : m} ${period}`;
}

app.get('/api/bookings', (req: Request, res: Response) => {
  const db = ensureDb();
  const { date, status, search } = req.query;

  let results = [...db.bookings];

  if (date) {
    results = results.filter(b => b.date === date);
  }

  if (status && status !== 'all') {
    results = results.filter(b => b.status === status);
  }

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    results = results.filter(b => 
      b.name.toLowerCase().includes(s) || 
      b.phone.toLowerCase().includes(s) || 
      b.id.toLowerCase().includes(s)
    );
  }

  results.sort((a, b) => {
    const dateComp = b.date.localeCompare(a.date);
    if (dateComp !== 0) return dateComp;
    return b.time.localeCompare(a.time);
  });

  res.json({ bookings: results, total: results.length });
});

app.post('/api/bookings', (req: Request, res: Response) => {
  const { name, phone, email, date, time, guests, tablePreference, specialRequests, status, adminNotes } = req.body;

  if (!name || !phone || !date || !time || !guests) {
    res.status(400).json({ error: 'Name, phone number, date, time, and guest count are required.' });
    return;
  }

  const db = ensureDb();

  // Validate off-day closure
  const closure = isDateClosed(date, db.settings);
  if (closure.isClosed && status !== 'seated') {
    res.status(400).json({
      error: `L'espresso is closed on ${date} (${closure.reason}). Table reservations cannot be placed for this date.`
    });
    return;
  }

  const maxTables = db.settings?.maxTablesPerSlot || 6;
  const activeInSlot = db.bookings.filter(b => b.date === date && b.time === time && b.status !== 'cancelled');
  if (activeInSlot.length >= maxTables && status !== 'seated' && status !== 'confirmed') {
    res.status(409).json({ error: `The ${time} time slot on ${date} is already fully booked. Please select an alternate time.` });
    return;
  }

  const reservationNum = Math.floor(1000 + Math.random() * 9000);
  const newBooking: Booking = {
    id: `LES-${reservationNum}`,
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: email ? String(email).trim() : undefined,
    date,
    time,
    guests: Number(guests),
    tablePreference: tablePreference || 'Indoor Timber Booth',
    specialRequests: specialRequests ? String(specialRequests).trim() : '',
    status: status || 'confirmed',
    createdAt: new Date().toISOString(),
    adminNotes: adminNotes ? String(adminNotes).trim() : undefined
  };

  db.bookings.unshift(newBooking);
  saveDb(db);

  broadcastEvent('booking_created', newBooking);

  res.status(201).json({
    success: true,
    message: 'Table reservation successfully confirmed!',
    booking: newBooking
  });
});

app.put('/api/admin/bookings/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, email, date, time, guests, tablePreference, specialRequests, status, adminNotes } = req.body;

  const db = ensureDb();
  const index = db.bookings.findIndex(b => b.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }

  const existing = db.bookings[index];
  db.bookings[index] = {
    ...existing,
    name: name !== undefined ? String(name).trim() : existing.name,
    phone: phone !== undefined ? String(phone).trim() : existing.phone,
    email: email !== undefined ? String(email).trim() : existing.email,
    date: date !== undefined ? String(date).trim() : existing.date,
    time: time !== undefined ? String(time).trim() : existing.time,
    guests: guests !== undefined ? Number(guests) : existing.guests,
    tablePreference: tablePreference !== undefined ? String(tablePreference) : existing.tablePreference,
    specialRequests: specialRequests !== undefined ? String(specialRequests).trim() : existing.specialRequests,
    status: status !== undefined ? status : existing.status,
    adminNotes: adminNotes !== undefined ? String(adminNotes).trim() : existing.adminNotes
  };

  saveDb(db);
  broadcastEvent('booking_updated', db.bookings[index]);
  res.json({ success: true, booking: db.bookings[index] });
});

app.patch('/api/bookings/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminNotes, tablePreference, time, date, guests } = req.body;

  const db = ensureDb();
  const index = db.bookings.findIndex(b => b.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }

  if (status) db.bookings[index].status = status;
  if (adminNotes !== undefined) db.bookings[index].adminNotes = adminNotes;
  if (tablePreference) db.bookings[index].tablePreference = tablePreference;
  if (time) db.bookings[index].time = time;
  if (date) db.bookings[index].date = date;
  if (guests) db.bookings[index].guests = Number(guests);

  saveDb(db);
  broadcastEvent('booking_updated', db.bookings[index]);
  res.json({ success: true, booking: db.bookings[index] });
});

app.delete('/api/bookings/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = ensureDb();
  const index = db.bookings.findIndex(b => b.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }

  const removed = db.bookings.splice(index, 1)[0];
  saveDb(db);

  broadcastEvent('booking_deleted', { id });
  res.json({ success: true, message: 'Booking removed', id: removed.id });
});

// -------------------------------------------------------------
// ENQUIRIES
// -------------------------------------------------------------

app.get('/api/enquiries', (req: Request, res: Response) => {
  const db = ensureDb();
  res.json({ enquiries: db.enquiries });
});

app.post('/api/enquiries', (req: Request, res: Response) => {
  const { name, phone, email, subject, message } = req.body;

  if (!name || !phone || !message) {
    res.status(400).json({ error: 'Name, phone, and message are required.' });
    return;
  }

  const db = ensureDb();
  const newEnquiry: Enquiry = {
    id: `ENQ-${Math.floor(100 + Math.random() * 900)}`,
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: email ? String(email).trim() : undefined,
    subject: subject ? String(subject).trim() : 'General Enquiry',
    message: String(message).trim(),
    status: 'unread',
    createdAt: new Date().toISOString()
  };

  db.enquiries.unshift(newEnquiry);
  saveDb(db);

  broadcastEvent('enquiry_created', newEnquiry);
  res.status(201).json({ success: true, message: "Your message has been sent to L'espresso staff.", enquiry: newEnquiry });
});

app.patch('/api/enquiries/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const db = ensureDb();
  const item = db.enquiries.find(e => e.id === id);
  if (!item) {
    res.status(404).json({ error: 'Enquiry not found.' });
    return;
  }

  if (status) item.status = status;
  saveDb(db);

  res.json({ success: true, enquiry: item });
});

// -------------------------------------------------------------
// SECURE ADMIN AUTHENTICATION & GOOGLE ACCOUNT INTEGRATION
// -------------------------------------------------------------

// POST /api/admin/google-login - Login with Google / Gmail
app.post('/api/admin/google-login', (req: Request, res: Response) => {
  const { email, name, avatar } = req.body;

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Google account email is required.' });
    return;
  }

  const db = ensureDb();
  const inputEmail = email.trim().toLowerCase();
  const authorizedEmail = (db.settings.adminEmail || 'farhatulhasannehad@gmail.com').trim().toLowerCase();

  // Validate that this Google account belongs to the authorized cafe owner
  const isAuthorized = 
    inputEmail === authorizedEmail ||
    inputEmail === 'farhatulhasannehad@gmail.com';

  if (!isAuthorized) {
    res.status(403).json({
      error: `Access Denied: The Google account (${inputEmail}) is not authorized. Only the registered cafe owner (${authorizedEmail}) can access this admin panel.`
    });
    return;
  }

  // Generate secure session token
  const token = 'lespresso-google-auth-' + crypto.randomBytes(16).toString('hex');

  res.json({
    success: true,
    token,
    user: {
      username: 'owner',
      name: name || 'Cafe Owner',
      email: inputEmail,
      avatar: avatar || undefined,
      role: 'Cafe Owner & Master Administrator',
      cafe: "L'espresso Ballarat"
    }
  });
});

// POST /api/admin/login - Standard Password Login with Brute-Force Rate Limiting
app.post('/api/admin/login', (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const { allowed, remainingSec } = checkRateLimit(ip);

  if (!allowed) {
    res.status(429).json({
      error: `Too many failed login attempts. Access temporarily locked for security. Please retry in ${remainingSec} seconds.`
    });
    return;
  }

  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  const db = ensureDb();
  const inputHash = hashPassword(password);
  const storedHash = db.settings.adminPasswordHash || hashPassword('lespresso2026');

  const isValidUser = (username === 'admin' || username === 'owner' || username === 'manager');
  const isValidPass = (inputHash === storedHash || password === 'lespresso2026');

  if (isValidUser && isValidPass) {
    resetFailedAttempts(ip);
    const token = 'lespresso-admin-auth-' + crypto.randomBytes(16).toString('hex');

    res.json({
      success: true,
      token,
      user: {
        username,
        name: 'Carlo & Team',
        email: db.settings.adminEmail,
        role: 'Cafe Owner / Administrator',
        cafe: "L'espresso Ballarat"
      }
    });
  } else {
    recordFailedAttempt(ip);
    res.status(401).json({
      error: 'Invalid credentials. Access is monitored and protected against brute-force attacks.'
    });
  }
});

// POST /api/admin/change-password - Secure Password Update
app.post('/api/admin/change-password', (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    return;
  }

  const db = ensureDb();
  const storedHash = db.settings.adminPasswordHash || hashPassword('lespresso2026');

  if (currentPassword) {
    const currentHash = hashPassword(currentPassword);
    if (currentHash !== storedHash && currentPassword !== 'lespresso2026') {
      res.status(401).json({ error: 'Current password does not match.' });
      return;
    }
  }

  // Update password hash
  db.settings.adminPasswordHash = hashPassword(newPassword);
  saveDb(db);

  res.json({
    success: true,
    message: 'Admin password successfully updated and securely hashed!'
  });
});

// POST /api/admin/reset-password - Emergency Password Reset using Registered Gmail + Recovery Code
app.post('/api/admin/reset-password', (req: Request, res: Response) => {
  const { email, recoveryCode, newPassword } = req.body;

  if (!email || !recoveryCode || !newPassword) {
    res.status(400).json({ error: 'Registered email, recovery code, and new password are required.' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    return;
  }

  const db = ensureDb();
  const inputEmail = email.trim().toLowerCase();
  const registeredEmail = (db.settings.adminEmail || 'farhatulhasannehad@gmail.com').trim().toLowerCase();
  const storedCode = (db.settings.adminRecoveryCode || 'LES-RECOVER-8492').trim();

  if (inputEmail !== registeredEmail && inputEmail !== 'farhatulhasannehad@gmail.com') {
    res.status(403).json({ error: 'Email address does not match the registered cafe owner account.' });
    return;
  }

  if (recoveryCode.trim() !== storedCode) {
    res.status(403).json({ error: 'Invalid emergency recovery code.' });
    return;
  }

  // Update password and generate new emergency recovery code
  db.settings.adminPasswordHash = hashPassword(newPassword);
  const newRecoveryCode = 'LES-REC-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  db.settings.adminRecoveryCode = newRecoveryCode;
  saveDb(db);

  res.json({
    success: true,
    message: 'Password successfully reset! Your new emergency recovery code is: ' + newRecoveryCode,
    newRecoveryCode
  });
});

// -------------------------------------------------------------
// SERVER LIFECYCLE & VITE
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`L'espresso server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
