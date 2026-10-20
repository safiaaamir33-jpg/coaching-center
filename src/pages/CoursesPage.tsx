import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  GraduationCap,
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { Course } from '../types';
import { getPublishedCourses } from '../services/courseService';
import { useAcademy } from '../context/AcademyContext';

export const CoursesPage: React.FC = () => {
  const { settings } = useAcademy();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchCourses = () => {
    getPublishedCourses()
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
    const handleCoursesChanged = () => fetchCourses();
    window.addEventListener('bfa_courses_changed', handleCoursesChanged);
    return () => window.removeEventListener('bfa_courses_changed', handleCoursesChanged);
  }, []);

  // Dynamically derive categories from all available courses so admin's custom courses get their own category
  const categories = React.useMemo(() => {
    const set = new Set<string>(['All']);
    courses.forEach((c) => {
      if (c.classGrade?.trim()) {
        set.add(c.classGrade.trim());
      }
    });
    return Array.from(set);
  }, [courses]);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.classGrade.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade =
      selectedGrade === 'All' ||
      c.classGrade.trim().toLowerCase() === selectedGrade.trim().toLowerCase() ||
      c.classGrade.toLowerCase().includes(selectedGrade.toLowerCase());

    return matchesSearch && matchesGrade;
  });

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold tracking-wide border border-blue-700/50">
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>Academic Syllabus & Fee Structure</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight">
            Courses & Classes
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto font-light">
            Morning and evening coaching programs for school and intermediate board students in Sadiqabad.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Search and Filters Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200/80 mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by course name, subject, or class (e.g. Matric, F.Sc, Physics)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedGrade(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                  selectedGrade === cat
                    ? 'bg-blue-700 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading published courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-lg">No courses found matching your criteria</h3>
            <p className="text-xs text-slate-500">Try adjusting your search terms or filter selection.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedGrade('All');
              }}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#0f2042] text-amber-300 border border-blue-900/50">
                      {c.classGrade}
                    </span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {c.duration}
                    </span>
                  </div>

                  <h3 className="font-bold text-xl text-slate-900 mb-2 leading-snug">
                    {c.name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-6">
                    <div>
                      <strong className="text-slate-800">Key Subjects:</strong> {c.subject}
                    </div>
                    <div>
                      <strong className="text-slate-800">Class Timings:</strong> {c.schedule}
                    </div>
                    {c.teacherName && (
                      <div>
                        <strong className="text-slate-800">Instructor:</strong> {c.teacherName}
                      </div>
                    )}
                    <div>
                      <strong className="text-slate-800">Admission Fee:</strong> PKR {c.feeAdmission?.toLocaleString() || '1,000'} (One-time)
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Monthly Tuition</div>
                    <div className="text-xl font-black text-blue-800 font-mono">
                      PKR {c.feeMonthly.toLocaleString()}
                    </div>
                  </div>
                  <Link
                    to={`/admissions?course=${encodeURIComponent(c.name)}`}
                    className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-1"
                  >
                    Apply Now
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
