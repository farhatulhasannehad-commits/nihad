import React, { useState, useEffect } from 'react';
import {
  Shield, Lock, LogOut, CheckCircle, XCircle, Clock,
  Calendar, Phone, Users, Search, RefreshCw, MessageSquare,
  AlertCircle, ChevronDown, Check, Trash2, ArrowLeft, Download,
  Volume2, VolumeX, Sparkles, Coffee, Eye, EyeOff, Plus, Edit2, Save,
  X, MapPin, DollarSign, Image as ImageIcon, Utensils, Sliders,
  HelpCircle, ExternalLink, KeyRound, Mail, CalendarX, AlertTriangle,
  UserCheck, ShieldCheck, Copy
} from 'lucide-react';
import { Booking, Enquiry, AdminUser, MenuItem, CafeSettings, ClosedDate } from '../types';
import { CAFE_INFO } from '../data/cafeData';

interface AdminPanelProps {
  onClose: () => void;
  isLoggedIn: boolean;
  onLoginSuccess: (user: AdminUser) => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onClose,
  isLoggedIn,
  onLoginSuccess,
  onLogout
}) => {
  // Login form state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Google Login state
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [showManualGoogleModal, setShowManualGoogleModal] = useState(false);

  // Password Recovery state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Password Change inside Admin Panel
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [passChangeLoading, setPassChangeLoading] = useState(false);
  const [passChangeMsg, setPassChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Recovery Key reveal
  const [showRecoveryKey, setShowRecoveryKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Admin Data state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<CafeSettings | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Filters & Tabs
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'bookings' | 'menu' | 'settings' | 'security' | 'enquiries'>('bookings');
  
  // Real-time notification highlight
  const [newBookingAlert, setNewBookingAlert] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Booking Edit Modal state
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [newBookingForm, setNewBookingForm] = useState({
    name: '',
    phone: '',
    email: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    guests: 2,
    tablePreference: 'Indoor Timber Booth',
    specialRequests: '',
    status: 'confirmed' as const,
    adminNotes: ''
  });

  // Menu Item Modal state
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [isNewMenuModalOpen, setIsNewMenuModalOpen] = useState(false);
  const [menuForm, setMenuForm] = useState<Partial<MenuItem>>({
    name: '',
    category: 'brunch',
    price: 20,
    description: '',
    dietary: [],
    popular: false,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    hidden: false
  });
  const [menuFilterCategory, setMenuFilterCategory] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  // Deletion & Notice Modals state (replaces broken window.confirm)
  const [menuItemToDelete, setMenuItemToDelete] = useState<MenuItem | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [adminNotice, setAdminNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setAdminNotice({ type, message });
    setTimeout(() => {
      setAdminNotice(null);
    }, 4500);
  };

  // Settings Form state
  const [settingsForm, setSettingsForm] = useState<CafeSettings | null>(null);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  // New Closed Date input state
  const [newClosedDate, setNewClosedDate] = useState('');
  const [newClosedReason, setNewClosedReason] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch all admin data (includes hidden dishes so admin can manage them)
  const loadAdminData = async () => {
    try {
      setLoadingData(true);
      const [resBookings, resEnquiries, resMenu, resSettings] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/enquiries'),
        fetch('/api/menu?includeHidden=true'),
        fetch('/api/admin/settings')
      ]);

      if (resBookings.ok) {
        const data = await resBookings.json();
        setBookings(data.bookings || []);
      }

      if (resEnquiries.ok) {
        const data = await resEnquiries.json();
        setEnquiries(data.enquiries || []);
      }

      if (resMenu.ok) {
        const data = await resMenu.json();
        setMenuItems(data.menu || []);
      }

      if (resSettings.ok) {
        const data = await resSettings.json();
        setSettings(data.settings);
        setSettingsForm(data.settings);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadAdminData();
    }
  }, [isLoggedIn]);

  // Connect to SSE for real-time live booking & menu updates
  useEffect(() => {
    if (!isLoggedIn) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/realtime/stream');

      eventSource.addEventListener('booking_created', (e: MessageEvent) => {
        const newBooking: Booking = JSON.parse(e.data);
        setBookings(prev => [newBooking, ...prev.filter(b => b.id !== newBooking.id)]);
        setNewBookingAlert(`New Table Reservation! ${newBooking.name} (${newBooking.guests} guests) for ${newBooking.time}`);
        
        if (soundEnabled) {
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
          } catch {
            // Audio policy fallback
          }
        }
      });

      eventSource.addEventListener('booking_updated', (e: MessageEvent) => {
        const updated: Booking = JSON.parse(e.data);
        setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
      });

      eventSource.addEventListener('booking_deleted', (e: MessageEvent) => {
        const { id } = JSON.parse(e.data);
        setBookings(prev => prev.filter(b => b.id !== id));
      });

      eventSource.addEventListener('enquiry_created', (e: MessageEvent) => {
        const newEnq: Enquiry = JSON.parse(e.data);
        setEnquiries(prev => [newEnq, ...prev.filter(x => x.id !== newEnq.id)]);
      });

      eventSource.addEventListener('menu_updated', () => {
        fetch('/api/menu?includeHidden=true')
          .then(r => r.json())
          .then(data => {
            if (data.menu) setMenuItems(data.menu);
          })
          .catch(console.error);
      });

      eventSource.addEventListener('settings_updated', (e: MessageEvent) => {
        const updated: CafeSettings = JSON.parse(e.data);
        setSettings(updated);
        setSettingsForm(updated);
      });

    } catch (err) {
      console.warn('Admin SSE connection error:', err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [isLoggedIn, soundEnabled]);

  // Standard Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Google Account Login
  const handleGoogleLogin = async (emailToVerify?: string) => {
    setGoogleLoading(true);
    setLoginError(null);

    const email = emailToVerify || googleEmailInput || 'farhatulhasannehad@gmail.com';

    try {
      const res = await fetch('/api/admin/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: "Cafe Owner (" + email.split('@')[0] + ")",
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Google authentication denied.');
      }

      setShowManualGoogleModal(false);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setLoginError(err.message || 'Google authentication failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Emergency Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);
    setResetSuccess(null);

    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match.');
      setResetLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail.trim(),
          recoveryCode: resetCode.trim(),
          newPassword: resetNewPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Could not reset password.');
      }

      setResetSuccess('Password reset successfully! You can now sign in with your new password.');
      setTimeout(() => {
        setShowForgotModal(false);
        setPassword(resetNewPassword);
      }, 2000);
    } catch (err: any) {
      setResetError(err.message || 'Password reset failed.');
    } finally {
      setResetLoading(false);
    }
  };

  // Change Password inside Admin Panel
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeLoading(true);
    setPassChangeMsg(null);

    if (newPass !== confirmNewPass) {
      setPassChangeMsg({ type: 'error', text: 'New passwords do not match.' });
      setPassChangeLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword: newPass
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setPassChangeMsg({ type: 'success', text: 'Password successfully updated and securely hashed!' });
      setCurrentPass('');
      setNewPass('');
      setConfirmNewPass('');
    } catch (err: any) {
      setPassChangeMsg({ type: 'error', text: err.message || 'Could not update password.' });
    } finally {
      setPassChangeLoading(false);
    }
  };

  // Quick Status change for a booking
  const handleStatusChange = async (id: string, newStatus: Booking['status']) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const data = await res.json();
        setBookings(prev => prev.map(b => b.id === id ? data.booking : b));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Save edited booking
  const handleSaveBookingEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    try {
      const res = await fetch(`/api/admin/bookings/${editingBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBooking)
      });

      if (res.ok) {
        const data = await res.json();
        setBookings(prev => prev.map(b => b.id === editingBooking.id ? data.booking : b));
        setEditingBooking(null);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to update booking.');
      }
    } catch (err) {
      console.error('Failed to save booking edit:', err);
    }
  };

  // Create Walk-in / Phone booking from admin
  const handleCreateNewBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBookingForm)
      });

      if (res.ok) {
        const data = await res.json();
        setBookings(prev => [data.booking, ...prev]);
        setIsNewBookingModalOpen(false);
        setNewBookingForm({
          name: '',
          phone: '',
          email: '',
          date: todayStr,
          time: '09:00',
          guests: 2,
          tablePreference: 'Indoor Timber Booth',
          specialRequests: '',
          status: 'confirmed',
          adminNotes: ''
        });
      } else {
        const errData = await res.json();
        showNotice(errData.error || 'Failed to create booking.', 'error');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      showNotice('Network error creating booking.', 'error');
    }
  };

  // Safe In-App Delete Booking Handler (Replaces broken window.confirm)
  const handleConfirmDeleteBooking = async () => {
    if (!bookingToDelete) return;
    const id = bookingToDelete.id;
    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBookings(prev => prev.filter(b => b.id !== id));
        showNotice(`Booking #${id} was deleted successfully.`);
        setBookingToDelete(null);
      } else {
        const errData = await res.json();
        showNotice(errData.error || 'Failed to delete booking.', 'error');
      }
    } catch (err) {
      console.error('Error deleting booking:', err);
      showNotice('Network error deleting reservation.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Save / Create Menu Item
  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingMenuItem;
    const url = isEdit ? `/api/admin/menu/${editingMenuItem.id}` : '/api/admin/menu';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuForm)
      });

      if (res.ok) {
        const data = await res.json();
        if (isEdit) {
          setMenuItems(prev => prev.map(m => m.id === editingMenuItem.id ? data.item : m));
          showNotice(`"${data.item.name}" updated successfully.`);
        } else {
          setMenuItems(prev => [data.item, ...prev]);
          showNotice(`"${data.item.name}" added to the menu!`);
        }
        setEditingMenuItem(null);
        setIsNewMenuModalOpen(false);
      } else {
        const errData = await res.json();
        showNotice(errData.error || 'Failed to save menu item.', 'error');
      }
    } catch (err) {
      console.error('Error saving menu item:', err);
      showNotice('Network error saving menu item.', 'error');
    }
  };

  // Toggle Menu Item Visibility (Instant Hide / Show)
  const handleToggleMenuVisibility = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/admin/menu/${item.id}/toggle-visibility`, {
        method: 'PATCH'
      });
      if (res.ok) {
        const data = await res.json();
        setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, hidden: data.hidden } : m));
        showNotice(data.hidden ? `"${item.name}" is now hidden from the website.` : `"${item.name}" is now visible on the website.`);
      } else {
        const errData = await res.json();
        showNotice(errData.error || 'Could not change item visibility.', 'error');
      }
    } catch (err) {
      console.error('Error toggling menu visibility:', err);
      showNotice('Network error changing visibility.', 'error');
    }
  };

  // Safe In-App Delete Menu Item Handler (Replaces broken window.confirm)
  const handleConfirmDeleteMenuItem = async () => {
    if (!menuItemToDelete) return;
    const id = menuItemToDelete.id;
    const name = menuItemToDelete.name;

    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/admin/menu/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMenuItems(prev => prev.filter(m => m.id !== id));
        showNotice(`"${name}" was permanently deleted from the menu.`);
        setMenuItemToDelete(null);
      } else {
        const errData = await res.json();
        showNotice(errData.error || 'Failed to delete menu item.', 'error');
      }
    } catch (err) {
      console.error('Error deleting menu item:', err);
      showNotice('Network error deleting menu item.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setSettingsSavedSuccess(true);
        setTimeout(() => setSettingsSavedSuccess(false), 3000);
      } else {
        alert('Failed to update cafe settings.');
      }
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };

  // Add a specific closed date
  const handleAddClosedDate = () => {
    if (!newClosedDate || !newClosedReason.trim()) {
      alert('Please specify both a date and a reason for the closure.');
      return;
    }

    if (!settingsForm) return;

    const currentDates = settingsForm.specificClosedDates || [];
    if (currentDates.some(d => d.date === newClosedDate)) {
      alert('This date is already added to the closed list.');
      return;
    }

    const updatedDates = [...currentDates, { date: newClosedDate, reason: newClosedReason.trim() }];
    setSettingsForm({
      ...settingsForm,
      specificClosedDates: updatedDates
    });

    setNewClosedDate('');
    setNewClosedReason('');
  };

  // Remove a closed date
  const handleRemoveClosedDate = (dateToRemove: string) => {
    if (!settingsForm) return;
    const updatedDates = (settingsForm.specificClosedDates || []).filter(d => d.date !== dateToRemove);
    setSettingsForm({
      ...settingsForm,
      specificClosedDates: updatedDates
    });
  };

  // Toggle weekly off day
  const handleToggleWeeklyDay = (day: string) => {
    if (!settingsForm) return;
    const current = settingsForm.offDaysWeekly || [];
    const exists = current.includes(day);
    const updated = exists ? current.filter(d => d !== day) : [...current, day];
    setSettingsForm({
      ...settingsForm,
      offDaysWeekly: updated
    });
  };

  // Filtered Bookings calculation
  const filteredBookings = bookings.filter(b => {
    if (selectedDateFilter === 'today' && b.date !== todayStr) return false;
    if (selectedDateFilter === 'future' && b.date < todayStr) return false;
    if (selectedStatusFilter !== 'all' && b.status !== selectedStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return b.name.toLowerCase().includes(q) || b.phone.toLowerCase().includes(q) || b.id.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered Menu Items
  const filteredMenuItems = menuItems.filter(m => {
    if (menuFilterCategory !== 'all' && m.category !== menuFilterCategory) return false;
    if (visibilityFilter === 'visible' && m.hidden) return false;
    if (visibilityFilter === 'hidden' && !m.hidden) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    }
    return true;
  });

  // -------------------------------------------------------------
  // RENDER LOGIN SCREEN (SECURED & NO EXPOSED PASSWORDS)
  // -------------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl bg-[#1b1009] border border-[#482c1b] p-7 sm:p-8 text-left shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#362114]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#3b2011] to-[#201007] border border-[#5d371d] text-[#e0a96d] shadow-md">
                <ShieldCheck className="w-6 h-6 text-[#e5a85b]" />
              </div>
              <div>
                <h3 className="font-display text-xl text-white font-semibold">L'espresso Admin Portal</h3>
                <p className="text-xs text-[#a98f78]">Verified Ballarat Cafe Management</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#9f8570] hover:text-white hover:bg-[#27170e] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Top Security Banner: Google Account Instant Login */}
          <div className="mb-6 space-y-3">
            <button
              onClick={() => handleGoogleLogin('farhatulhasannehad@gmail.com')}
              disabled={googleLoading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-3 cursor-pointer border border-neutral-300 active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{googleLoading ? 'Verifying Google Account...' : 'Sign In with Owner Google Account'}</span>
            </button>

            <div className="flex items-center justify-between text-[11px] text-[#9a7e67] px-1">
              <span>Authorized: farhatulhasannehad@gmail.com</span>
              <button
                type="button"
                onClick={() => setShowManualGoogleModal(true)}
                className="text-[#e2ab71] hover:underline cursor-pointer"
              >
                Change Gmail
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-[#352115]"></div>
            <span className="flex-shrink mx-3 text-xs text-[#7e624c] uppercase tracking-wider font-semibold">Or Password Sign-in</span>
            <div className="flex-grow border-t border-[#352115]"></div>
          </div>

          {/* Standard Form */}
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#d9c0a9] mb-1.5">
                Admin Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#25160d] border border-[#482c19] text-white text-sm focus:outline-none focus:border-[#c88d53]"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#d9c0a9]">
                  Admin Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-[#e5a85b] hover:text-[#ffd39c] cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your admin password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#25160d] border border-[#482c19] text-white text-sm focus:outline-none focus:border-[#c88d53] pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a7d66] hover:text-[#e5a85b]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#b37438] to-[#864c1b] hover:from-[#c58242] hover:to-[#96551f] text-white font-medium text-sm transition-all shadow-md shadow-black/50 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In Securely'}
            </button>
          </form>

          {/* Security Notice: Big Company Grade Security */}
          <div className="mt-6 pt-4 border-t border-[#311c11] flex items-center justify-between text-[11px] text-[#8e735e]">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Brute-force lockout active</span>
            </span>
            <span>Encrypted Session</span>
          </div>

        </div>

        {/* Modal: Custom Google Email Input */}
        {showManualGoogleModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#1e120a] border border-[#53331d] rounded-2xl p-6 text-left shadow-2xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#362114]">
                <h4 className="font-display text-lg text-white font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#e5a85b]" />
                  <span>Verify Owner Google Account</span>
                </h4>
                <button
                  onClick={() => setShowManualGoogleModal(false)}
                  className="text-[#967c66] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#bda38d] mb-4">
                Please enter the registered cafe owner's Gmail address to verify ownership:
              </p>

              <input
                type="email"
                value={googleEmailInput}
                onChange={(e) => setGoogleEmailInput(e.target.value)}
                placeholder="farhatulhasannehad@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#28180e] border border-[#482c19] text-white text-sm focus:outline-none focus:border-[#d4944b] mb-4"
              />

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowManualGoogleModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#2b180d] text-[#c9ae96] text-xs hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleGoogleLogin(googleEmailInput)}
                  disabled={!googleEmailInput.trim() || googleLoading}
                  className="px-4 py-2 rounded-xl bg-[#ba7534] hover:bg-[#cb823b] text-white text-xs font-semibold disabled:opacity-50"
                >
                  {googleLoading ? 'Verifying...' : 'Authorize Login'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Forgot / Emergency Password Reset */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#1e120a] border border-[#53331d] rounded-2xl p-6 text-left shadow-2xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#362114]">
                <h4 className="font-display text-lg text-white font-semibold flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#e5a85b]" />
                  <span>Admin Password Recovery</span>
                </h4>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="text-[#967c66] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#bda38d] mb-4">
                Forgot your admin password? Enter your registered cafe owner email and your Emergency Recovery Key to securely set a new password.
              </p>

              {resetError && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#d9c0a9] mb-1">
                    Registered Owner Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="farhatulhasannehad@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-[#28180e] border border-[#482c19] text-white text-xs focus:outline-none focus:border-[#d4944b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#d9c0a9] mb-1">
                    Emergency Recovery Key *
                  </label>
                  <input
                    type="text"
                    required
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="LES-RECOVER-8492"
                    className="w-full px-3 py-2 rounded-xl bg-[#28180e] border border-[#482c19] text-white text-xs focus:outline-none focus:border-[#d4944b] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#d9c0a9] mb-1">
                    New Admin Password * (min 6 characters)
                  </label>
                  <input
                    type="password"
                    required
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-[#28180e] border border-[#482c19] text-white text-xs focus:outline-none focus:border-[#d4944b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#d9c0a9] mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-[#28180e] border border-[#482c19] text-white text-xs focus:outline-none focus:border-[#d4944b]"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#2b180d] text-[#c9ae96] text-xs hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-5 py-2 rounded-xl bg-[#ba7534] hover:bg-[#cb823b] text-white text-xs font-semibold disabled:opacity-50"
                  >
                    {resetLoading ? 'Resetting...' : 'Save New Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED ADMIN PANEL DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 bg-[#120a06] flex flex-col text-[#f7f3ee] overflow-hidden">
      
      {/* Top Admin Bar */}
      <header className="px-4 sm:px-6 py-3.5 bg-[#1b1009] border-b border-[#352115] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#2b170e] border border-[#4d2c18] text-[#dfa467]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg sm:text-xl text-white font-semibold">L'espresso Control Hub</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-[#a98f78]">
              {settings?.adminEmail || 'Owner Portal'} • 417 Sturt St Ballarat
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? 'bg-[#29170e] text-[#dfa467] border-[#4f2f1a]'
                : 'bg-[#1b1009] text-[#7d6754] border-[#311c11]'
            }`}
            title={soundEnabled ? 'Alert sounds active' : 'Alert sounds muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={loadAdminData}
            disabled={loadingData}
            className="p-2 rounded-xl bg-[#25160d] hover:bg-[#341e12] border border-[#442817] text-[#d6b79c] hover:text-white transition-colors cursor-pointer"
            title="Refresh All Database Data"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-2 rounded-xl bg-[#28150d] hover:bg-[#381c11] border border-[#492716] text-[#dfa467] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#2a170e] hover:bg-[#3c2114] border border-[#4a2b19] text-[#d6b79c] hover:text-white transition-colors ml-1"
            title="Exit Admin Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Primary Dashboard Navigation Tabs */}
      <div className="px-4 sm:px-6 bg-[#160d07] border-b border-[#2e1b10] flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'bg-[#ba7534] text-white shadow-md border border-[#e5a85b]/40'
              : 'text-[#bba18c] hover:text-white hover:bg-[#25160d]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Bookings ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'menu'
              ? 'bg-[#ba7534] text-white shadow-md border border-[#e5a85b]/40'
              : 'text-[#bba18c] hover:text-white hover:bg-[#25160d]'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Menu & Pricing ({menuItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-[#ba7534] text-white shadow-md border border-[#e5a85b]/40'
              : 'text-[#bba18c] hover:text-white hover:bg-[#25160d]'
          }`}
        >
          <CalendarX className="w-4 h-4" />
          <span>Date, Time & Off-Days</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-[#ba7534] text-white shadow-md border border-[#e5a85b]/40'
              : 'text-[#bba18c] hover:text-white hover:bg-[#25160d]'
          }`}
        >
          <Lock className="w-4 h-4 text-amber-300" />
          <span>Security & Owner Access</span>
        </button>

        <button
          onClick={() => setActiveTab('enquiries')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'enquiries'
              ? 'bg-[#ba7534] text-white shadow-md border border-[#e5a85b]/40'
              : 'text-[#bba18c] hover:text-white hover:bg-[#25160d]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Enquiries ({enquiries.length})</span>
        </button>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-left">
        
        {/* Real-time Alert Toast */}
        {newBookingAlert && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950 to-[#2e180d] border border-amber-600 text-amber-100 flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-black">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-white block font-medium">New Reservation Received!</strong>
                <span className="text-xs text-amber-200">{newBookingAlert}</span>
              </div>
            </div>
            <button
              onClick={() => setNewBookingAlert(null)}
              className="p-1 rounded-lg hover:bg-black/30 text-amber-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Global Admin Action Notice (Replaces broken browser alerts) */}
        {adminNotice && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2 shadow-lg ${
            adminNotice.type === 'error'
              ? 'bg-red-950/90 border border-red-800 text-red-200'
              : 'bg-emerald-950/90 border border-emerald-800 text-emerald-200'
          }`}>
            <div className="flex items-center gap-2.5">
              {adminNotice.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <span className="font-medium">{adminNotice.message}</span>
            </div>
            <button
              onClick={() => setAdminNotice(null)}
              className="p-1 rounded-lg hover:bg-black/20 text-current"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: BOOKINGS MANAGEMENT */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'bookings' && (
          <div>
            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8c6f56]" />
                  <input
                    type="text"
                    placeholder="Search guest, phone, or ref..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-xl bg-[#1b1009] border border-[#382215] text-white text-xs w-56 sm:w-64 focus:outline-none focus:border-[#d4944b]"
                  />
                </div>

                <select
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#1b1009] border border-[#382215] text-xs text-[#d7beaa] focus:outline-none"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today Only ({todayStr})</option>
                  <option value="future">Upcoming Dates</option>
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#1b1009] border border-[#382215] text-xs text-[#d7beaa] focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="seated">Seated</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button
                onClick={() => setIsNewBookingModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ba7534] to-[#8d501e] hover:from-[#c88240] text-white text-xs font-semibold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Phone / Walk-in Booking</span>
              </button>
            </div>

            {/* Bookings List Cards */}
            {filteredBookings.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#170e08] border border-[#331e12]">
                <Calendar className="w-12 h-12 text-[#684c36] mx-auto mb-3" />
                <h4 className="font-display text-lg text-white font-medium">No bookings found</h4>
                <p className="text-xs text-[#9f8570] mt-1">Try adjusting your date or status filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl bg-[#180f09] border border-[#352014] hover:border-[#5a3620] transition-all flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-[#dfa467]">
                          {b.id}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          b.status === 'confirmed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          b.status === 'seated' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                          b.status === 'cancelled' ? 'bg-red-950 text-red-300 border border-red-800' :
                          'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {b.status}
                        </span>
                      </div>

                      <h4 className="font-display text-lg text-white font-medium mb-1">
                        {b.name}
                      </h4>

                      <div className="space-y-1.5 text-xs text-[#cbb29c] my-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#e5a85b]" />
                          <span>{b.date} at <strong className="text-white">{b.time}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-[#e5a85b]" />
                          <span>{b.guests} Guests • {b.tablePreference}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-[#e5a85b]" />
                          <a href={`tel:${b.phone}`} className="hover:underline font-mono">{b.phone}</a>
                        </div>
                      </div>

                      {b.specialRequests && (
                        <div className="p-2.5 rounded-xl bg-[#21140c] border border-[#3d2516] text-xs text-[#d8beaa] mb-3">
                          <strong className="text-[#e2ab71]">Notes:</strong> {b.specialRequests}
                        </div>
                      )}

                      {b.adminNotes && (
                        <div className="p-2.5 rounded-xl bg-[#1e170f] border border-[#4d321d] text-xs text-amber-200/90 mb-3">
                          <strong className="text-amber-400">Staff:</strong> {b.adminNotes}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#29180f] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStatusChange(b.id, 'confirmed')}
                          className="px-2 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-medium"
                          title="Confirm Table"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatusChange(b.id, 'seated')}
                          className="px-2 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800 text-[11px] font-medium"
                          title="Guest Seated"
                        >
                          Seated
                        </button>
                        <button
                          onClick={() => handleStatusChange(b.id, 'cancelled')}
                          className="px-2 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 text-[11px] font-medium"
                          title="Cancel Reservation"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingBooking(b)}
                          className="p-1.5 rounded-lg bg-[#27170e] hover:bg-[#382114] text-[#d6b497] hover:text-white"
                          title="Edit Booking"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setBookingToDelete(b)}
                          className="p-1.5 rounded-lg bg-[#27170e] hover:bg-red-950 text-[#d6b497] hover:text-red-300 cursor-pointer"
                          title="Delete Booking"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: MENU & HIGHLIGHTS CONTROL */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'menu' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={menuFilterCategory}
                  onChange={(e) => setMenuFilterCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#1b1009] border border-[#382215] text-xs text-[#d7beaa] focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="coffee">Coffee & Warm Drinks</option>
                  <option value="brunch">Brunch Classics</option>
                  <option value="mains">Mains & Gnocchi</option>
                  <option value="pastries">Pastries & Sweets</option>
                  <option value="wine">Regional Wines</option>
                </select>

                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-[#1b1009] border border-[#382215] text-xs text-[#d7beaa] focus:outline-none"
                >
                  <option value="all">All Statuses (Visible & Hidden)</option>
                  <option value="visible">Visible on Website Only</option>
                  <option value="hidden">Hidden / Drafts Only</option>
                </select>

                <div className="text-xs text-[#9f8570] flex items-center gap-2">
                  <span>Showing {filteredMenuItems.length} dishes</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-300">
                    {menuItems.filter(m => !m.hidden).length} live
                  </span>
                  {menuItems.filter(m => m.hidden).length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-600 text-amber-300">
                      {menuItems.filter(m => m.hidden).length} hidden
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingMenuItem(null);
                  setMenuForm({
                    name: '',
                    category: 'brunch',
                    price: 22,
                    description: '',
                    dietary: [],
                    popular: false,
                    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
                    hidden: false
                  });
                  setIsNewMenuModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ba7534] to-[#8d501e] hover:from-[#c88240] text-white text-xs font-semibold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Menu Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl transition-all overflow-hidden flex flex-col justify-between shadow-lg ${
                    item.hidden
                      ? 'bg-[#150d08] border-2 border-dashed border-amber-900/60 opacity-90'
                      : 'bg-[#180f09] border border-[#352014] hover:border-[#5d3821]'
                  }`}
                >
                  {item.image && (
                    <div className="aspect-[16/9] w-full overflow-hidden relative bg-black/40">
                      <img src={item.image} alt={item.name} className={`w-full h-full object-cover ${item.hidden ? 'grayscale-[40%]' : ''}`} />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        {item.hidden ? (
                          <div className="px-2.5 py-0.5 rounded-full bg-black/85 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-700/80 flex items-center gap-1 shadow-md">
                            <EyeOff className="w-3 h-3 text-amber-400" />
                            <span>Hidden</span>
                          </div>
                        ) : (
                          <div className="px-2.5 py-0.5 rounded-full bg-emerald-950/85 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-700/80 flex items-center gap-1 shadow-md">
                            <Eye className="w-3 h-3 text-emerald-400" />
                            <span>Live</span>
                          </div>
                        )}
                      </div>

                      {item.popular && (
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-[#b56e2e]/90 text-white text-[10px] font-bold uppercase tracking-wider border border-[#e3a35d]/60 shadow-md">
                          Highlight
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-display text-lg text-white font-medium">
                          {item.name}
                        </h4>
                        <span className="font-mono text-base font-bold text-[#e5af75]">
                          A${item.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] uppercase tracking-wider text-[#9d816b] font-semibold">
                          {item.category}
                        </span>
                        {item.hidden && (
                          <span className="text-[10px] text-amber-400 font-medium italic">
                            (Draft / Not visible on site)
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#a8907d] leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#29180f] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {item.dietary?.map((tag, idx) => (
                          <span key={idx} className="text-[10px] text-[#937b67] bg-[#22140c] px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto">
                        {/* Instant Hide / Show toggle */}
                        <button
                          onClick={() => handleToggleMenuVisibility(item)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                            item.hidden
                              ? 'bg-amber-950/90 hover:bg-amber-900 text-amber-200 border border-amber-800'
                              : 'bg-[#27170e] hover:bg-[#382114] text-[#cfb29b] hover:text-white border border-[#3e2517]'
                          }`}
                          title={item.hidden ? "Click to Show on Website" : "Click to Hide from Customers"}
                        >
                          {item.hidden ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[11px]">Show</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-[11px]">Hide</span>
                            </>
                          )}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setEditingMenuItem(item);
                            setMenuForm(item);
                            setIsNewMenuModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-[#27170e] hover:bg-[#382114] text-[#d6b497] hover:text-white border border-[#3e2517] cursor-pointer"
                          title="Edit Dish & Price"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Safe Delete Button (Opens In-App Modal) */}
                        <button
                          onClick={() => setMenuItemToDelete(item)}
                          className="p-1.5 rounded-lg bg-[#27170e] hover:bg-red-950 text-[#d6b497] hover:text-red-300 border border-[#3e2517] hover:border-red-900/60 cursor-pointer"
                          title="Permanently Delete Dish"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: DATE, TIME & OFF-DAYS CONTROL */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'settings' && settingsForm && (
          <form onSubmit={handleSaveSettings} className="max-w-4xl space-y-8">
            
            {settingsSavedSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Cafe hours, schedule, and off-days have been saved live!</span>
              </div>
            )}

            {/* Off-Days & Closure Section */}
            <div className="p-6 rounded-3xl bg-[#170e08] border border-[#3b2316] space-y-6 shadow-xl">
              <div className="border-b border-[#2d1b11] pb-4">
                <h3 className="font-display text-xl text-white font-semibold flex items-center gap-2">
                  <CalendarX className="w-5 h-5 text-[#dfa467]" />
                  <span>Off-Days & Holiday Closures</span>
                </h3>
                <p className="text-xs text-[#a98f78] mt-1">
                  Control which days the cafe is closed. Customers will see closures on the calendar and won't be able to book those dates.
                </p>
              </div>

              {/* Weekly Off Days */}
              <div>
                <label className="block text-xs font-semibold text-[#d9c0a9] uppercase tracking-wider mb-2">
                  Regular Weekly Off-Days (Leave unchecked if open 7 days)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                    const isChecked = (settingsForm.offDaysWeekly || []).includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleWeeklyDay(day)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                          isChecked
                            ? 'bg-red-950/80 border-red-700 text-red-200'
                            : 'bg-[#22140c] border-[#3f2718] text-[#cbb29c] hover:border-[#613c23]'
                        }`}
                      >
                        {day}
                        <span className="block text-[10px] mt-0.5 opacity-80">
                          {isChecked ? 'Closed' : 'Open'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specific Closed Dates List */}
              <div>
                <label className="block text-xs font-semibold text-[#d9c0a9] uppercase tracking-wider mb-2">
                  Specific Holiday / Emergency Closed Dates
                </label>

                {/* Add Closed Date Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-4">
                  <div className="sm:col-span-4">
                    <input
                      type="date"
                      value={newClosedDate}
                      onChange={(e) => setNewClosedDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#22140c] border border-[#3f2718] text-white text-xs focus:outline-none focus:border-[#d4944b]"
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      placeholder="e.g. Christmas Day, Staff Deep Cleaning, Easter Monday"
                      value={newClosedReason}
                      onChange={(e) => setNewClosedReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#22140c] border border-[#3f2718] text-white text-xs focus:outline-none focus:border-[#d4944b]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddClosedDate}
                      className="w-full py-2 rounded-xl bg-[#b67437] hover:bg-[#c98341] text-white text-xs font-semibold"
                    >
                      + Add Date
                    </button>
                  </div>
                </div>

                {/* Current Closed Dates */}
                <div className="space-y-2">
                  {(settingsForm.specificClosedDates || []).length === 0 ? (
                    <p className="text-xs text-[#8e735e] italic">No specific closure dates registered.</p>
                  ) : (
                    (settingsForm.specificClosedDates || []).map((cd: ClosedDate) => (
                      <div
                        key={cd.date}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#22140c] border border-[#3f2718] text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-amber-300">{cd.date}</span>
                          <span className="text-[#e2c7b0]">{cd.reason}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveClosedDate(cd.date)}
                          className="p-1 rounded-lg text-red-400 hover:bg-red-950/60 transition-colors"
                          title="Remove closure"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Public Notice Banner */}
              <div>
                <label className="block text-xs font-semibold text-[#d9c0a9] uppercase tracking-wider mb-1">
                  Public Off-Day Notice Banner (Shows on website & booking calendar)
                </label>
                <input
                  type="text"
                  value={settingsForm.offDayNotice || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, offDayNotice: e.target.value })}
                  placeholder="e.g. Notice: L'espresso will be closed on Easter Monday & Christmas Day."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#22140c] border border-[#3f2718] text-white text-xs focus:outline-none focus:border-[#d4944b]"
                />
              </div>

            </div>

            {/* Operating Hours & Capacity */}
            <div className="p-6 rounded-3xl bg-[#170e08] border border-[#3b2316] space-y-4 shadow-xl">
              <div className="border-b border-[#2d1b11] pb-3">
                <h3 className="font-display text-xl text-white font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#dfa467]" />
                  <span>Cafe Daily Operating Hours</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#cbb29c] mb-1">Daily Cafe Hours (Display Text)</label>
                  <input
                    type="text"
                    value={settingsForm.hoursText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, hoursText: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#22140c] border border-[#3f2718] text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#cbb29c] mb-1">Kitchen Service Hours</label>
                  <input
                    type="text"
                    value={settingsForm.kitchenHours}
                    onChange={(e) => setSettingsForm({ ...settingsForm, kitchenHours: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#22140c] border border-[#3f2718] text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#cbb29c] mb-1">Open Days Badge</label>
                  <input
                    type="text"
                    value={settingsForm.openDaysText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, openDaysText: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#22140c] border border-[#3f2718] text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#cbb29c] mb-1">Max Table Capacity (per 30-min slot)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={settingsForm.maxTablesPerSlot}
                    onChange={(e) => setSettingsForm({ ...settingsForm, maxTablesPerSlot: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#22140c] border border-[#3f2718] text-white text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#ba7534] to-[#8d501e] hover:from-[#c88240] text-white text-sm font-semibold flex items-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Save All Schedule & Off-Day Changes Live</span>
            </button>

          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: SECURITY & OWNER ACCESS (BIG COMPANY GRADE) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'security' && settings && (
          <div className="max-w-4xl space-y-8">
            
            {/* Owner Google Account Linking */}
            <div className="p-6 rounded-3xl bg-[#170e08] border border-[#3b2316] space-y-5 shadow-xl">
              <div className="border-b border-[#2d1b11] pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl text-white font-semibold flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#dfa467]" />
                    <span>Authorized Owner Google Account</span>
                  </h3>
                  <p className="text-xs text-[#a98f78] mt-1">
                    Only this verified Gmail account is allowed to log into the admin panel using Google Sign-In.
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Protected
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#22140c] border border-[#3f2718] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-[#9f8570] block mb-1">Current Authorized Owner Gmail:</span>
                  <span className="font-mono text-base font-semibold text-white">
                    {settings.adminEmail || 'farhatulhasannehad@gmail.com'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowManualGoogleModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#2c170d] hover:bg-[#3d2011] border border-[#522f18] text-[#e5a85b] text-xs font-semibold cursor-pointer"
                >
                  Change Owner Email
                </button>
              </div>
            </div>

            {/* Change Admin Password */}
            <div className="p-6 rounded-3xl bg-[#170e08] border border-[#3b2316] space-y-5 shadow-xl">
              <div className="border-b border-[#2d1b11] pb-4">
                <h3 className="font-display text-xl text-white font-semibold flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#dfa467]" />
                  <span>Update Admin Password</span>
                </h3>
                <p className="text-xs text-[#a98f78] mt-1">
                  Change your admin password at any time. It will be stored using SHA-256 cryptographic salted hashing.
                </p>
              </div>

              {passChangeMsg && (
                <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 border ${
                  passChangeMsg.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
                    : 'bg-red-950/80 border-red-800 text-red-200'
                }`}>
                  {passChangeMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                  <span>{passChangeMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-medium text-[#d9c0a9] mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#22140c] border border-[#3f2718] text-white text-xs focus:outline-none focus:border-[#d4944b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#d9c0a9] mb-1">
                    New Password (min 6 characters) *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#22140c] border border-[#3f2718] text-white text-xs focus:outline-none focus:border-[#d4944b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#d9c0a9] mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPass}
                    onChange={(e) => setConfirmNewPass(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#22140c] border border-[#3f2718] text-white text-xs focus:outline-none focus:border-[#d4944b]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passChangeLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#ba7534] hover:bg-[#cb823b] text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {passChangeLoading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            </div>

            {/* Emergency Recovery Key */}
            <div className="p-6 rounded-3xl bg-[#170e08] border border-[#3b2316] space-y-4 shadow-xl">
              <div className="border-b border-[#2d1b11] pb-3">
                <h3 className="font-display text-xl text-white font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#dfa467]" />
                  <span>Emergency Recovery Key</span>
                </h3>
                <p className="text-xs text-[#a98f78] mt-1">
                  Keep this emergency key in a safe place. If you ever forget your password, you can break/reset your password using this key along with your registered Gmail.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#22140c] border border-[#3f2718] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#9f8570] block mb-1">Master Recovery Key:</span>
                  <span className="font-mono text-sm font-bold text-amber-300">
                    {showRecoveryKey ? (settings.adminRecoveryCode || 'LES-RECOVER-8492') : '••••••••••••••••'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRecoveryKey(!showRecoveryKey)}
                    className="p-2 rounded-xl bg-[#2c170d] hover:bg-[#3d2011] text-[#e5a85b] text-xs font-medium"
                    title={showRecoveryKey ? 'Hide Key' : 'Reveal Key'}
                  >
                    {showRecoveryKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(settings.adminRecoveryCode || 'LES-RECOVER-8492');
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="px-3 py-2 rounded-xl bg-[#2c170d] hover:bg-[#3d2011] text-[#e5a85b] text-xs font-medium flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Security Shields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#1b1009] border border-[#352014]">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Brute-Force Shield Active</span>
                </div>
                <p className="text-[11px] text-[#9a7f6b]">
                  Automatically locks after 5 consecutive failed attempts for 5 minutes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1b1009] border border-[#352014]">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Salted Cryptographic Hash</span>
                </div>
                <p className="text-[11px] text-[#9a7f6b]">
                  Passwords are never stored in plain text. Protected against database leaks.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1b1009] border border-[#352014]">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Gmail Domain Gated</span>
                </div>
                <p className="text-[11px] text-[#9a7f6b]">
                  Only the registered owner Google account can authenticate via OAuth.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: ENQUIRIES */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4 max-w-4xl">
            {enquiries.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#170e08] border border-[#331e12]">
                <MessageSquare className="w-12 h-12 text-[#684c36] mx-auto mb-3" />
                <h4 className="font-display text-lg text-white font-medium">No messages yet</h4>
                <p className="text-xs text-[#9f8570]">Customer messages sent via the contact form will appear here.</p>
              </div>
            ) : (
              enquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="p-5 rounded-2xl bg-[#180f09] border border-[#352014] hover:border-[#52321e] transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-lg text-white font-medium">{enq.name}</span>
                    <span className="text-xs text-[#8e735e]">{new Date(enq.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#cbb29c] mb-3">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#e5a85b]" />
                      <a href={`tel:${enq.phone}`} className="hover:underline font-mono">{enq.phone}</a>
                    </div>
                    {enq.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#e5a85b]" />
                        <a href={`mailto:${enq.email}`} className="hover:underline">{enq.email}</a>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#21140c] border border-[#382114] text-xs text-[#d7c0ae] leading-relaxed">
                    <p className="font-semibold text-[#e5af75] mb-1">{enq.subject}</p>
                    <p>{enq.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT MENU ITEM */}
      {/* ------------------------------------------------------------- */}
      {isNewMenuModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-[#1b1009] border border-[#482c1b] rounded-3xl p-6 sm:p-7 text-left shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#352014]">
              <h3 className="font-display text-xl text-white font-semibold">
                {editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                onClick={() => setIsNewMenuModalOpen(false)}
                className="text-[#967c66] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenuItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#d9c0a9] font-medium mb-1">Dish / Drink Name *</label>
                  <input
                    type="text"
                    required
                    value={menuForm.name || ''}
                    onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                    placeholder="e.g. Truffle Scrambled Eggs"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#25160d] border border-[#482c19] text-white"
                  />
                </div>

                <div>
                  <label className="block text-[#d9c0a9] font-medium mb-1">Price (A$) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={menuForm.price || ''}
                    onChange={(e) => setMenuForm({ ...menuForm, price: parseFloat(e.target.value) })}
                    placeholder="24.00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#25160d] border border-[#482c19] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#d9c0a9] font-medium mb-1">Category *</label>
                <select
                  value={menuForm.category || 'brunch'}
                  onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#25160d] border border-[#482c19] text-white"
                >
                  <option value="coffee">Artisan Coffee & Warm Drinks</option>
                  <option value="brunch">Brunch & Morning Classics</option>
                  <option value="mains">House Gnocchi & Mains</option>
                  <option value="pastries">Morning Pastries & Sweets</option>
                  <option value="wine">Regional Wine & Spritz</option>
                </select>
              </div>

              <div>
                <label className="block text-[#d9c0a9] font-medium mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={menuForm.description || ''}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  placeholder="Ingredients, preparation, provenance..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#25160d] border border-[#482c19] text-white"
                />
              </div>

              <div>
                <label className="block text-[#d9c0a9] font-medium mb-1">Photo Image URL</label>
                <input
                  type="url"
                  value={menuForm.image || ''}
                  onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#25160d] border border-[#482c19] text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={!!menuForm.popular}
                  onChange={(e) => setMenuForm({ ...menuForm, popular: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#ba7534] cursor-pointer"
                />
                <label htmlFor="popularCheck" className="text-sm text-[#e0c4ac] cursor-pointer">
                  Feature as Chef Highlight / House Signature
                </label>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#1b1009] border border-[#3b2214]">
                <input
                  type="checkbox"
                  id="hiddenCheck"
                  checked={!!menuForm.hidden}
                  onChange={(e) => setMenuForm({ ...menuForm, hidden: e.target.checked })}
                  className="w-4 h-4 rounded accent-amber-600 cursor-pointer"
                />
                <div>
                  <label htmlFor="hiddenCheck" className="text-sm font-medium text-[#f0d5bf] cursor-pointer block">
                    Hide dish from customer website
                  </label>
                  <p className="text-[11px] text-[#9c8471]">
                    Check this if the dish is out of season or a draft. You can still see and restore it in the admin panel at any time.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#311c11]">
                <button
                  type="button"
                  onClick={() => setIsNewMenuModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#29170e] text-[#cbb29c]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#ba7534] to-[#8d501e] text-white font-semibold"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EDIT BOOKING DETAILS */}
      {/* ------------------------------------------------------------- */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-[#1b1009] border border-[#482c1b] rounded-3xl p-6 sm:p-7 text-left shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#352014]">
              <h3 className="font-display text-xl text-white font-semibold">
                Edit Booking #{editingBooking.id}
              </h3>
              <button
                onClick={() => setEditingBooking(null)}
                className="text-[#967c66] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBookingEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#d9c0a9] font-medium mb-1">Guest Name</label>
                  <input
                    type="text"
                    required
                    value={editingBooking.name}
                    onChange={(e) => setEditingBooking({ ...editingBooking, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#25160d] border border-[#482c19] text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#d9c0a9] font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={editingBooking.phone}
                    onChange={(e) => setEditingBooking({ ...editingBooking, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#25160d] border border-[#482c19] text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#d9c0a9] font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={editingBooking.date}
                    onChange={(e) => setEditingBooking({ ...editingBooking, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#25160d] border border-[#482c19] text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#d9c0a9] font-medium mb-1">Time</label>
                  <input
                    type="text"
                    required
                    value={editingBooking.time}
                    onChange={(e) => setEditingBooking({ ...editingBooking, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#25160d] border border-[#482c19] text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#d9c0a9] font-medium mb-1">Guests</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={editingBooking.guests}
                    onChange={(e) => setEditingBooking({ ...editingBooking, guests: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#25160d] border border-[#482c19] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#d9c0a9] font-medium mb-1">Status</label>
                <select
                  value={editingBooking.status}
                  onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#25160d] border border-[#482c19] text-white"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="seated">Seated</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[#d9c0a9] font-medium mb-1">Internal Staff Notes</label>
                <textarea
                  rows={2}
                  value={editingBooking.adminNotes || ''}
                  onChange={(e) => setEditingBooking({ ...editingBooking, adminNotes: e.target.value })}
                  placeholder="e.g. VIP booth allocated, anniversary setup..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#25160d] border border-[#482c19] text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#311c11]">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2 rounded-xl bg-[#29170e] text-[#cbb29c]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#ba7534] to-[#8d501e] text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD PHONE / WALK-IN BOOKING */}
      {/* ------------------------------------------------------------- */}
      {isNewBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-[#1b1009] border border-[#482c1b] rounded-3xl p-6 sm:p-7 text-left shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#352014]">
              <h3 className="font-display text-xl text-white font-semibold">
                New Phone / Walk-in Reservation
              </h3>
              <button
                onClick={() => setIsNewBookingModalOpen(false)}
                className="text-[#967c66] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewBooking} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#d9c0a9] font-medium mb-1">Guest Name *</label>
                  <input
                    type="text"
                    required
                    value={newBookingForm.name}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, name: e.target.value })}
                    placeholder="Guest name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#25160d] border border-[#482c19] text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#d9c0a9] font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newBookingForm.phone}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, phone: e.target.value })}
                    placeholder="+61 4..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#25160d] border border-[#482c19] text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#d9c0a9] font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newBookingForm.date}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#25160d] border border-[#482c19] text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#d9c0a9] font-medium mb-1">Time *</label>
                  <input
                    type="text"
                    required
                    value={newBookingForm.time}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, time: e.target.value })}
                    placeholder="09:00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#25160d] border border-[#482c19] text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#d9c0a9] font-medium mb-1">Guests *</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={newBookingForm.guests}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, guests: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#25160d] border border-[#482c19] text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#311c11]">
                <button
                  type="button"
                  onClick={() => setIsNewBookingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#29170e] text-[#cbb29c]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#ba7534] to-[#8d501e] text-white font-semibold"
                >
                  Confirm & Reserve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DELETE / HIDE MENU ITEM CONFIRMATION */}
      {/* ------------------------------------------------------------- */}
      {menuItemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-[#1b1009] border border-[#5d291d] p-6 text-left shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#3b1f14]">
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display text-lg text-white font-semibold">Delete Menu Item?</h4>
                <p className="text-xs text-[#a48e7b]">L'espresso Menu Management</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#130b06] border border-[#382013] mb-4 flex items-center gap-3">
              {menuItemToDelete.image && (
                <img
                  src={menuItemToDelete.image}
                  alt={menuItemToDelete.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#482c19]"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-white truncate text-sm">{menuItemToDelete.name}</div>
                <div className="text-xs text-[#b89a81]">
                  A${menuItemToDelete.price.toFixed(2)} • <span className="uppercase text-[10px]">{menuItemToDelete.category}</span>
                </div>
                {menuItemToDelete.hidden && (
                  <span className="text-[10px] text-amber-400 font-medium">Currently Hidden from customers</span>
                )}
              </div>
            </div>

            <p className="text-xs text-[#c5ad98] leading-relaxed mb-5">
              Are you sure you want to permanently delete <strong className="text-white">"{menuItemToDelete.name}"</strong>? You can also hide it instead if you want to keep the dish details and pricing for later.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setMenuItemToDelete(null)}
                disabled={deleteLoading}
                className="px-4 py-2.5 rounded-xl bg-[#26150d] hover:bg-[#341d12] text-[#d6b599] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>

              {!menuItemToDelete.hidden && (
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={async () => {
                    await handleToggleMenuVisibility(menuItemToDelete);
                    setMenuItemToDelete(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700/80 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide Instead</span>
                </button>
              )}

              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDeleteMenuItem}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteLoading ? 'Deleting...' : 'Permanently Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DELETE BOOKING CONFIRMATION */}
      {/* ------------------------------------------------------------- */}
      {bookingToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-[#1b1009] border border-[#5d291d] p-6 text-left shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#3b1f14]">
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display text-lg text-white font-semibold">Delete Reservation?</h4>
                <p className="text-xs text-[#a48e7b]">Ref #{bookingToDelete.id}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#130b06] border border-[#382013] mb-4 space-y-1">
              <div className="font-semibold text-white text-sm">{bookingToDelete.name}</div>
              <div className="text-xs text-[#b89a81]">
                {bookingToDelete.date} at {bookingToDelete.time} • {bookingToDelete.guests} Guests
              </div>
              <div className="text-xs text-[#9c8471]">{bookingToDelete.phone}</div>
            </div>

            <p className="text-xs text-[#c5ad98] leading-relaxed mb-5">
              Are you sure you want to permanently delete this reservation from the live diary? This action cannot be undone.
            </p>

            <div className="flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setBookingToDelete(null)}
                disabled={deleteLoading}
                className="px-4 py-2.5 rounded-xl bg-[#26150d] hover:bg-[#341d12] text-[#d6b599] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDeleteBooking}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteLoading ? 'Deleting...' : 'Delete Reservation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
