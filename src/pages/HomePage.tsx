import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Award,
  Users,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Sparkles,
  Phone,
  MessageCircle,
  MapPin,
  Star,
  Clock,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { Course, Teacher, Announcement, Review } from '../types';
import { getPublishedCourses } from '../services/courseService';
import { getPublishedTeachers } from '../services/teacherService';
import { getPublishedAnnouncements } from '../services/cmsService';
import { getApprovedReviews } from '../services/reviewService';
import { AdmissionBanner } from '../components/common/AdmissionBanner';

export const HomePage: React.FC = () => {
  const { settings } = useAcademy();
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Omit<Teacher, 'salaryMonthly' | 'phone' | 'email'>[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [c, t, a, r] = await Promise.all([
          getPublishedCourses(),
          getPublishedTeachers(),
          getPublishedAnnouncements(),
          getApprovedReviews(),
        ]);
        setCourses(c.slice(0, 8));
        setTeachers(t.slice(0, 4));
        setAnnouncements(a.slice(0, 6));
        setReviews(r.slice(0, 3));
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const handleCoursesChanged = () => {
      getPublishedCourses().then((c) => setCourses(c.slice(0, 8))).catch(() => {});
    };
    window.addEventListener('bfa_courses_changed', handleCoursesChanged);
    return () => window.removeEventListener('bfa_courses_changed', handleCoursesChanged);
  }, []);

  return (
    <div className="space-y-0 text-slate-800">
      {/* Dynamic Admission Banner */}
      <AdmissionBanner />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#070f1e] via-[#0f2042] to-[#0a1526] text-white pt-16 pb-24 lg:pt-20 lg:pb-32">
        {/* Subtle patterned background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {settings.logoUrl && (
                  <div className="w-14 h-14 rounded-2xl bg-white p-1 border-2 border-amber-400 shadow-xl shadow-amber-400/20 shrink-0">
                    <img
                      src={settings.logoUrl}
                      alt={settings.academyName}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                )}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#070f1e]/80 border border-blue-800/60 text-blue-200 text-xs sm:text-sm font-semibold tracking-wide">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Premier Tuition & Coaching in Sadiqabad</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight leading-tight sm:leading-none text-white">
                {settings.academyName}
              </h1>

              <p className="text-lg sm:text-xl text-blue-100 max-w-2xl font-light leading-relaxed">
                {settings.tagline}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
                <Link
                  to="/admissions"
                  className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-slate-900" />
                  Apply for Admission
                </Link>
                <Link
                  to="/courses"
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-xs transition flex items-center justify-center"
                >
                  View Courses & Fees
                </Link>
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Inquiry
                </a>
              </div>

              {/* Trust badges */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-blue-800/60">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white text-sm">BISE Board</div>
                    <div className="text-xs text-blue-300">Exam Specialists</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white text-sm">Top Faculty</div>
                    <div className="text-xs text-blue-300">10+ Yrs Experience</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white text-sm">95%+ A+</div>
                    <div className="text-xs text-blue-200">Matric & F.Sc Results</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white text-sm">Weekly Tests</div>
                    <div className="text-xs text-blue-300">SMS Reports</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card / Visual */}
            <div className="lg:col-span-5">
              <div className="bg-white/95 text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 backdrop-blur-md space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">
                        Admissions Desk
                      </h3>
                      <p className="text-xs text-slate-500">{settings.city} Main Campus</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Active Session
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Class 9th & 10th (Matric)</span>
                    <span className="font-bold text-blue-700">From PKR 3,500/mo</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">F.Sc Pre-Medical & Pre-Engg</span>
                    <span className="font-bold text-blue-700">From PKR 5,500/mo</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">ICS (Computer & Math)</span>
                    <span className="font-bold text-blue-700">From PKR 4,500/mo</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Spoken English Evening</span>
                    <span className="font-bold text-blue-700">PKR 3,000/mo</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-[#070f1e] to-[#0f2042] border border-blue-900/60 flex items-start gap-3 shadow-md">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-100 leading-snug">
                    <strong className="text-amber-300">Campus Address:</strong> {settings.address}, {settings.city}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to="/admissions"
                    className="flex-1 py-3 bg-[#0f2042] hover:bg-[#172554] text-amber-300 border border-blue-900/60 font-bold rounded-xl text-center text-xs uppercase tracking-wider transition shadow-md"
                  >
                    Register Online
                  </Link>
                  <Link
                    to="/admission-status"
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition flex items-center justify-center"
                  >
                    Track Status
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
                Academic Offerings
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-900 tracking-tight">
                Featured Coaching Classes
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
                Structured according to BISE Bahawalpur syllabus with conceptual lectures, chapter past papers, and mock exams.
              </p>
            </div>
            <Link
              to="/courses"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-blue-700 font-semibold text-sm hover:text-blue-800 transition group"
            >
              <span>Explore All Courses</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#0f2042] text-amber-300 border border-blue-900/50 shadow-xs">
                      {c.classGrade}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {c.duration}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2 leading-snug">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {c.description}
                  </p>
                  <div className="text-xs text-slate-500 space-y-1 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div><strong>Subjects:</strong> {c.subject}</div>
                    <div><strong>Schedule:</strong> {c.schedule}</div>
                    {c.teacherName && <div><strong>Faculty:</strong> {c.teacherName}</div>}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Monthly Tuition</div>
                    <div className="text-base font-black text-blue-800 font-mono">
                      PKR {c.feeMonthly.toLocaleString()}
                    </div>
                  </div>
                  <Link
                    to={`/admissions?course=${encodeURIComponent(c.name)}`}
                    className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About & Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">
                Why Bright Future Coaching Academy
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-900 tracking-tight leading-snug">
                Dedicated to Igniting Every Student's Highest Potential
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                {settings.aboutText}
              </p>
              
              <div className="space-y-3 pt-2">
                {settings.facilities.slice(0, 5).map((facility, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-sm font-medium text-slate-800">{facility}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Link
                  to="/about"
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition"
                >
                  Read More About Us
                </Link>
                <Link
                  to="/teachers"
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition"
                >
                  Meet Our Teachers
                </Link>
              </div>
            </div>

            {/* Facilities Highlight Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#070f1e] via-[#0b1a36] to-[#0f2042] border border-blue-900/60 text-white space-y-2 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  01
                </div>
                <h4 className="font-bold text-white text-base">Board Exam Specialists</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Teachers with 10+ years coaching experience in BISE Bahawalpur board paper presentation techniques.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#070f1e] via-[#0b1a36] to-[#0f2042] border border-blue-900/60 text-white space-y-2 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  02
                </div>
                <h4 className="font-bold text-white text-base">Weekly Mock Testing</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Systematic weekly chapter tests and grand monthly syllabus assessments on official board answer sheets.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  03
                </div>
                <h4 className="font-bold text-slate-900 text-base">SMS Performance Alerts</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time student attendance monitoring, absent alerts, and instant test result reports sent to parents.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  04
                </div>
                <h4 className="font-bold text-slate-900 text-base">Doubt-Clearing Hours</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Special individual mentoring sessions before and after regular lectures to clarify numericals and derivations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Faculty Preview */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
              Our Educators
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-900 tracking-tight">
              Learn From Sadiqabad's Most Qualified Mentors
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Subject experts dedicated to personal academic transformation and conceptual mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 hover:shadow-md transition text-center group"
              >
                <div className="h-48 overflow-hidden bg-slate-100 relative">
                  <img
                    src={t.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                  <div className="absolute bottom-2 left-3 right-3 text-left">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-blue-700 text-white">
                      {t.experience}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-base text-slate-900 leading-snug">
                    {t.name}
                  </h3>
                  <div className="text-xs text-blue-600 font-medium mt-1">
                    {t.qualification}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                    {t.bio}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap justify-center gap-1">
                    {t.subjects?.slice(0, 2).map((s, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/teachers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              View Full Faculty Directory
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Announcements & News Section */}
      {announcements.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
                  Notice Board
                </span>
                <h2 className="text-3xl font-extrabold font-serif text-slate-900 tracking-tight">
                  Latest Announcements & Notices
                </h2>
              </div>
              <Link
                to="/gallery"
                className="mt-3 sm:mt-0 text-blue-700 font-semibold text-sm hover:underline"
              >
                View Notice Board & Gallery →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div>
                    {a.posterUrl && (
                      <div className="h-48 overflow-hidden bg-slate-900 relative">
                        <img
                          src={a.posterUrl}
                          alt={a.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/70 text-amber-300 backdrop-blur-xs">
                          {a.category}
                        </span>
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        {!a.posterUrl && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-[#0f2042] text-amber-300 border border-blue-900/50">
                            {a.category}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(a.date).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mb-2 leading-snug group-hover:text-blue-700 transition">
                        {a.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {a.content}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="pt-3 border-t border-slate-200/60">
                      <Link
                        to={a.actionUrl || "/admissions"}
                        className="text-xs text-blue-700 font-semibold hover:text-blue-800 flex items-center gap-1"
                      >
                        {a.actionText || 'Inquire details'} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Student Achievements & Testimonials */}
      {reviews.length > 0 && (
        <section className="py-20 bg-[#0a1526] text-white border-y border-blue-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">
                Approved Testimonials
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-white tracking-tight">
                What Parents & Students Say
              </h2>
              <p className="text-blue-200 text-sm mt-2">
                Honest feedback from students who achieved their dreams with Bright Future Coaching Academy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-[#0f2042]/90 rounded-2xl p-6 border border-blue-900/60 shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 mb-4 text-amber-300">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < r.rating ? 'fill-amber-300 text-amber-300' : 'text-blue-600'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-blue-100 italic leading-relaxed mb-6">
                      "{r.comment}"
                    </p>
                  </div>
                  <div className="border-t border-blue-700 pt-3">
                    <div className="font-bold text-sm text-white">{r.authorName}</div>
                    <div className="text-xs text-blue-300">{r.roleOrClass}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                to="/reviews"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition"
              >
                Read All Reviews or Submit Yours →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Location, Map & CTA */}
      <section className="py-16 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">
                Visit Our Sadiqabad Campus
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
                Ready to Guarantee Your Academic Success?
              </h2>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                Visit our campus at {settings.address}, {settings.city}. Our academic counselors are available to assess your syllabus needs and offer trial classes.
              </p>
              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 pt-2">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-blue-600" />
                  {settings.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  {settings.officeHours || 'Mon–Sat: 8:00 AM – 8:00 PM'}
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <Link
                to="/admissions"
                className="w-full text-center py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition"
              >
                Apply for Admission Now
              </Link>
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
