import React from 'react';
import { Phone, MapPin, Clock, Shield, Heart } from 'lucide-react';
import { CAFE_INFO } from '../data/cafeData';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenBooking }) => {
  return (
    <footer className="bg-[#0e0703] border-t border-[#24150b] text-[#b89e89] py-14 text-left">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#24150b]">
          
          {/* Brand & Vision */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex flex-col">
              <span className="font-display text-3xl font-semibold text-white tracking-tight">
                L'espresso
              </span>
              <span className="text-xs uppercase tracking-[0.25em] text-[#9a7553] font-medium -mt-1">
                Ballarat Central • Victoria
              </span>
            </div>
            <p className="text-sm text-[#9f8570] leading-relaxed max-w-sm font-body">
              An iconic Ballarat cafe where Victorian coffee culture meets the warm, intimate soul of an Italian wine bar. Hand-rolled gnocchi, eggs benedict, and dark timber booths.
            </p>
            <div className="pt-2 text-xs text-[#d6a575]">
              Rating: 4.5 ★ from 908 Google Reviews · Open 7 Days
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-3 space-y-3 text-sm">
            <h4 className="font-display text-base text-[#f5eee6] font-semibold tracking-wide">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-[#a98f78]">
              <li>
                <a href="#story" className="hover:text-[#f3caa1] transition-colors">Our Story & Heritage</a>
              </li>
              <li>
                <a href="#menu" className="hover:text-[#f3caa1] transition-colors">Seasonal Menu & Gnocchi</a>
              </li>
              <li>
                <button onClick={onOpenBooking} className="hover:text-[#f3caa1] transition-colors text-left">
                  Live Table Booking
                </button>
              </li>
              <li>
                <a href="#reviews" className="hover:text-[#f3caa1] transition-colors">Customer Reviews (4.5★)</a>
              </li>
              <li>
                <a href="#hours-contact" className="hover:text-[#f3caa1] transition-colors">Hours & Location</a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <h4 className="font-display text-base text-[#f5eee6] font-semibold tracking-wide">
              Location & Hours
            </h4>
            <div className="space-y-2.5 text-[#a98f78]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#dfa467] shrink-0 mt-0.5" />
                <span>{CAFE_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#dfa467] shrink-0" />
                <a href={`tel:${CAFE_INFO.cleanPhone}`} className="hover:text-white transition-colors">
                  {CAFE_INFO.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#dfa467] shrink-0" />
                <span>Open Every Day: 7:00 AM – 3:00 PM</span>
              </div>
              <div className="pt-2">
                <a
                  href={CAFE_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#e2ab71] hover:underline"
                >
                  Get Directions in Google Maps →
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7e6451]">
          <div>
            © {new Date().getFullYear()} L'espresso Ballarat. All rights reserved. 417 Sturt St, Ballarat Central VIC 3350.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 text-[#a8886e] hover:text-[#f3caa1] transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Staff & Owner Portal</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
