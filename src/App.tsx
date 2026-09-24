import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StorySection } from './components/StorySection';
import { AtmosphereGallery } from './components/AtmosphereGallery';
import { MenuSection } from './components/MenuSection';
import { BookingSection } from './components/BookingSection';
import { ReviewsSection } from './components/ReviewsSection';
import { HoursAndContactSection } from './components/HoursAndContactSection';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { AdminUser, MenuItem, CafeSettings } from './types';
import { Phone, CalendarCheck } from 'lucide-react';
import { CAFE_INFO, MENU_ITEMS } from './data/cafeData';

export default function App() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Live state for menu & settings (synchronized with backend)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [settings, setSettings] = useState<CafeSettings | null>(null);

  // Fetch initial menu & settings from backend
  const fetchWebsiteData = async () => {
    try {
      const [resMenu, resSettings] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/settings')
      ]);

      if (resMenu.ok) {
        const data = await resMenu.json();
        if (data.menu && data.menu.length > 0) {
          setMenuItems(data.menu);
        }
      }

      if (resSettings.ok) {
        const data = await resSettings.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (err) {
      console.warn('Backend data load error (fallback to local constants):', err);
    }
  };

  useEffect(() => {
    fetchWebsiteData();

    // Check saved admin session
    const saved = localStorage.getItem('lespresso_admin_session');
    if (saved) {
      try {
        setAdminUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('lespresso_admin_session');
      }
    }

    // Subscribe to SSE stream for real-time live synchronization
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/realtime/stream');

      eventSource.addEventListener('menu_updated', () => {
        fetch('/api/menu')
          .then(r => r.json())
          .then(data => {
            if (data.menu) setMenuItems(data.menu);
          })
          .catch(console.error);
      });

      eventSource.addEventListener('settings_updated', (e: MessageEvent) => {
        try {
          const updatedSettings = JSON.parse(e.data);
          setSettings(updatedSettings);
        } catch (err) {
          console.error('Error parsing settings update:', err);
        }
      });
    } catch (err) {
      console.warn('SSE subscription failed:', err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    localStorage.setItem('lespresso_admin_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('lespresso_admin_session');
  };

  const scrollToBooking = () => {
    const el = document.getElementById('booking');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMenu = () => {
    const el = document.getElementById('menu');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const cleanPhone = settings?.cleanPhone || CAFE_INFO.cleanPhone;
  const phone = settings?.phone || CAFE_INFO.phone;

  return (
    <div className="min-h-screen bg-[#120c08] text-[#f7f3ee] flex flex-col selection:bg-[#c6893f] selection:text-white font-sans">
      
      {/* Main Navbar with Live Admin and Settings status */}
      <Navbar
        onOpenBooking={scrollToBooking}
        onOpenAdmin={() => setAdminOpen(true)}
        isAdminLoggedIn={!!adminUser}
        settings={settings || undefined}
      />

      {/* Main Page Sections */}
      <main className="flex-1">
        <Hero
          onBookClick={scrollToBooking}
          onMenuClick={scrollToMenu}
          settings={settings || undefined}
        />
        <StorySection settings={settings || undefined} />
        <AtmosphereGallery />
        <MenuSection
          onBookClick={scrollToBooking}
          menuItems={menuItems}
          priceGuide={settings?.priceGuide}
        />
        <BookingSection settings={settings || undefined} />
        <ReviewsSection />
        <HoursAndContactSection settings={settings || undefined} />
      </main>

      {/* Footer */}
      <Footer
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenBooking={scrollToBooking}
      />

      {/* Admin Panel Modal / Full Control System */}
      {adminOpen && (
        <AdminPanel
          onClose={() => setAdminOpen(false)}
          isLoggedIn={!!adminUser}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
        />
      )}

      {/* Sticky Mobile Floating Reserve Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 p-2.5 bg-[#170f09]/95 backdrop-blur-md border-t border-[#3b2416] flex items-center gap-2">
        <a
          href={`tel:${cleanPhone}`}
          className="flex-1 py-2.5 rounded-xl bg-[#24160d] border border-[#482c19] text-[#e0c3a8] text-xs font-medium flex items-center justify-center gap-1.5"
        >
          <Phone className="w-3.5 h-3.5 text-[#dfa467]" />
          <span>Call {phone}</span>
        </a>

        <button
          onClick={scrollToBooking}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#b57437] to-[#864c1b] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-black/50"
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Book a Table</span>
        </button>
      </div>

    </div>
  );
}
