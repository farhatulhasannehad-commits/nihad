import { MenuItem, Review } from '../types';

export const CAFE_INFO = {
  name: "L'espresso",
  tagline: "Iconic Coffee, House Gnocchi & Warm Timber Hospitality",
  address: "417 Sturt St, Ballarat Central VIC 3350, Australia",
  phone: "+61 3 5333 1789",
  cleanPhone: "+61353331789",
  hoursText: "Open every day: 7:00 AM – 3:00 PM",
  kitchenHours: "Kitchen serves 7:00 AM – 2:30 PM",
  rating: 4.5,
  reviewsCount: 908,
  priceGuide: "A$20–40 per person",
  googleMapsUrl: "https://maps.app.goo.gl/dejNeYBhLNy7xsF6A",
  googleMapsEmbed: "https://www.google.com/maps?q=417+Sturt+St,+Ballarat+Central+VIC+3350&output=embed",
  atmosphere: "Warm golden-brown timber, rustic wood accents, cozy wine-bar feel, dark leather seating, jazz and blues CD wall, chalkboards.",
  heroImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
  interiorWoodImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
  coffeeCraftImage: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
  gnocchiDishImage: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
  outdoorSturtImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
};

export interface CafePhoto {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
}

export const CAFE_GALLERY_PHOTOS: CafePhoto[] = [
  {
    id: 'p1',
    title: 'Warm Wood-Lined Dining Room',
    category: 'Interior & Atmosphere',
    description: 'Deep jarrah timber booths, warm golden lighting, and our iconic jazz and blues CD collection wall.',
    url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'p2',
    title: 'Artisan Espresso & Flat Whites',
    category: 'Coffee Craft',
    description: 'Double-ristretto extractions prepared on commercial La Marzocco machines with velvety Victorian dairy microfoam.',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p3',
    title: 'Hand-Rolled Potato Gnocchi',
    category: 'Kitchen Specialties',
    description: 'Pillow-soft Italian potato gnocchi prepared fresh daily and tossed in our 8-hour slow-cooked beef cheek ragù.',
    url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p4',
    title: 'Classic Eggs Benedict on Brioche',
    category: 'Brunch Favorites',
    description: 'Free-range poached eggs, house-made tarragon hollandaise, and double-smoked Otway ham.',
    url: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p5',
    title: 'Famous Smashed Avo & Goat Feta',
    category: 'Brunch Favorites',
    description: 'Fresh Hass avocado on toasted 1816 bakery sourdough with Victorian marinated goat feta and toasted dukkah.',
    url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p6',
    title: 'Golden Almond Croissants & Pastries',
    category: 'Morning Bakery',
    description: 'Twice-baked almond croissants loaded with frangipane cream, fresh pain au chocolat, and artisan scrolls.',
    url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p7',
    title: 'Sturt Street Verandah Seating',
    category: 'Al Fresco Dining',
    description: 'Bask in Ballarat sunshine under the historic plane trees of Sturt Street with coffee or regional wine.',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p8',
    title: 'Cozy Timber Wine Bar Corner',
    category: 'Wine Bar Vibe',
    description: 'An intimate retreat for afternoon King Valley prosecco, Pyrenees pinot noir, and antipasti.',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80'
  }
];

export const MENU_ITEMS: MenuItem[] = [
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
    name: 'L\'espresso Magic',
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
    name: 'L\'espresso Classic Eggs Benedict',
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
    description: 'Crisp fried pastry shell piped fresh with sweetened sheep\'s milk ricotta, candied orange peel, and crushed pistachio tips.',
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

export const REVIEWS: Review[] = [
  {
    id: 'r1',
    author: 'Callum Davies',
    rating: 5,
    date: '2 weeks ago',
    comment: 'L\'espresso is an absolute Ballarat institution! The dark timber interior, vinyl jazz playing in the background, and the best flat white on Sturt St. The potato gnocchi is Michelin-level comforting.',
    source: 'Google Local Guide (Level 6)',
    tag: 'Coffee & Gnocchi'
  },
  {
    id: 'r2',
    author: 'Sophie & Tom Walker',
    rating: 5,
    date: '1 month ago',
    comment: 'Booked a table for Sunday brunch. Service was faultless and prompt despite being completely packed. The eggs benedict and smashed avo with goat feta were bursting with fresh Victorian produce.',
    source: 'Google Review',
    tag: 'Sunday Brunch'
  },
  {
    id: 'r3',
    author: 'Matilda Vance',
    rating: 5,
    date: '3 weeks ago',
    comment: 'Feels like stepping into an intimate European wine bar that happens to roast sublime espresso. Love sitting in the timber booths surrounded by books, CDs, and chalkboard menus.',
    source: 'Google Review',
    tag: 'Cozy Atmosphere'
  },
  {
    id: 'r4',
    author: 'Dr. Alistair Ross',
    rating: 4,
    date: '2 months ago',
    comment: 'Superb hot chocolate and almond croissant. If you are visiting Ballarat for sovereign hill or art gallery, this is without doubt the cafe to stop at. Booking ahead is definitely recommended!',
    source: 'TripAdvisor Verified',
    tag: 'Pastries & Hot Chocolate'
  },
  {
    id: 'r5',
    author: 'Elena Rossi',
    rating: 5,
    date: 'Recent',
    comment: 'As someone with Italian roots, finding true al-dente gnocchi and proper Italian roast coffee outside Carlton is rare. L\'espresso delivers authenticity with warmth and rustic soul.',
    source: 'Google Review',
    tag: 'Authentic Quality'
  }
];
