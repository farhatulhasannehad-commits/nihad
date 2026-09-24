import React, { useState } from 'react';
import { MENU_ITEMS } from '../data/cafeData';
import { MenuItem } from '../types';
import { Sparkles, CalendarCheck, Utensils, Star } from 'lucide-react';

interface MenuSectionProps {
  onBookClick: () => void;
  menuItems?: MenuItem[];
  priceGuide?: string;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  onBookClick,
  menuItems = MENU_ITEMS,
  priceGuide = 'A$20–40 per person'
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Highlights' },
    { id: 'coffee', label: 'Artisan Coffee & Warm Drinks' },
    { id: 'brunch', label: 'Brunch & Morning Classics' },
    { id: 'mains', label: 'House Gnocchi & Mains' },
    { id: 'pastries', label: 'Morning Pastries & Sweets' },
    { id: 'wine', label: 'Regional Wine & Spritz' },
  ];

  const itemsToDisplay = (menuItems.length > 0 ? menuItems : MENU_ITEMS).filter(item => !item.hidden);

  const filteredItems = activeCategory === 'all'
    ? itemsToDisplay
    : itemsToDisplay.filter(item => item.category === activeCategory);

  return (
    <section id="menu" className="py-20 lg:py-28 bg-[#140c07] border-b border-[#29190f] relative text-[#fbf7f2]">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 text-left gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#dca771] mb-3 px-3 py-1 rounded bg-[#2b170c] border border-[#50301b]">
              <Utensils className="w-3.5 h-3.5 text-[#e5a85b]" />
              <span>Seasonal Kitchen & Bar</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight text-[#fbf7f2] leading-tight">
              Crafted from scratch, <br className="hidden sm:inline" />
              <span className="italic font-normal text-[#dfa467]">served with heart</span>.
            </h2>
            <p className="text-sm sm:text-base text-[#bda48f] mt-3 max-w-xl font-body">
              Every dish is prepared fresh daily in Ballarat Central — from 8-hour braised beef cheek ragù gnocchi to double-shot flat whites and toasted almond croissants.
            </p>
          </div>

          {/* Price Guide Note */}
          <div className="p-4 rounded-xl bg-[#1e130c] border border-[#3b2416] text-left max-w-sm shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase tracking-wider text-[#d6a575] font-semibold">Ballarat Price Guide</span>
              <span className="font-mono text-xs text-[#f1d0b0] font-medium">{priceGuide}</span>
            </div>
            <p className="text-xs text-[#9f8570]">
              Full dine-in service with table water, freshly baked bread & daily chalkboard specials. Takeaway available from 7 AM.
            </p>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ba7534] to-[#8d501e] text-white shadow-md shadow-black/40 border border-[#e5a85b]/40'
                    : 'bg-[#1b110a] text-[#bca38d] hover:text-white border border-[#382215] hover:border-[#52331f]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filteredItems.map((item: MenuItem) => (
            <div
              key={item.id}
              className="rounded-2xl bg-[#1a1009] border border-[#382315] hover:border-[#7c4c28] transition-all flex flex-col justify-between group overflow-hidden shadow-xl"
            >
              {/* Optional Dish Photography */}
              {item.image && (
                <div className="relative aspect-[16/10] overflow-hidden bg-black/50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1009] via-transparent to-transparent opacity-70" />
                  
                  {item.popular && (
                    <div className="absolute top-3 right-3 text-[10px] font-bold tracking-wide uppercase text-white bg-[#b56e2e]/90 backdrop-blur-sm border border-[#e3a35d]/60 px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current text-amber-300" />
                      <span>Chef Highlight</span>
                    </div>
                  )}

                  <div className="absolute bottom-2.5 left-3">
                    <span className="font-mono text-base text-white font-bold bg-[#140c07]/85 backdrop-blur-sm px-2.5 py-0.5 rounded-lg border border-[#4a2e1d]">
                      A${item.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {!item.image && (
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display text-xl sm:text-2xl text-[#f6eee5] font-medium group-hover:text-[#e0a96d] transition-colors leading-snug">
                        {item.name}
                      </h3>
                      {item.popular && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#e2a96f] bg-[#2d1b10] border border-[#4d301c] px-2 py-0.5 rounded-full shrink-0">
                          Highlight
                        </span>
                      )}
                    </div>
                  )}

                  {item.image && (
                    <h3 className="font-display text-xl sm:text-2xl text-[#f6eee5] font-medium group-hover:text-[#e0a96d] transition-colors leading-snug mb-2">
                      {item.name}
                    </h3>
                  )}

                  {!item.image && (
                    <div className="font-mono text-base text-[#e5af75] font-semibold mb-3">
                      A${item.price.toFixed(2)}
                    </div>
                  )}

                  <p className="text-sm text-[#a8907b] leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#2d1b11] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {item.dietary?.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] text-[#937b67]"
                      >
                        {tag}{idx < (item.dietary?.length || 0) - 1 ? ' · ' : ''}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={onBookClick}
                    className="text-xs text-[#dca771] hover:text-[#f3caa1] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Reserve table</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
