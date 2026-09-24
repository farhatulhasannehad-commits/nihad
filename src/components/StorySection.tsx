import React from 'react';
import { Coffee, Flame, HeartHandshake, Wine, Sparkles } from 'lucide-react';
import { CafeSettings } from '../types';

interface StorySectionProps {
  settings?: CafeSettings;
}

export const StorySection: React.FC<StorySectionProps> = ({ settings }) => {
  const quote = settings?.storyQuote || "Where Italian heritage, jazz vinyl, and Victorian coffee culture come together on Sturt Street.";
  const description = settings?.storyDescription || "Founded on Ballarat’s grand central boulevard, L’espresso captures the nostalgic romance of Melbourne’s laneway cafes combined with the deep, unhurried warmth of a North Italian espresso and wine bar.";

  return (
    <section id="story" className="py-20 lg:py-28 bg-[#110a06] border-b border-[#29190f] relative overflow-hidden text-[#fcf9f5]">
      
      {/* Subtle background glow */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#8b5526]/10 rounded-full blur-3xl pointer-events-none"
      />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 text-left">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c9955e] mb-3 px-3 py-1 rounded bg-[#2b170c] border border-[#50301b]">
            <Sparkles className="w-3.5 h-3.5 text-[#e5a85b]" />
            <span>Our Ballarat Heritage</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight text-[#fcf9f5] leading-tight mb-5">
            Where dark timber, vinyl jazz & <span className="italic font-normal text-[#dfa467]">coffee craftsmanship</span> meet.
          </h2>
          <p className="text-base sm:text-lg text-[#b8a08c] leading-relaxed font-body">
            {description}
          </p>
        </div>

        {/* 4 Story Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          
          <div className="p-6 rounded-2xl bg-[#1a110a] border border-[#3b2416] hover:border-[#633e24] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#28180e] border border-[#4d2f1b] flex items-center justify-center text-[#e0a96d] mb-5">
              <Coffee className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl text-[#f5ede5] font-semibold mb-2.5">
              Artisan Double Ristrettos
            </h3>
            <p className="text-sm text-[#9f8570] leading-relaxed">
              We extract our espresso with meticulous patience. Silky flat whites, rich magics, and slow pour-overs roasted to highlight notes of caramel, toasted hazelnut, and dark cocoa.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#1a110a] border border-[#3b2416] hover:border-[#633e24] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#28180e] border border-[#4d2f1b] flex items-center justify-center text-[#e0a96d] mb-5">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl text-[#f5ede5] font-semibold mb-2.5">
              Hand-Rolled Daily Gnocchi
            </h3>
            <p className="text-sm text-[#9f8570] leading-relaxed">
              Our kitchen prepares authentic potato gnocchi each morning. Pillow-soft and tossed in 8-hour braised beef cheek ragù or fragrant wild forest mushrooms with hazelnut butter.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#1a110a] border border-[#3b2416] hover:border-[#633e24] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#28180e] border border-[#4d2f1b] flex items-center justify-center text-[#e0a96d] mb-5">
              <Wine className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl text-[#f5ede5] font-semibold mb-2.5">
              Cozy Wine-Bar Atmosphere
            </h3>
            <p className="text-sm text-[#9f8570] leading-relaxed">
              Deep leather banquettes, weathered timber tables, hand-written chalkboards, and curated Pyrenees regional wines for those who love leisurely European dining.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#1a110a] border border-[#3b2416] hover:border-[#633e24] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#28180e] border border-[#4d2f1b] flex items-center justify-center text-[#e0a96d] mb-5">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl text-[#f5ede5] font-semibold mb-2.5">
              Victorian Farm Hospitality
            </h3>
            <p className="text-sm text-[#9f8570] leading-relaxed">
              We partner directly with Western Victoria producers: free-range Otway pork, Ballarat bakery sourdoughs, local Meredith goat feta, and Victorian dairy.
            </p>
          </div>

        </div>

        {/* Atmosphere Vignette Banner */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-[#21140c] via-[#29190e] to-[#1c110a] border border-[#422919] flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div>
            <h4 className="font-display text-2xl text-[#fbf7f2] font-semibold mb-1">
              "{quote}"
            </h4>
            <p className="text-sm text-[#b59a83]">
              Dine in our dark timber booths or grab a quick takeaway flat white on your morning walk down Sturt Street.
            </p>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <div className="text-center md:text-right">
              <div className="font-display text-3xl font-bold text-[#e5ad73]">4.5 ★</div>
              <div className="text-xs text-[#9f8570]">908 Verified Reviews</div>
            </div>
            <div className="h-10 w-px bg-[#4d3221]" />
            <div className="text-center md:text-right">
              <div className="font-display text-3xl font-bold text-[#e5ad73]">7 AM</div>
              <div className="text-xs text-[#9f8570]">Open 7 Days</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
