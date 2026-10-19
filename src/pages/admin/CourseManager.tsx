import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Course } from '../../types';
import {
  getAllCourses,
  addCourse,
  updateCourse,
  deleteCourse
} from '../../services/courseService';

export const CourseManager: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form
  const [name, setName] = useState('');
  const [classGrade, setClassGrade] = useState('Class 9');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState('');
  const [duration, setDuration] = useState('Full Session (9 Months)');
  const [feeMonthly, setFeeMonthly] = useState(3500);
  const [feeAdmission, setFeeAdmission] = useState(1000);
  const [teacherName, setTeacherName] = useState('');
  const [seatsAvailable, setSeatsAvailable] = useState(30);
  const [isPublished, setIsPublished] = useState(true);
  const [featured, setFeatured] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await getAllCourses();
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setError(null);
    setEditingCourse(null);
    setName('');
    setClassGrade('Class 9');
    setSubject('');
    setDescription('');
    setSchedule('Monday – Friday (3:30 PM – 6:30 PM)');
    setDuration('Full Session (9 Months)');
    setFeeMonthly(3500);
    setFeeAdmission(1000);
    setTeacherName('');
    setSeatsAvailable(30);
    setIsPublished(true);
    setFeatured(false);
    setShowModal(true);
  };

  const handleOpenEdit = (c: Course) => {
    setError(null);
    setEditingCourse(c);
    setName(c.name);
    setClassGrade(c.classGrade);
    setSubject(c.subject);
    setDescription(c.description);
    setSchedule(c.schedule);
    setDuration(c.duration);
    setFeeMonthly(c.feeMonthly);
    setFeeAdmission(c.feeAdmission);
    setTeacherName(c.teacherName || '');
    setSeatsAvailable(c.seatsAvailable);
    setIsPublished(c.isPublished);
    setFeatured(c.featured || false);
    setShowModal(true);
  };

  const handleTogglePublish = async (c: Course) => {
    if (!c.id) return;
    try {
      await updateCourse(c.id, { isPublished: !c.isPublished });
      await loadCourses();
    } catch (err) {
      console.error(err);
    }
  };

  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!courseToDelete?.id) return;
    const target = courseToDelete;
    setDeleting(true);
    try {
      setCourses((prev) => prev.filter((c) => c.id !== target.id && c.name !== target.name));
      await deleteCourse(target.id!);
      setCourseToDelete(null);
      await loadCourses();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !classGrade.trim() || !feeMonthly) {
      setError('Course name, grade, and monthly fee are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        classGrade: classGrade.trim(),
        subject: subject.trim(),
        description: description.trim(),
        schedule: schedule.trim(),
        duration: duration.trim(),
        feeMonthly: Number(feeMonthly),
        feeAdmission: Number(feeAdmission),
        teacherName: teacherName.trim(),
        seatsAvailable: Number(seatsAvailable),
        isPublished,
        featured,
      };

      if (editingCourse && editingCourse.id) {
        await updateCourse(editingCourse.id, payload);
      } else {
        await addCourse(payload);
      }
      setShowModal(false);
      await loadCourses();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving course.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
            Academic Programs
          </span>
          <h1 className="text-2xl font-black font-serif text-slate-900">
            Course & Class Management
          </h1>
          <p className="text-xs text-slate-500">
            Configure tuition batches, board revision modules, class fees, and published offerings.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Course
        </button>
      </div>

      {/* Courses List Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Course Name & Subject</th>
                <th className="py-3 px-4">Class Grade</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Monthly Fee</th>
                <th className="py-3 px-4">Seats</th>
                <th className="py-3 px-4">Visibility</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading courses...
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No courses configured yet.
                  </td>
                </tr>
              ) : (
                courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                      <div className="text-[11px] text-slate-500">{c.subject}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-900">
                      {c.classGrade}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{c.schedule}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                      PKR {c.feeMonthly?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{c.seatsAvailable}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleTogglePublish(c)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition cursor-pointer ${
                          c.isPublished
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {c.isPublished ? (
                          <>
                            <Eye className="w-3 h-3" /> Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Draft
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCourseToDelete(c)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-bold text-lg text-slate-900">
                {editingCourse ? 'Edit Course Offering' : 'Create New Course Offering'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Class 10th (Matric Science Board Prep)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Class / Grade *</label>
                  <input
                    type="text"
                    required
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    placeholder="e.g. Class 9, Class 10, F.Sc Part-1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subjects Covered</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Physics, Chemistry, Biology, Math"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Syllabus coverage, test session frequency, and target board..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Timings / Schedule</label>
                  <input
                    type="text"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    placeholder="e.g. Monday – Friday (4:00 PM – 7:00 PM)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. Full Session (9 Months)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Tuition Fee (PKR) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={feeMonthly}
                    onChange={(e) => setFeeMonthly(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Admission Registration Fee (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={feeAdmission}
                    onChange={(e) => setFeeAdmission(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lead Instructor Name</label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="e.g. Prof. Naveed & Team"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Available Seats</label>
                  <input
                    type="number"
                    value={seatsAvailable}
                    onChange={(e) => setSeatsAvailable(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300"
                  />
                  <span className="font-semibold text-slate-700">Publish on Public Website</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300"
                  />
                  <span className="font-semibold text-slate-700">Feature on Home Page</span>
                </label>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white rounded-xl font-bold"
                >
                  {saving ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-rose-100">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Delete Course?</h3>
                <p className="text-xs text-slate-500">This action will remove the course offering.</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Are you sure you want to delete <strong>{courseToDelete.name}</strong> ({courseToDelete.classGrade})?
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-lg text-xs font-semibold"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
