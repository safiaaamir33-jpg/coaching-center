import React, { useEffect, useState } from 'react';
import { Users, GraduationCap, Award, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { Teacher } from '../types';
import { getPublishedTeachers } from '../services/teacherService';
import { useAcademy } from '../context/AcademyContext';

export const TeachersPage: React.FC = () => {
  const { settings } = useAcademy();
  const [teachers, setTeachers] = useState<Omit<Teacher, 'salaryMonthly' | 'phone' | 'email'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedTeachers()
      .then(setTeachers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold tracking-wide border border-blue-700/50">
            <Users className="w-3.5 h-3.5 text-amber-300" />
            <span>Academic Faculty & Mentors</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight">
            Our Distinguished Teachers
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto font-light">
            Experienced board examiners and subject specialists committed to your academic excellence in Sadiqabad.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading faculty profiles...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <div className="h-60 overflow-hidden bg-slate-100 relative">
                    <img
                      src={t.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 left-4 right-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-700 text-white shadow-xs">
                        {t.experience}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-xl text-slate-900 leading-snug">
                      {t.name}
                    </h3>
                    <div className="text-xs font-semibold text-blue-700 flex items-center gap-1.5 mt-1">
                      <GraduationCap className="w-4 h-4 shrink-0" />
                      <span>{t.qualification}</span>
                    </div>

                    <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                      {t.bio}
                    </p>

                    <div className="mt-5 space-y-2 pt-4 border-t border-slate-100 text-xs">
                      <div>
                        <strong className="text-slate-800">Assigned Subjects:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {t.subjects?.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full bg-[#0f2042] text-amber-300 border border-blue-900/50 font-medium text-[11px]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {t.classes && t.classes.length > 0 && (
                        <div>
                          <strong className="text-slate-800">Target Classes:</strong>
                          <div className="text-slate-600 mt-0.5">
                            {t.classes.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified Faculty
                    </span>
                    <span className="font-semibold text-blue-700">{settings.city} Campus</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
