import React, { useState } from 'react';
import { Clock, Phone, MapPin, Send, CheckCircle2, AlertCircle, ExternalLink, Mail, Compass } from 'lucide-react';
import { CAFE_INFO } from '../data/cafeData';
import { CafeSettings } from '../types';

interface HoursAndContactSectionProps {
  settings?: CafeSettings;
}

export const HoursAndContactSection: React.FC<HoursAndContactSectionProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePhone = settings?.phone || CAFE_INFO.phone;
  const activeCleanPhone = settings?.cleanPhone || CAFE_INFO.cleanPhone;
  const activeAddress = settings?.address || CAFE_INFO.address;
  const activeHours = settings?.hoursText || CAFE_INFO.hoursText;
  const activeKitchenHours = settings?.kitchenHours || CAFE_INFO.kitchenHours;
  const activeMapsUrl = settings?.googleMapsUrl || CAFE_INFO.googleMapsUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError('Please provide your name, phone number, and enquiry message.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          subject: subject.trim() || 'General Cafe Enquiry',
          message: message.trim()
        })
      });

      if (!res.ok) {
        throw new Error('Could not send message. Please call us directly.');
      }

      setSuccess(true);
      setName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="hours-contact" className="py-20 lg:py-28 bg-[#100804] border-b border-[#29190f] relative text-[#fcf9f5]">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14 text-left">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c9955e] mb-3 px-3 py-1 rounded bg-[#2b170c] border border-[#50301b]">
            <span>Find Us & Say Hello</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight text-[#fcf9f5] leading-tight mb-4">
            Hours, location & <span className="italic font-normal text-[#dfa467]">enquiries</span>.
          </h2>
          <p className="text-base text-[#bda38e] leading-relaxed font-body">
            Located on Ballarat’s historic central boulevard opposite scenic gardens. Walk in anytime for morning coffee, or drop our team a message below for table questions, catering, or private hire.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* Left Column: Opening Hours & Direct Contact Card */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Hours Box */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#160e08] border border-[#382215] shadow-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#28170e] border border-[#4d2e1b] flex items-center justify-center text-[#dfa467]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-[#f6eee5] font-semibold">Opening Hours</h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5 mt-0.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {settings?.openDaysText || 'Open 7 Days a Week'}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-sm border-t border-[#29190f] pt-4 mb-4">
                <div className="flex justify-between items-center text-[#d7c0ac]">
                  <span>Daily Cafe Hours:</span>
                  <span className="font-mono text-white font-medium">{activeHours}</span>
                </div>
                <div className="flex justify-between items-center text-[#d7c0ac]">
                  <span>Kitchen Service:</span>
                  <span className="font-mono text-white font-medium">{activeKitchenHours}</span>
                </div>
                <div className="flex justify-between items-center text-[#d7c0ac]">
                  <span>Coffee & Pastries:</span>
                  <span className="font-mono text-white font-medium">From 7:00 AM daily</span>
                </div>
                {settings?.offDaysWeekly && settings.offDaysWeekly.length > 0 && (
                  <div className="flex justify-between items-center text-amber-300/90 pt-1 border-t border-[#2d1b11]">
                    <span>Weekly Off-Days:</span>
                    <span className="font-medium">{settings.offDaysWeekly.join(', ')}</span>
                  </div>
                )}
              </div>

              {settings?.offDayNotice && (
                <div className="mb-4 p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span>{settings.offDayNotice}</span>
                </div>
              )}

              {settings?.specificClosedDates && settings.specificClosedDates.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-[#20130a] border border-[#3b2517] text-xs">
                  <span className="font-semibold text-[#e2ab71] block mb-1.5 uppercase tracking-wider text-[10px]">
                    Upcoming Special Closures:
                  </span>
                  <div className="space-y-1">
                    {settings.specificClosedDates.slice(0, 3).map((cd) => (
                      <div key={cd.date} className="flex justify-between items-center text-[#cfb7a4]">
                        <span className="font-mono">{cd.date}</span>
                        <span className="text-[#a48974]">{cd.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-[#a98f79] italic bg-[#21140c] p-3 rounded-xl border border-[#392315]">
                Note: Walk-ins are always welcomed for coffee and casual dining. Table reservations are recommended for weekend brunch and larger parties.
              </p>
            </div>

            {/* Address & Quick Actions Box */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#160e08] border border-[#382215] shadow-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#28170e] border border-[#4d2e1b] flex items-center justify-center text-[#dfa467]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-[#f6eee5] font-semibold">Address & Contact</h3>
                  <p className="text-xs text-[#9f8570]">Ballarat Central, Victoria</p>
                </div>
              </div>

              <p className="text-sm text-[#e8dbcf] mb-5 leading-relaxed font-body">
                {activeAddress}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#29190f]">
                <a
                  href={`tel:${activeCleanPhone}`}
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#ba7534] to-[#8d501e] hover:from-[#c88240] hover:to-[#9a5924] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-black/40"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {activePhone}</span>
                </a>

                <a
                  href={activeMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-xl bg-[#26170e] hover:bg-[#342014] border border-[#4d2f1b] text-[#eac39d] hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Compass className="w-4 h-4 text-[#e09c48]" />
                  <span>Google Maps Pin</span>
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Google Maps Embed + Enquiry Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Real Interactive Google Maps Card */}
            <div className="rounded-3xl bg-[#160e08] border border-[#382215] overflow-hidden shadow-xl">
              <div className="p-4 sm:p-5 border-b border-[#2d1b11] flex items-center justify-between">
                <div>
                  <h4 className="font-display text-lg text-white font-medium">L'espresso on Sturt Street</h4>
                  <p className="text-xs text-[#9f8570]">417 Sturt St, Ballarat Central VIC 3350</p>
                </div>
                <a
                  href={activeMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#27170e] hover:bg-[#362114] border border-[#4a2e1c] text-[#e5a85b] text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <span>Open in Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full bg-[#1b1009]">
                <iframe
                  title="L'espresso Ballarat Location"
                  src="https://maps.google.com/maps?q=417%20Sturt%20St%20Ballarat%20Central%20VIC%203350&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0 filter contrast-105"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Direct Message Form */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#160e08] border border-[#382215] shadow-xl">
              <h3 className="font-display text-2xl text-[#f6eee5] font-semibold mb-1">
                Send a Message to the Cafe Team
              </h3>
              <p className="text-xs text-[#9f8570] mb-6">
                Have a question about group reservations, dietary requirements, or private evening bookings?
              </p>

              {success && (
                <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Thank you! Your message has been sent to the L'espresso team. We will respond promptly.</span>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#d9c0a9] font-medium mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Margaret Evans"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#21140c] border border-[#3f2718] text-white focus:outline-none focus:border-[#c88238]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[#d9c0a9] font-medium mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+61 4..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#21140c] border border-[#3f2718] text-white focus:outline-none focus:border-[#c88238]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#d9c0a9] font-medium mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#21140c] border border-[#3f2718] text-white focus:outline-none focus:border-[#c88238]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#d9c0a9] font-medium mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Group booking, private hire, catering..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#21140c] border border-[#3f2718] text-white focus:outline-none focus:border-[#c88238]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#d9c0a9] font-medium mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your request or date..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#21140c] border border-[#3f2718] text-white focus:outline-none focus:border-[#c88238]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ba7534] to-[#8d501e] hover:from-[#c88240] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending Message...' : 'Send Message to Staff'}</span>
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
