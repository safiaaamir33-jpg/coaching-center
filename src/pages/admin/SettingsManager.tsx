import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Building,
  Phone,
  Mail,
  Sparkles,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Palette,
  Bot,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';
import { updateAcademySettings } from '../../services/academyService';
import { uploadImageOrFile } from '../../services/storageService';
import { applyDynamicTheme } from '../../utils/theme';
import { getFriendlyErrorMessage } from '../../firebase/errors';

export const SettingsManager: React.FC = () => {
  const { settings, refreshSettings } = useAcademy();

  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '/academy_logo.jpg');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [academyName, setAcademyName] = useState(settings.academyName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [address, setAddress] = useState(settings.address);
  const [city, setCity] = useState(settings.city);
  const [province, setProvince] = useState(settings.province);
  const [phone, setPhone] = useState(settings.phone);
  const [alternatePhone, setAlternatePhone] = useState(settings.alternatePhone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [email, setEmail] = useState(settings.email);
  const [admissionOpen, setAdmissionOpen] = useState(settings.admissionOpen);
  const [admissionBannerTitle, setAdmissionBannerTitle] = useState(settings.admissionBannerTitle);
  const [admissionBannerText, setAdmissionBannerText] = useState(settings.admissionBannerText);
  const [marqueeAnnouncement, setMarqueeAnnouncement] = useState(settings.marqueeAnnouncement || '');
  const [aboutText, setAboutText] = useState(settings.aboutText);
  const [missionText, setMissionText] = useState(settings.missionText);
  const [visionText, setVisionText] = useState(settings.visionText);
  const [facilities, setFacilities] = useState<string[]>(settings.facilities || []);
  const [newFacility, setNewFacility] = useState('');
  const [officeHours, setOfficeHours] = useState(settings.officeHours || '');
  const [googleMapUrl, setGoogleMapUrl] = useState(settings.googleMapUrl || '');
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor || '#1d4ed8');
  const [accentColor, setAccentColor] = useState(settings.accentColor || '#0284c7');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddFacility = () => {
    if (newFacility.trim()) {
      setFacilities([...facilities, newFacility.trim()]);
      setNewFacility('');
    }
  };

  const handleRemoveFacility = (idx: number) => {
    setFacilities(facilities.filter((_, i) => i !== idx));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      let finalLogoUrl = logoUrl.trim();
      if (logoFile) {
        finalLogoUrl = await uploadImageOrFile(logoFile, 'public');
      }

      await updateAcademySettings({
        academyName: academyName.trim(),
        tagline: tagline.trim(),
        address: address.trim(),
        city: city.trim(),
        province: province.trim(),
        phone: phone.trim(),
        alternatePhone: alternatePhone.trim(),
        whatsappNumber: whatsappNumber.trim(),
        email: email.trim(),
        logoUrl: finalLogoUrl,
        admissionOpen,
        admissionBannerTitle: admissionBannerTitle.trim(),
        admissionBannerText: admissionBannerText.trim(),
        marqueeAnnouncement: marqueeAnnouncement.trim(),
        aboutText: aboutText.trim(),
        missionText: missionText.trim(),
        visionText: visionText.trim(),
        facilities,
        officeHours: officeHours.trim(),
        googleMapUrl: googleMapUrl.trim(),
        primaryColor,
        accentColor,
      });

      await refreshSettings();
      setSuccess(true);
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
            Customization & Branding
          </span>
          <h1 className="text-2xl font-black font-serif text-slate-900">
            Academy Global Settings
          </h1>
          <p className="text-xs text-slate-500">
            Customize academy name, Sadiqabad campus address, contact details, banner alerts, and branding.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Updating Settings...' : 'Save All Changes'}
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings saved successfully and updated live across the entire public website!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Chatbot Configuration Link Banner */}
      <div className="bg-gradient-to-r from-[#070f1e] via-[#0f2042] to-[#1e3a8a] text-white p-5 rounded-3xl border border-blue-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">AI Chatbot & Virtual Counselor Settings</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                New
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Customize bot name, greeting message, AI behavior prompt, quick questions, and custom knowledge.
            </p>
          </div>
        </div>
        <Link
          to="/admin/chatbot"
          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition shrink-0 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <span>Open Chatbot Settings</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Academy Identity */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-700" />
            Academy Identity & Naming
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Academy Official Name *
              </label>
              <input
                type="text"
                required
                value={academyName}
                onChange={(e) => setAcademyName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-sm text-blue-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Province / Region</label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Full Campus Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Color (Hex)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-32 px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-xs uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Accent Color (Hex)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-32 px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-xs uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Official Logo & Insignia (اکیڈمی کا آفیشل لوگو تبدیل کریں) */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-5">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase text-blue-700 tracking-wider">
                Visual Branding & Insignia
              </span>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-500" />
                Academy Official Logo (اکیڈمی کا لوگو تبدیل کریں)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload your coaching center's official logo, select preset insignia, or link your image.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
              Live on Website & Receipts
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Live Dual-Preview Box (Light & Dark) */}
            <div className="lg:col-span-5 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Live Logo Preview (لائیو پریویو):
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* On Light Background (Navbar Style) */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white text-center space-y-2 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Light (Navbar)
                  </span>
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs overflow-hidden">
                    <img
                      src={logoPreview || logoUrl || '/academy_logo.jpg'}
                      alt="Academy Logo Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 block truncate">
                    {academyName}
                  </span>
                </div>

                {/* On Dark Background (Header/Footer Style) */}
                <div className="p-3.5 rounded-2xl border border-blue-950 bg-[#070f1e] text-center space-y-2 shadow-md">
                  <span className="text-[10px] font-bold text-blue-300 block uppercase">
                    Dark (Header & Footer)
                  </span>
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-white/95 border border-amber-400/50 p-1 flex items-center justify-center shadow-xs overflow-hidden">
                    <img
                      src={logoPreview || logoUrl || '/academy_logo.jpg'}
                      alt="Academy Logo Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-blue-200 block truncate">
                    {academyName}
                  </span>
                </div>
              </div>

              {/* Reset to Default Button */}
              <button
                type="button"
                onClick={() => {
                  setLogoUrl('/academy_logo.jpg');
                  setLogoFile(null);
                  setLogoPreview(null);
                }}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Restore Official Sadiqabad Logo (ڈیفالٹ لوگو)</span>
              </button>
            </div>

            {/* Upload & Choose Controls */}
            <div className="lg:col-span-7 space-y-4 text-xs">
              {/* Option A: Upload from Device */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-blue-700" />
                    Upload from Device or Mobile (موبائل یا کمپیوٹر سے نیا لوگو اپلوڈ کریں)
                  </label>
                  {logoFile && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ✓ Ready to save
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Select your PNG, JPG, or SVG image file. It will be compressed automatically for fast loading.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setLogoFile(file);
                      if (file) {
                        setLogoPreview(URL.createObjectURL(file));
                      } else {
                        setLogoPreview(null);
                      }
                    }}
                    className="flex-1 text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0f2042] file:text-amber-300 hover:file:bg-[#1a365d] cursor-pointer"
                  />
                  {logoFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                      className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Option C: Preset Emblem Logos */}
              <div className="space-y-2 pt-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">
                  Or Pick a Preset Academy Emblem (تیار شدہ اکیڈمی لوگوز):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      title: 'Official Gold & Navy Seal (رسمی مہر)',
                      url: '/academy_logo.jpg',
                      desc: 'Circular Sadiqabad seal with book & gold star',
                    },
                    {
                      title: 'Modern Academic Badge (جدید بیج)',
                      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=300&q=80',
                      desc: 'Campus learning and excellence badge',
                    },
                  ].map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => {
                        setLogoUrl(preset.url);
                        setLogoPreview(preset.url);
                        setLogoFile(null);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                        (logoPreview || logoUrl) === preset.url
                          ? 'bg-blue-50 border-blue-500 shadow-xs ring-1 ring-blue-500'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img src={preset.url} alt={preset.title} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-xs truncate">{preset.title}</div>
                        <div className="text-[10px] text-slate-500 truncate">{preset.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Numbers & WhatsApp */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-700" />
            Contact & Location Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Mobile / Telephone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alternate Landline Phone</label>
              <input
                type="text"
                value={alternatePhone}
                onChange={(e) => setAlternatePhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp Official Number</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reception & Office Hours</label>
              <input
                type="text"
                value={officeHours}
                onChange={(e) => setOfficeHours(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Google Maps Direction URL</label>
              <input
                type="text"
                value={googleMapUrl}
                onChange={(e) => setGoogleMapUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Admission Alert Banner & Marquee */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Admissions Open Alert Banner & Top Marquee
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="admissionOpenToggle"
                checked={admissionOpen}
                onChange={(e) => setAdmissionOpen(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 border-slate-300"
              />
              <label htmlFor="admissionOpenToggle" className="font-bold text-sm text-slate-800 cursor-pointer">
                Enable Public "Admissions Open" Banner on Website
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Banner Headline</label>
                <input
                  type="text"
                  value={admissionBannerTitle}
                  onChange={(e) => setAdmissionBannerTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Banner Description Text</label>
                <input
                  type="text"
                  value={admissionBannerText}
                  onChange={(e) => setAdmissionBannerText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Top Navigation Emergency / Marquee Announcement Text
              </label>
              <input
                type="text"
                value={marqueeAnnouncement}
                onChange={(e) => setMarqueeAnnouncement(e.target.value)}
                placeholder="e.g. New Batch for Matric starting Monday in Sadiqabad!"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Section 4: About, Mission & Facilities */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
            Campus Mission, Vision & Facilities
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">About Text</label>
              <textarea
                rows={3}
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mission Statement</label>
                <textarea
                  rows={3}
                  value={missionText}
                  onChange={(e) => setMissionText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vision Statement</label>
                <textarea
                  rows={3}
                  value={visionText}
                  onChange={(e) => setVisionText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            {/* Facilities List Manager */}
            <div>
              <label className="block font-semibold text-slate-700 mb-2">Campus Facilities</label>
              <div className="space-y-2 mb-3">
                {facilities.map((fac, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-medium text-slate-800">{fac}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFacility(idx)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  placeholder="e.g. Separate Science Practical Demonstration Lab"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddFacility}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold"
                >
                  Add Facility
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Theme & Appearance */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-600" />
              Theme & Visual Appearance (تھیم تبدیل کریں)
            </h3>
            <span className="text-xs text-amber-300 bg-[#0f2042] px-2.5 py-0.5 rounded-full font-semibold border border-blue-900/50">
              Live Theme Controls
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Select an academy theme preset to instantly upgrade the look and feel of the website and portal:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { name: 'Dark Blue & Gold', primary: '#0f2042', accent: '#f59e0b', desc: 'Prestige Dark Blue Coaching' },
                { name: 'Royal Blue & Gold', primary: '#1e3a8a', accent: '#f59e0b', desc: 'Bright Academic Blue' },
                { name: 'Emerald & Mint', primary: '#065f46', accent: '#10b981', desc: 'Fresh & Inspiring' },
                { name: 'Midnight Navy', primary: '#0b132b', accent: '#eab308', desc: 'Deep Midnight Navy' },
                { name: 'Crimson & Amber', primary: '#881337', accent: '#f59e0b', desc: 'Classic & Bold' },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrimaryColor(preset.primary);
                    setAccentColor(preset.accent);
                    applyDynamicTheme(preset.primary, preset.accent);
                  }}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer relative ${
                    primaryColor === preset.primary && accentColor === preset.accent
                      ? 'border-[#0f2042] bg-[#0f2042]/10 shadow-xs ring-2 ring-[#0f2042]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-5 h-5 rounded-full shadow-xs border border-white"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <span
                      className="w-5 h-5 rounded-full shadow-xs border border-white"
                      style={{ backgroundColor: preset.accent }}
                    />
                  </div>
                  <div className="font-bold text-slate-800 text-[11px] leading-tight">{preset.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Custom Primary Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      applyDynamicTheme(e.target.value, accentColor);
                    }}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      applyDynamicTheme(e.target.value, accentColor);
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Custom Accent / Highlight Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => {
                      setAccentColor(e.target.value);
                      applyDynamicTheme(primaryColor, e.target.value);
                    }}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => {
                      setAccentColor(e.target.value);
                      applyDynamicTheme(primaryColor, e.target.value);
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Updating Settings...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
