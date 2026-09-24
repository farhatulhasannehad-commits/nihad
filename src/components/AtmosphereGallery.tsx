import React, { useState } from 'react';
import { CAFE_GALLERY_PHOTOS, CafePhoto, CAFE_INFO } from '../data/cafeData';
import { Camera, MapPin, Sparkles, X, ChevronRight, Compass } from 'lucide-react';

export const AtmosphereGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePhoto, setActivePhoto] = useState<CafePhoto | null>(null);

  const categories = [
    { id: 'all', label: 'All Photos (8)' },
    { id: 'Interior & Atmosphere', label: 'Cozy Wood & Jazz Wall' },
    { id: 'Coffee Craft', label: 'Coffee & Roasting' },
    { id: 'Kitchen Specialties', label: 'Housemade Gnocchi & Brunch' },
    { id: 'Al Fresco Dining', label: 'Sturt Street Verandah' },
  ];

  const filteredPhotos = selectedCategory === 'all'
    ? CAFE_GALLERY_PHOTOS
    : CAFE_GALLERY_PHOTOS.filter(p => p.category.toLowerCase().includes(selectedCategory.toLowerCase()) || p.category === selectedCategory);

  return (
    <section id="gallery" className="py-20 bg-gradient-to-b from-[#120a05] via-[#170e08] to-[#120a05] text-[#f7f3ee] border-b border-[#342013]">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 text-left gap-6 border-b border-[#311e13] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#e5a85b] mb-2 px-3 py-1 rounded bg-[#2b170d] border border-[#52321c]">
              <Camera className="w-3.5 h-3.5 text-[#e5a85b]" />
              <span>417 Sturt Street Visual Chronicle</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight text-white">
              Inside L'espresso: <span className="italic font-normal text-[#dfa467]">Wood, Jazz & Flavour</span>
            </h2>
            <p className="text-sm sm:text-base text-[#c9b19b] mt-3 max-w-xl font-body">
              A glimpse into our wood-lined sanctuary in Ballarat Central — from the legendary jazz CD wall to fresh potato gnocchi and morning flat whites.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <a
              href={CAFE_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#26170e] hover:bg-[#342014] border border-[#50311c] text-[#eac39d] text-xs font-medium flex items-center gap-2 transition-all shadow-md"
            >
              <Compass className="w-4 h-4 text-[#e09c48]" />
              <span>Open Google Maps Pin</span>
            </a>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-[#ba7534] to-[#8d501e] text-white shadow-md shadow-black/50 border border-[#e5a85b]/40'
                  : 'bg-[#20130a] text-[#bca087] hover:text-white hover:bg-[#2b190f] border border-[#3b2315]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setActivePhoto(photo)}
              className="group relative rounded-2xl overflow-hidden bg-[#1b1009] border border-[#3f2718] hover:border-[#8f5a2f] transition-all duration-300 shadow-xl cursor-pointer flex flex-col"
            >
              {/* Photo Image Aspect */}
              <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1b1009] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                
                {/* Category Pill */}
                <div className="absolute top-3 left-3 bg-[#170e08]/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-semibold text-[#eac39d] border border-[#4d2f1b]">
                  {photo.category}
                </div>
              </div>

              {/* Caption Card */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-lg text-white font-medium group-hover:text-[#e8b67f] transition-colors leading-tight mb-1.5">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-[#a98f79] line-clamp-2 leading-relaxed">
                    {photo.description}
                  </p>
                </div>
                
                <div className="mt-3 pt-2.5 border-t border-[#2e1c11] flex items-center justify-between text-[11px] text-[#cca57c]">
                  <span>Click to view</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#e5a85b] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner Note on Sturt Street Ambience */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-[#24150c] via-[#2d1b11] to-[#1c1008] p-6 border border-[#4a2e1c] flex flex-col md:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#3d2313] border border-[#6b3f21] flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-[#e8ba84]" />
            </div>
            <div>
              <h4 className="font-display text-lg text-white font-medium">
                Historic Sturt Street Plane Trees & European Cafe Charm
              </h4>
              <p className="text-xs text-[#b89f89]">
                L'espresso is located at 417 Sturt St opposite historic gardens. Enjoy indoor timber booths or outdoor dining.
              </p>
            </div>
          </div>
          <a
            href={CAFE_INFO.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b87434] to-[#884c1b] hover:from-[#c88240] hover:to-[#96551f] text-white text-xs font-semibold transition-all shadow-md shadow-black/40"
          >
            Get Directions on Maps
          </a>
        </div>

      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActivePhoto(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-[#1c1109] rounded-2xl overflow-hidden border border-[#52331f] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 text-white hover:bg-black flex items-center justify-center border border-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-black">
              <img
                src={activePhoto.url}
                alt={activePhoto.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-6 text-left bg-gradient-to-t from-[#160d07] to-[#1c1109] border-t border-[#3b2517]">
              <span className="text-xs uppercase tracking-widest text-[#e5a85b] font-semibold block mb-1">
                {activePhoto.category}
              </span>
              <h3 className="font-display text-2xl text-white font-medium mb-2">
                {activePhoto.title}
              </h3>
              <p className="text-sm text-[#ceb59f] leading-relaxed">
                {activePhoto.description}
              </p>
              <div className="mt-4 pt-3 border-t border-[#2d1b11] flex items-center justify-between text-xs text-[#9f836b]">
                <span>L'espresso Ballarat • 417 Sturt Street</span>
                <span>Open 7:00 AM – 3:00 PM Daily</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
