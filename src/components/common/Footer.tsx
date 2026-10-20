import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';

export const Footer: React.FC = () => {
  const { settings } = useAcademy();

  return (
    <footer className="bg-[#070f1e] text-slate-300 pt-16 pb-8 mb-14 md:mb-0 border-t border-blue-950 max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-blue-950/80">
          {/* Academy Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/95 flex items-center justify-center shadow-lg border border-amber-400/50 p-0.5 shrink-0">
                  <img
                    src={settings.logoUrl}
                    alt={settings.academyName}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0f2042] to-[#1e3a8a] flex items-center justify-center text-white border border-blue-900/60 shadow-md shrink-0">
                  <GraduationCap className="w-6 h-6 text-amber-300" />
                </div>
              )}
              <div>
                <span className="text-xl font-bold text-white font-serif tracking-tight block">
                  {settings.academyName}
                </span>
                <span className="text-xs text-blue-400 font-medium">Sadiqabad, Punjab</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {settings.tagline}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                BISE Bahawalpur Board Pattern Coaching
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-blue-400 transition">About Academy</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-blue-400 transition">Courses & Fees</Link>
              </li>
              <li>
                <Link to="/teachers" className="hover:text-blue-400 transition">Our Faculty</Link>
              </li>
              <li>
                <Link to="/admissions" className="hover:text-blue-400 transition">Online Admission</Link>
              </li>
              <li>
                <Link to="/admission-status" className="hover:text-blue-400 transition">Check Application Status</Link>
              </li>
              <li>
                <Link to="/results" className="hover:text-blue-400 transition">Student Results Portal</Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-blue-400 transition">Gallery & Announcements</Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-blue-400 transition">Student & Parent Reviews</Link>
              </li>
            </ul>
          </div>

          {/* Classes Offered */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wide">
              Programs Offered
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>• Class 1 to 8 Foundation Tuition</li>
              <li>• Class 9 & 10 Matric (Science Group)</li>
              <li>• F.Sc Part 1 & 2 (Pre-Medical)</li>
              <li>• F.Sc Part 1 & 2 (Pre-Engineering)</li>
              <li>• ICS (Computer Science & Math)</li>
              <li>• Spoken English & IELTS Prep</li>
              <li>• Sunday Board Exam Test Series</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 tracking-wide">
              Contact & Location
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{settings.address}, {settings.city}, {settings.province}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{settings.email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{settings.officeHours || 'Mon – Sat: 8:00 AM – 8:00 PM'}</span>
              </li>
            </ul>
            <div className="mt-4 pt-3 flex items-center gap-3">
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp Us
              </a>
              {settings.googleMapUrl && (
                <a
                  href={settings.googleMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Map Direction
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom copyright and admin login link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} {settings.academyName}. All Rights Reserved. Sadiqabad, Punjab, Pakistan.</p>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="hover:text-slate-200 transition">Help & Support</Link>
            <span>•</span>
            <Link to="/admin/login" className="hover:text-amber-400 transition flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Management Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
