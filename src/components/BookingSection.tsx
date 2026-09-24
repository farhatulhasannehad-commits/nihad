import React, { useState, useEffect } from 'react';
import {
  CalendarCheck, Clock, Users, Phone, User, MessageSquare,
  CheckCircle2, AlertCircle, RefreshCw, Sparkles, MapPin, ChevronRight, Share2, AlertTriangle, CalendarX
} from 'lucide-react';
import { AvailabilityResponse, Booking, TimeSlot, CafeSettings } from '../types';
import { CAFE_INFO } from '../data/cafeData';

interface BookingSectionProps {
  settings?: CafeSettings;
}

export const BookingSection: React.FC<BookingSectionProps> = ({ settings }) => {
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [date, setDate] = useState<string>(getTodayStr());
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [time, setTime] = useState<string>('09:30');
  const [guests, setGuests] = useState<number>(2);
  const [tablePreference, setTablePreference] = useState('Indoor Timber Booth');
  const [specialRequests, setSpecialRequests] = useState('');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Fetch real-time availability for the selected date
  const fetchAvailability = async (selectedDate: string) => {
    try {
      setLoadingAvailability(true);
      setAvailabilityError(null);
      const res = await fetch(`/api/availability?date=${selectedDate}`);
      if (!res.ok) throw new Error('Failed to retrieve slot availability');
      const data: AvailabilityResponse = await res.json();
      setAvailability(data);

      if (data.isClosed) {
        return;
      }

      // If the currently selected time slot is full, auto-select first available
      const currentSlot = data.slots.find(s => s.time === time);
      if (!currentSlot || currentSlot.status === 'full') {
        const firstAvailable = data.slots.find(s => s.status !== 'full');
        if (firstAvailable) {
          setTime(firstAvailable.time);
        }
      }
    } catch (err: any) {
      console.error('Availability fetch error:', err);
      setAvailabilityError('Could not sync live availability. Please try refreshing.');
    } finally {
      setLoadingAvailability(false);
    }
  };

  useEffect(() => {
    fetchAvailability(date);
  }, [date]);

  // Listen to SSE live booking events so slots update in real time
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/realtime/stream');
      
      const handleLiveUpdate = () => {
        fetchAvailability(date);
      };

      eventSource.addEventListener('booking_created', handleLiveUpdate);
      eventSource.addEventListener('booking_updated', handleLiveUpdate);
      eventSource.addEventListener('booking_deleted', handleLiveUpdate);
      eventSource.addEventListener('settings_updated', handleLiveUpdate);
    } catch (err) {
      console.warn('SSE booking listener error:', err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (availability?.isClosed) {
      setSubmitError(`L'espresso is closed on ${date} (${availability.closureReason}). Bookings cannot be placed.`);
      return;
    }

    if (!name.trim() || !phone.trim() || !date || !time) {
      setSubmitError('Please complete all required fields (Name, Phone, Date, Time).');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          date,
          time,
          guests: Number(guests),
          tablePreference,
          specialRequests: specialRequests.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete booking.');
      }

      setConfirmedBooking(data.booking);
      fetchAvailability(date);
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setSubmitError(err.message || 'An error occurred while booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setConfirmedBooking(null);
    setName('');
    setPhone('');
    setEmail('');
    setSpecialRequests('');
    fetchAvailability(date);
  };

  const isCurrentDateClosed = availability?.isClosed;

  return (
    <section id="booking" className="py-20 lg:py-28 bg-[#100905] border-b border-[#29190f] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/3 right-0 w-96 h-96 bg-[#945d29]/10 rounded-full blur-3xl pointer-events-none"
      />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 text-left">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c9955e] mb-3 px-3 py-1 rounded bg-[#2b170c] border border-[#50301b]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Table Availability & Instant Booking</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight text-[#fcf9f5] leading-tight mb-4">
            Reserve your table at <span className="italic font-normal text-[#dfa467]">L'espresso</span>.
          </h2>
          <p className="text-base text-[#bda38e] leading-relaxed font-body">
            View real-time table availability for any day. Every booking is confirmed immediately 
            and registered directly in our floor reservation system. No waiting for callbacks.
          </p>

          {/* Off-Day Public Notice Banner if set by Admin */}
          {settings?.offDayNotice && (
            <div className="mt-4 p-3.5 rounded-xl bg-[#26160c] border border-[#5a361d] text-[#e8bc92] text-xs flex items-center gap-2.5 shadow-md">
              <AlertTriangle className="w-4 h-4 text-[#e5a85b] shrink-0" />
              <span>{settings.offDayNotice}</span>
            </div>
          )}
        </div>

        {confirmedBooking ? (
          /* Confirmation State View */
          <div className="max-w-2xl mx-auto rounded-3xl bg-gradient-to-b from-[#22160e] to-[#170e08] border border-[#4d3221] p-8 sm:p-10 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="inline-block text-xs font-mono font-semibold tracking-widest text-[#dfa467] uppercase bg-[#2e1d12] px-3 py-1 rounded-md mb-2 border border-[#482d1c]">
              Reservation Ref: {confirmedBooking.id}
            </div>

            <h3 className="font-display text-3xl sm:text-4xl text-[#fbf7f2] font-semibold mb-3">
              Table Confirmed! We look forward to welcoming you.
            </h3>

            <p className="text-sm text-[#bca28c] leading-relaxed mb-8">
              A table has been allocated for you at L'espresso Ballarat. Please arrive within 10 minutes of your booked time.
            </p>

            <div className="p-5 rounded-2xl bg-[#1a100a] border border-[#3b2517] space-y-3.5 mb-8">
              <div className="flex justify-between items-center text-sm border-b border-[#2d1b11] pb-2.5">
                <span className="text-[#997f69]">Guest Name:</span>
                <span className="font-medium text-[#f6eee5]">{confirmedBooking.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-[#2d1b11] pb-2.5">
                <span className="text-[#997f69]">Date & Time:</span>
                <span className="font-medium text-[#e5af75]">
                  {confirmedBooking.date} at {confirmedBooking.time}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-[#2d1b11] pb-2.5">
                <span className="text-[#997f69]">Party Size:</span>
                <span className="font-medium text-[#f6eee5]">{confirmedBooking.guests} Guests</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-[#2d1b11] pb-2.5">
                <span className="text-[#997f69]">Table Preference:</span>
                <span className="font-medium text-[#f6eee5]">{confirmedBooking.tablePreference}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#997f69]">Contact Phone:</span>
                <span className="font-mono text-sm text-[#f6eee5]">{confirmedBooking.phone}</span>
              </div>
              {confirmedBooking.specialRequests && (
                <div className="pt-2 border-t border-[#2d1b11] text-xs text-[#a98f78]">
                  <strong className="text-[#e2ab71]">Notes:</strong> {confirmedBooking.specialRequests}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={CAFE_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-[#2e1d12] hover:bg-[#3c2517] text-[#ebd2bc] text-sm font-medium border border-[#4d3221] transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-[#dfa467]" />
                <span>Directions to 417 Sturt St</span>
              </a>

              <a
                href={`tel:${CAFE_INFO.cleanPhone}`}
                className="px-5 py-3 rounded-xl bg-[#2e1d12] hover:bg-[#3c2517] text-[#ebd2bc] text-sm font-medium border border-[#4d3221] transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-[#dfa467]" />
                <span>Call Cafe (03) 5333 1789</span>
              </a>

              <button
                onClick={handleReset}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#b57437] to-[#864c1b] hover:from-[#c88240] hover:to-[#96551f] text-white text-sm font-medium transition-all ml-auto cursor-pointer"
              >
                Make Another Booking
              </button>
            </div>
          </div>
        ) : (
          /* Live Booking Form & Slot Availability */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            
            {/* Left: Date Selection & Slot Availability Visualizer */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#160e08] border border-[#3b2517] flex flex-col justify-between shadow-xl">
              <div>
                
                {/* Step 1 Title */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display text-2xl text-[#fbf7f2] font-semibold">
                      1. Choose Date & Time
                    </h3>
                    <p className="text-xs text-[#a98f78] mt-0.5">
                      Live table occupancy for L'espresso Ballarat
                    </p>
                  </div>

                  <button
                    onClick={() => fetchAvailability(date)}
                    className="p-2 rounded-xl bg-[#22150e] hover:bg-[#2e1c12] text-[#d4a06d] border border-[#442816] transition-colors"
                    title="Refresh live availability"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingAvailability ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Quick Date Shortcuts */}
                <div className="grid grid-cols-3 gap-2.5 mb-6">
                  <button
                    type="button"
                    onClick={() => setDate(getTodayStr())}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      date === getTodayStr()
                        ? 'bg-[#b67437] text-white border-[#dfa467]'
                        : 'bg-[#1e130b] text-[#bca38d] border-[#382215] hover:border-[#52331f]'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setDate(getTomorrowStr())}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      date === getTomorrowStr()
                        ? 'bg-[#b67437] text-white border-[#dfa467]'
                        : 'bg-[#1e130b] text-[#bca38d] border-[#382215] hover:border-[#52331f]'
                    }`}
                  >
                    Tomorrow
                  </button>
                  <div>
                    <input
                      type="date"
                      value={date}
                      min={getTodayStr()}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#20140c] border border-[#3d2617] rounded-xl px-3 py-2 text-xs text-[#f5eee6] focus:outline-none focus:border-[#d4944b]"
                    />
                  </div>
                </div>

                {/* Check if Selected Date is an Off-Day / Closed */}
                {isCurrentDateClosed ? (
                  <div className="p-6 rounded-2xl bg-[#231309] border border-[#8a4b22] text-center my-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#381a0b] border border-[#6b3515] flex items-center justify-center text-[#e89b4f] mx-auto">
                      <CalendarX className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-display text-xl text-white font-medium">
                        Cafe Closed on {date}
                      </h4>
                      <p className="text-xs text-[#e5af75] mt-1 font-medium">
                        Reason: {availability?.closureReason || 'Scheduled Holiday / Off-Day'}
                      </p>
                      <p className="text-xs text-[#a98e77] mt-2 leading-relaxed">
                        L'espresso is not taking table reservations on this date. Please select another date using the shortcuts or date picker above.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Slot Availability Grid */
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-xs text-[#9f8570] mb-3">
                      <span>Operating Hours (7:00 AM – 3:00 PM)</span>
                      <span className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Free
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500" /> Limited
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-zinc-600" /> Full
                        </span>
                      </span>
                    </div>

                    {loadingAvailability ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-6">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="h-16 rounded-xl bg-[#20140c] animate-pulse border border-[#331f13]" />
                        ))}
                      </div>
                    ) : availabilityError ? (
                      <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{availabilityError}</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                        {availability?.slots.map((slot: TimeSlot) => {
                          const isSelected = time === slot.time;
                          const isFull = slot.status === 'full';

                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={isFull}
                              onClick={() => setTime(slot.time)}
                              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                                isFull
                                  ? 'bg-[#18110b] border-[#291b12] opacity-40 cursor-not-allowed text-[#7a6452]'
                                  : isSelected
                                  ? 'bg-gradient-to-br from-[#b37337] to-[#864c1b] border-[#dfa467] text-white shadow-md'
                                  : 'bg-[#1d120a] border-[#362114] hover:border-[#633e24] text-[#e0cbba] cursor-pointer'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-mono text-xs font-semibold">
                                  {slot.displayTime}
                                </span>
                                {slot.status === 'available' && !isSelected && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                )}
                                {slot.status === 'limited' && !isSelected && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                )}
                              </div>

                              <div className="text-[10px] leading-tight">
                                {isFull ? (
                                  <span className="text-[#a45e45]">Fully Booked</span>
                                ) : isSelected ? (
                                  <span className="text-amber-100 font-medium">Selected Slot</span>
                                ) : slot.status === 'limited' ? (
                                  <span className="text-amber-400 font-medium">Only {slot.remainingTables} left</span>
                                ) : (
                                  <span className="text-[#967d68]">{slot.remainingTables} tables free</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Real-time Indicator Bottom Bar */}
              <div className="pt-4 border-t border-[#29190f] flex items-center justify-between text-xs text-[#8f745e]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Real-time database sync active
                </span>
                <span>Active covers today: {availability?.totalBookingsOnDate || 0}</span>
              </div>
            </div>

            {/* Right: Guest Details & Reservation Form */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#160e08] border border-[#3b2517]">
              <div className="mb-6">
                <h3 className="font-display text-2xl text-[#fbf7f2] font-semibold">
                  2. Guest Details
                </h3>
                <p className="text-xs text-[#a98f78] mt-0.5">
                  Instant confirmation saved with real timestamp
                </p>
              </div>

              {submitError && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-[#c4ab94] mb-1.5">
                    Full Name <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b6e55]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cameron Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isCurrentDateClosed}
                      className="w-full bg-[#20140c] border border-[#3d2617] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#f6eee5] placeholder-[#6e5440] focus:outline-none focus:border-[#d4944b] disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#c4ab94] mb-1.5">
                      Phone Number <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b6e55]" />
                      <input
                        type="tel"
                        required
                        placeholder="+61 4XX XXX XXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isCurrentDateClosed}
                        className="w-full bg-[#20140c] border border-[#3d2617] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#f6eee5] placeholder-[#6e5440] focus:outline-none focus:border-[#d4944b] disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#c4ab94] mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="cameron@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isCurrentDateClosed}
                      className="w-full bg-[#20140c] border border-[#3d2617] rounded-xl px-4 py-2.5 text-sm text-[#f6eee5] placeholder-[#6e5440] focus:outline-none focus:border-[#d4944b] disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Guests & Table Preference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#c4ab94] mb-1.5">
                      Number of Guests <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b6e55]" />
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        disabled={isCurrentDateClosed}
                        className="w-full bg-[#20140c] border border-[#3d2617] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#f6eee5] focus:outline-none focus:border-[#d4944b] appearance-none cursor-pointer disabled:opacity-50"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? 'Guest' : 'Guests'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#c4ab94] mb-1.5">
                      Table Preference
                    </label>
                    <select
                      value={tablePreference}
                      onChange={(e) => setTablePreference(e.target.value)}
                      disabled={isCurrentDateClosed}
                      className="w-full bg-[#20140c] border border-[#3d2617] rounded-xl px-4 py-2.5 text-sm text-[#f6eee5] focus:outline-none focus:border-[#d4944b] appearance-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="Indoor Timber Booth">Indoor Timber Booth</option>
                      <option value="Sturt St Window Table">Sturt St Window Table</option>
                      <option value="Wine-Bar High Table">Wine-Bar High Table</option>
                      <option value="Covered Streetfront Dining">Covered Streetfront Dining</option>
                    </select>
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-xs font-medium text-[#c4ab94] mb-1.5">
                    Special Requests & Dietary Requirements
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g., High chair needed, celebrating anniversary, quiet corner booth, vegan..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    disabled={isCurrentDateClosed}
                    className="w-full bg-[#20140c] border border-[#3d2617] rounded-xl px-4 py-2.5 text-sm text-[#f6eee5] placeholder-[#6e5440] focus:outline-none focus:border-[#d4944b] disabled:opacity-50"
                  />
                </div>

                {/* Selected Slot Summary */}
                <div className="p-3.5 rounded-xl bg-[#20140c] border border-[#3b2517] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#d4ab87]">
                    <Clock className="w-4 h-4 text-[#e09c48]" />
                    <span>
                      Selected: <strong>{date}</strong> at <strong>{time}</strong> ({guests} {guests === 1 ? 'Guest' : 'Guests'})
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#a48870] uppercase">Instant Save</span>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={submitting || isCurrentDateClosed}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ba7534] via-[#a66526] to-[#7f4618] hover:from-[#cb823b] hover:to-[#92511d] text-white font-semibold text-sm transition-all shadow-xl shadow-black/50 flex items-center justify-center gap-2 border border-[#e5a85b]/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>
                    {submitting 
                      ? 'Confirming with Database...' 
                      : isCurrentDateClosed 
                      ? 'Cafe Closed on this Date' 
                      : 'Confirm Table Reservation'}
                  </span>
                </button>

              </form>

            </div>

          </div>
        )}

      </div>
    </section>
  );
};
