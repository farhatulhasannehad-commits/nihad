import React, { useState } from 'react';
import { Phone, CalendarCheck, Clock, MapPin, Menu as MenuIcon, X, Shield, Camera } from 'lucide-react';
import { CAFE_INFO } from '../data/cafeData';
import { CafeSettings } from '../types';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  settings?: CafeSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenAdmin,
  isAdminLoggedIn,
  settings
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const bannerNotice = settings?.bannerNotice || "Open Daily: 7:00 AM – 3:00 PM • 417 Sturt St, Ballarat Central";
  const phone = settings?.phone || CAFE_INFO.phone;
  const cleanPhone = settings?.cleanPhone || CAFE_INFO.cleanPhone;
  const address = settings?.address || CAFE_INFO.address;

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#160f0a]/95 backdrop-blur-md border-b border-[#342317] transition-all">
      {/* Top Banner Notice */}
      <div className="bg-[#24160e] text-[#d6b48c] text-xs py-1.5 px-4 border-b border-[#3b271a] flex justify-between items-center text-center sm:text-left">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 max-w-7xl">
          <div className="flex items-center gap-4 text-[13px]">
            <span className="flex items-center gap-1.5 text-[#e5c296]">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {bannerNotice}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[13px]">
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center gap-1.5 text-[#e8c89c] hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#d6a354]" />
              <span>{phone}</span>
            </a>
            <span className="text-[#8a684b]">•</span>
            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors ${
                isAdminLoggedIn
                  ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50'
                  : 'text-[#9c7857] hover:text-[#e8c89c]'
              }`}
              title="Cafe Owner & Staff Admin Portal"
            >
              <Shield className="w-3 h-3" />
              <span>{isAdminLoggedIn ? 'Admin Panel (Live)' : 'Owner Portal'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="container mx-auto px-4 sm:px-6 max-w-7xl py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#"
          className="flex flex-col group text-left"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <span className="font-display text-2xl sm:text-3xl tracking-tight text-[#f5eee6] group-hover:text-[#e0a96d] transition-colors font-medium">
            L'espresso
          </span>
          <span className="text-[11px] uppercase tracking-[0.22em] text-[#9e7652] font-medium -mt-1">
            Ballarat • Central
          </span>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-7 text-[14.5px] font-medium text-[#d9c4b1]">
          <button
            onClick={() => scrollTo('story')}
            className="hover:text-[#f3caa1] transition-colors cursor-pointer"
          >
            Our Story
          </button>
          <button
            onClick={() => scrollTo('gallery')}
            className="hover:text-[#f3caa1] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5 text-[#e5a85b]" />
            <span>Atmosphere & Photos</span>
          </button>
          <button
            onClick={() => scrollTo('menu')}
            className="hover:text-[#f3caa1] transition-colors cursor-pointer"
          >
            Seasonal Menu
          </button>
          <button
            onClick={() => scrollTo('booking')}
            className="hover:text-[#f3caa1] transition-colors cursor-pointer"
          >
            Table Reservation
          </button>
          <button
            onClick={() => scrollTo('reviews')}
            className="hover:text-[#f3caa1] transition-colors cursor-pointer"
          >
            Reviews (4.5★)
          </button>
          <button
            onClick={() => scrollTo('hours-contact')}
            className="hover:text-[#f3caa1] transition-colors cursor-pointer"
          >
            Hours & Contact
          </button>
        </div>

        {/* Action Button & Admin Link */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenAdmin}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              isAdminLoggedIn
                ? 'bg-amber-950/80 text-amber-200 border-amber-800'
                : 'bg-[#22150e] hover:bg-[#2d1b11] text-[#caa88f] border-[#442817]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#e5a85b]" />
            <span>Admin Control</span>
          </button>

          <button
            onClick={onOpenBooking}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ba7534] to-[#8d501e] hover:from-[#c88240] hover:to-[#9a5924] text-white text-sm font-semibold transition-all shadow-md shadow-black/40 flex items-center gap-2 cursor-pointer border border-[#e5a85b]/30"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Book a Table</span>
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onOpenBooking}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#b57437] to-[#864c1b] text-white text-xs font-semibold"
          >
            Book
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#25170f] text-[#d6b79c] hover:text-white border border-[#3e271a]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1a110a] border-b border-[#3b2416] px-4 py-5 space-y-3 text-left">
          <button
            onClick={() => scrollTo('story')}
            className="block w-full text-left py-2 text-sm text-[#e4ceba] hover:text-white"
          >
            Our Story
          </button>
          <button
            onClick={() => scrollTo('gallery')}
            className="block w-full text-left py-2 text-sm text-[#e4ceba] hover:text-white"
          >
            Atmosphere & Photo Chronicle
          </button>
          <button
            onClick={() => scrollTo('menu')}
            className="block w-full text-left py-2 text-sm text-[#e4ceba] hover:text-white"
          >
            Seasonal Menu Highlights
          </button>
          <button
            onClick={() => scrollTo('booking')}
            className="block w-full text-left py-2 text-sm text-[#e4ceba] hover:text-white"
          >
            Table Reservation (Real-Time Availability)
          </button>
          <button
            onClick={() => scrollTo('reviews')}
            className="block w-full text-left py-2 text-sm text-[#e4ceba] hover:text-white"
          >
            Guest Reviews (4.5 Stars)
          </button>
          <button
            onClick={() => scrollTo('hours-contact')}
            className="block w-full text-left py-2 text-sm text-[#e4ceba] hover:text-white"
          >
            Opening Hours & Map
          </button>

          <div className="pt-3 border-t border-[#2e1d13] flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="py-2.5 rounded-xl bg-[#281810] text-[#e0a96d] text-xs font-semibold border border-[#4d2f1b] flex items-center justify-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Management Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
