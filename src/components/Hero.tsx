import React from 'react';
import { Star, Clock, MapPin, Phone, CalendarCheck, ArrowRight, Utensils, Compass } from 'lucide-react';
import { CAFE_INFO } from '../data/cafeData';
import { CafeSettings } from '../types';

interface HeroProps {
  onBookClick: () => void;
  onMenuClick: () => void;
  settings?: CafeSettings;
}

export const Hero: React.FC<HeroProps> = ({ onBookClick, onMenuClick, settings }) => {
  const headline = settings?.heroHeadline || "Artisan espresso, hand-rolled gnocchi & warm timber soul.";
  const description = settings?.heroDescription || "For decades, L'espresso has been Ballarat’s beloved retreat. Settle into dark leather booths under warm jarrah timber beams, browse our iconic jazz & blues record walls, and enjoy Melbourne-standard coffee, crisp eggs benedict, and slow-cooked beef cheek ragù gnocchi.";
  const priceGuide = settings?.priceGuide || CAFE_INFO.priceGuide;
  const mapsUrl = settings?.googleMapsUrl || CAFE_INFO.googleMapsUrl;
  const cleanPhone = settings?.cleanPhone || CAFE_INFO.cleanPhone;
  const phone = settings?.phone || CAFE_INFO.phone;
  const hours = settings?.hoursText || "Open 7:00 AM – 3:00 PM Daily";

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#1c120a] via-[#160e08] to-[#120a05] pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-[#3b2416]">
      {/* Warm Ambient Honey & Amber Glow */}
      <div 
        aria-hidden="true" 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-[#c87d3b]/15 via-[#8a4a1c]/10 to-transparent blur-3xl pointer-events-none"
      />
      <div 
        aria-hidden="true" 
        className="absolute top-20 right-10 w-96 h-96 rounded-full bg-[#e5a855]/10 blur-3xl pointer-events-none"
      />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Editorial Kicker */}
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#e8ba84] tracking-widest uppercase font-semibold mb-4 px-3.5 py-1.5 rounded-full bg-[#2c180e] border border-[#5d371d] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#e8a34d] animate-pulse" />
              <span>417 Sturt Street • Ballarat Central VIC</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-[#fdfbf7] leading-[1.08] mb-6 text-balance">
              {headline}
            </h1>

            {/* Editorial Description */}
            <p className="text-base sm:text-lg text-[#d8c2ad] leading-relaxed max-w-2xl mb-8 font-normal font-body">
              {description}
            </p>

            {/* Quick Proof Badges */}
            <div className="flex flex-wrap items-center gap-y-2.5 gap-x-5 text-xs sm:text-sm text-[#c7af99] mb-9 pb-6 border-b border-[#352115] w-full">
              <div className="flex items-center gap-1.5 text-[#f9dfbf]">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-semibold text-white ml-1">{CAFE_INFO.rating}</span>
                <span className="text-[#bba089]">({CAFE_INFO.reviewsCount} Google Reviews)</span>
              </div>
              <span className="hidden sm:inline text-[#543522]">•</span>
              <div className="flex items-center gap-1.5 text-[#dbc6b3]">
                <Clock className="w-4 h-4 text-[#e09c48]" />
                <span>{hours}</span>
              </div>
              <span className="hidden sm:inline text-[#543522]">•</span>
              <div className="flex items-center gap-1.5 text-[#dbc6b3]">
                <span className="text-[#e09c48] font-medium">Guide:</span>
                <span>{priceGuide}</span>
              </div>
            </div>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <button
                onClick={onBookClick}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#bf7834] via-[#a86526] to-[#804618] hover:from-[#d1863d] hover:to-[#91501d] text-white font-medium text-base shadow-xl shadow-black/50 transition-all flex items-center justify-center gap-2.5 border border-[#e5a85b]/40 cursor-pointer active:scale-[0.98]"
              >
                <CalendarCheck className="w-5 h-5 text-amber-100" />
                <span>Book a Table Online</span>
                <ArrowRight className="w-4 h-4 text-amber-100/80 ml-1" />
              </button>

              <button
                onClick={onMenuClick}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#26170e] hover:bg-[#332014] text-[#f0dac5] hover:text-white font-medium text-base border border-[#52331f] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Utensils className="w-4 h-4 text-[#de9a50]" />
                <span>Seasonal Menu</span>
              </button>

              <a
                href={`tel:${cleanPhone}`}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[#1d120a] hover:bg-[#281a0f] text-[#d6b79c] hover:text-[#f8d4ad] text-sm font-medium border border-[#3e2718] transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-[#e09c48]" />
                <span>{phone}</span>
              </a>
            </div>

            {/* Google Maps Quick Link */}
            <div className="mt-6 flex items-center gap-2 text-xs text-[#a48870]">
              <MapPin className="w-4 h-4 text-[#e09c48]" />
              <span>417 Sturt St, Ballarat Central VIC 3350</span>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#e5a85b] hover:text-[#ffd29d] underline ml-1 font-medium"
              >
                <Compass className="w-3.5 h-3.5 inline" />
                <span>Open in Google Maps</span>
              </a>
            </div>

          </div>

          {/* Right Column: Visual Photo Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-lg">
              
              {/* Primary Photo: Warm Wood Interior & Dining Booths */}
              <div className="rounded-3xl overflow-hidden border-2 border-[#54351f] shadow-2xl bg-[#180e07] relative aspect-[4/3] group">
                <img
                  src={CAFE_INFO.interiorWoodImage}
                  alt="L'espresso Ballarat Cozy Timber Interior with Jazz CDs and Warm Lighting"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <span className="text-[11px] uppercase tracking-wider text-[#e5a85b] font-semibold block mb-1">
                    Authentic Ballarat Ambiance
                  </span>
                  <h3 className="font-display text-xl text-white font-medium">
                    The Iconic Jazz CD Wall & Rich Timber Booths
                  </h3>
                </div>
              </div>

              {/* Floating Accent 1: Coffee Craft & Latte Art */}
              <div className="absolute -bottom-6 -left-6 w-48 sm:w-56 rounded-2xl overflow-hidden border-2 border-[#664127] shadow-2xl bg-[#180e07] hidden sm:block">
                <div className="relative aspect-video">
                  <img
                    src={CAFE_INFO.coffeeCraftImage}
                    alt="L'espresso Ballarat Fresh Flat White Extraction"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                </div>
                <div className="p-3 bg-[#1d120a] text-left">
                  <span className="text-[10px] text-[#e5a85b] uppercase font-bold tracking-wider block">Coffee Craft</span>
                  <p className="text-xs text-[#d8c2ad] font-medium leading-tight">Specialty Melbourne-standard espresso</p>
                </div>
              </div>

              {/* Floating Accent 2: Handmade Gnocchi Card */}
              <div className="absolute -top-6 -right-6 w-48 sm:w-52 rounded-2xl overflow-hidden border-2 border-[#664127] shadow-2xl bg-[#1d120a] hidden sm:block">
                <div className="relative aspect-[16/10]">
                  <img
                    src={CAFE_INFO.gnocchiDishImage}
                    alt="Handmade Potato Gnocchi at L'espresso"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/25" />
                </div>
                <div className="p-2.5 bg-[#1e130b] text-left">
                  <span className="text-[10px] text-[#e5a85b] uppercase font-bold tracking-wider block">Kitchen Specialty</span>
                  <p className="text-xs text-[#d8c2ad] font-medium leading-tight">Handmade potato gnocchi & ragù</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
