import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Calendar,
  Eye,
  EyeOff,
  Upload,
  CheckCircle2,
  X,
  AlertCircle,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Layers
} from 'lucide-react';
import { Announcement, GalleryItem } from '../../types';
import {
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
  getAllGallery,
  createGalleryItem,
  deleteGalleryItem,
  restoreAllDefaultPosters
} from '../../services/cmsService';
import { uploadImageOrFile } from '../../services/storageService';

export const CMSManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posters' | 'announcements' | 'gallery'>('posters');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Dedicated Poster Modal
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [posterTitle, setPosterTitle] = useState('');
  const [posterCategory, setPosterCategory] = useState<Announcement['category']>('admission');
  const [posterClassGrade, setPosterClassGrade] = useState('All Classes');
  const [selectedPosterClassFilter, setSelectedPosterClassFilter] = useState('All');
  const [posterContent, setPosterContent] = useState('');
  const [posterImageUrl, setPosterImageUrl] = useState('');
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [posterDate, setPosterDate] = useState(new Date().toISOString().split('T')[0]);
  const [posterActionText, setPosterActionText] = useState('Apply for Admission');
  const [posterActionUrl, setPosterActionUrl] = useState('/admissions');

  // General Announcement Modal
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annCategory, setAnnCategory] = useState<Announcement['category']>('admission');
  const [annClassGrade, setAnnClassGrade] = useState('All Classes');
  const [annContent, setAnnContent] = useState('');
  const [annPosterUrl, setAnnPosterUrl] = useState('');
  const [annDate, setAnnDate] = useState(new Date().toISOString().split('T')[0]);
  const [annPublished, setAnnPublished] = useState(true);
  const [annFile, setAnnFile] = useState<File | null>(null);

  // In-App Delete & Restore Confirmations
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  const [galleryToDelete, setGalleryToDelete] = useState<GalleryItem | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [deletingCMS, setDeletingCMS] = useState(false);

  // Quick Poster Class Template Loader
  const applyClassTemplate = (cls: string) => {
    setPosterClassGrade(cls);
    if (cls === 'Class 9') {
      setPosterTitle('Class 9th (Matric Science) Admissions Open 2026–2027');
      setPosterContent('Comprehensive syllabus completion, daily quizzes, chapter-wise MCQs drills, and board pattern practice for 9th grade science students.');
      setPosterActionText('Apply for Class 9');
      setPosterActionUrl('/admissions?class=Class+9');
      setPosterImageUrl('https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1000&q=80');
    } else if (cls === 'Class 10') {
      setPosterTitle('Class 10th (Matric Science) Board Target A+ Revision Series');
      setPosterContent('Target 1050+ marks in BISE Bahawalpur Board exams. Past 5 years board paper solutions, test series, and personalized weak area mentoring.');
      setPosterActionText('Enroll in Class 10');
      setPosterActionUrl('/admissions?class=Class+10');
      setPosterImageUrl('https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80');
    } else if (cls === 'Class 11 (F.Sc)') {
      setPosterTitle('Class 11 / F.Sc Part-1 (Pre-Medical & Pre-Engineering) Admissions Open');
      setPosterContent('Expert college faculty for Physics, Chemistry, Biology and Math. Modern science labs, conceptual diagrams, and numerical sheets.');
      setPosterActionText('Apply for F.Sc Part 1');
      setPosterActionUrl('/admissions?class=Class+11');
      setPosterImageUrl('https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80');
    } else if (cls === 'Class 12 (F.Sc)') {
      setPosterTitle('Class 12 / 2nd Year (F.Sc & ICS) Final Board Crash & Revision Series');
      setPosterContent('90-day comprehensive revision session with daily unit-wise mock assessments, past paper drills, and practical coaching.');
      setPosterActionText('Join 2nd Year Revision');
      setPosterActionUrl('/admissions?class=Class+12');
      setPosterImageUrl('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80');
    } else if (cls === 'Class 11 & 12 (ICS)') {
      setPosterTitle('Class 11 & 12 (ICS) Computer Science & Math Coaching Batch');
      setPosterContent('Practical coding in C/C++, database management, electronics, calculus, and BISE past papers prep by experienced IT lecturers.');
      setPosterActionText('Apply for ICS');
      setPosterActionUrl('/admissions?class=ICS');
      setPosterImageUrl('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80');
    } else if (cls === 'MDCAT / ECAT') {
      setPosterTitle('MDCAT & ECAT 2026 Comprehensive Entry Test Preparation Batch');
      setPosterContent('High-yield MCQs bank, speed-accuracy shortcut techniques, negative-marking practice, and full-length simulated mock exams.');
      setPosterActionText('Register for MDCAT / ECAT');
      setPosterActionUrl('/admissions?class=MDCAT');
      setPosterImageUrl('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80');
    } else if (cls === 'Pre-9th') {
      setPosterTitle('Pre-9th Foundation Batch: Early Start for Top Matric Results');
      setPosterContent('Jumpstart your high school science basics 3 months in advance. Clear concepts of chemistry formulas, physics laws, and algebra.');
      setPosterActionText('Join Pre-9th Batch');
      setPosterActionUrl('/admissions?class=Class+9');
      setPosterImageUrl('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80');
    } else if (cls === 'Class 1–8') {
      setPosterTitle('Junior Wing (Class 1–8) English Medium Conceptual Batch');
      setPosterContent('Spoken English, mathematics tables, arithmetic fundamentals, daily homework guidance, and caring lady tutors.');
      setPosterActionText('Enroll in Junior Wing');
      setPosterActionUrl('/admissions?class=Junior');
      setPosterImageUrl('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=80');
    } else {
      setPosterTitle('Annual Admissions Open 2026–2027 (All Classes)');
      setPosterContent('Morning & Evening Batches for Class 9, 10, F.Sc, and ICS. First 50 students get 20% early bird tuition concession.');
      setPosterActionText('Apply for Admission');
      setPosterActionUrl('/admissions');
      setPosterImageUrl('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80');
    }
  };

  // Gallery Modal
  const [showGalModal, setShowGalModal] = useState(false);
  const [galTitle, setGalTitle] = useState('');
  const [galCategory, setGalCategory] = useState<GalleryItem['category']>('campus');
  const [galDescription, setGalDescription] = useState('');
  const [galImageUrl, setGalImageUrl] = useState('');
  const [galFile, setGalFile] = useState<File | null>(null);

  // Zoom / Preview Modal
  const [previewPoster, setPreviewPoster] = useState<{ title: string; imageUrl: string; content?: string } | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [aList, gList] = await Promise.all([
        getAllAnnouncements(),
        getAllGallery(),
      ]);
      setAnnouncements(aList || []);
      setGallery(gList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const allPosters = announcements.filter((a) => !!a.posterUrl);
  const postersList = allPosters.filter((p) => {
    if (selectedPosterClassFilter === 'All') return true;
    if (!p.classGrade) return selectedPosterClassFilter === 'All';
    return p.classGrade.toLowerCase().includes(selectedPosterClassFilter.toLowerCase());
  });

  const handleSavePoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posterTitle.trim()) {
      setError('Please enter the poster title.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      let finalPoster = posterImageUrl.trim();
      if (posterFile) {
        finalPoster = await uploadImageOrFile(posterFile, 'posters');
      }

      // If no file or image provided, use default academy emblem seamlessly without error
      if (!finalPoster) {
        finalPoster = '/academy_logo.jpg';
      }

      const createdId = await createAnnouncement({
        title: posterTitle.trim(),
        category: posterCategory,
        classGrade: posterClassGrade,
        content: posterContent.trim() || `${posterTitle.trim()} - Official notification from Academy Administration.`,
        posterUrl: finalPoster,
        date: posterDate,
        isPublished: true,
        isImportant: true,
        actionText: posterActionText.trim() || undefined,
        actionUrl: posterActionUrl.trim() || undefined,
      });

      const newPosterObj: Announcement = {
        id: createdId,
        title: posterTitle.trim(),
        category: posterCategory,
        classGrade: posterClassGrade,
        content: posterContent.trim() || `${posterTitle.trim()} - Official notification from Academy Administration.`,
        posterUrl: finalPoster,
        date: posterDate,
        isPublished: true,
        isImportant: true,
        actionText: posterActionText.trim() || undefined,
        actionUrl: posterActionUrl.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      // Optimistically update announcements list immediately
      setAnnouncements((prev) => [newPosterObj, ...prev.filter((p) => p.id !== createdId)]);

      setShowPosterModal(false);
      setPosterTitle('');
      setPosterContent('');
      setPosterImageUrl('');
      setPosterFile(null);
      setPosterPreview(null);
      setSuccessMsg('✓ نیا پوسٹر کامیابی کے ساتھ اپلوڈ اور لائیو ہو گیا ہے! (Poster uploaded & published successfully!)');
      await loadData();
    } catch (err: unknown) {
      console.error('Error saving poster:', err);
      setError(err instanceof Error ? err.message : 'Error creating poster.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      let finalPoster = annPosterUrl.trim();
      if (annFile) {
        finalPoster = await uploadImageOrFile(annFile, 'public');
      }

      await createAnnouncement({
        title: annTitle.trim(),
        category: annCategory,
        classGrade: annClassGrade,
        content: annContent.trim(),
        posterUrl: finalPoster || undefined,
        date: annDate,
        isPublished: annPublished,
        isImportant: true,
      });

      setShowAnnModal(false);
      setAnnTitle('');
      setAnnContent('');
      setAnnPosterUrl('');
      setAnnFile(null);
      setSuccessMsg('Announcement saved successfully without affecting any existing records.');
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating announcement.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galTitle.trim()) return;

    setSaving(true);
    setError(null);
    try {
      let finalUrl = galImageUrl.trim();
      if (galFile) {
        finalUrl = await uploadImageOrFile(galFile, 'public');
      }

      if (!finalUrl) {
        finalUrl = '/academy_logo.jpg';
      }

      await createGalleryItem({
        title: galTitle.trim(),
        category: galCategory,
        imageUrl: finalUrl,
        description: galDescription.trim(),
        isPublished: true,
      });

      setShowGalModal(false);
      setGalTitle('');
      setGalDescription('');
      setGalImageUrl('');
      setGalFile(null);
      setSuccessMsg('Gallery photo added successfully.');
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error adding gallery photo.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteAnnouncement = async () => {
    if (!announcementToDelete?.id) return;
    setDeletingCMS(true);
    try {
      await deleteAnnouncement(announcementToDelete.id);
      setAnnouncementToDelete(null);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingCMS(false);
    }
  };

  const confirmDeleteGallery = async () => {
    if (!galleryToDelete?.id) return;
    setDeletingCMS(true);
    try {
      await deleteGalleryItem(galleryToDelete.id);
      setGalleryToDelete(null);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingCMS(false);
    }
  };

  const confirmRestoreDefaults = async () => {
    setDeletingCMS(true);
    try {
      restoreAllDefaultPosters();
      setShowRestoreModal(false);
      await loadData();
      setSuccessMsg('Default posters restored successfully! All your custom posters are also intact.');
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingCMS(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
            Content & Poster Management
          </span>
          <h1 className="text-2xl font-black font-serif text-slate-900">
            Posters, Notices & Photo Gallery
          </h1>
          <p className="text-xs text-slate-500">
            Add new academy posters, circulars, and test schedules without losing any previously added posters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRestoreModal(true)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Restore missing default posters"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Restore Default Posters</span>
          </button>

          <button
            onClick={() => {
              setError(null);
              setShowPosterModal(true);
            }}
            className="px-4 py-2.5 bg-[#0f2042] hover:bg-[#1a365d] text-amber-300 border border-blue-900/60 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Add New Poster (نیا پوسٹر)</span>
          </button>

          <button
            onClick={() => {
              setError(null);
              setShowAnnModal(true);
            }}
            className="px-3.5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Notice / Circular</span>
          </button>

          <button
            onClick={() => {
              setError(null);
              setShowGalModal(true);
            }}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-300" />
            <span>Gallery Photo</span>
          </button>
        </div>
      </div>

      {/* Success / Error Messages */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900 font-bold text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Persistent Posters Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white border border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="text-xs text-blue-100">
            <strong className="text-amber-300">Permanent Poster Safe-Keeping:</strong> All past and newly added posters are preserved together. Adding new admission or exam posters will never overwrite or erase your older posters.
          </span>
        </div>
        <span className="text-[11px] font-mono text-blue-200 shrink-0">
          Total Posters Active: <strong>{postersList.length}</strong>
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('posters')}
          className={`py-3 px-6 font-bold text-xs uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'posters'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Posters & Banners ({postersList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`py-3 px-6 font-bold text-xs uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'announcements'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>All Notices & Circulars ({announcements.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`py-3 px-6 font-bold text-xs uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'gallery'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Photo Gallery ({gallery.length})</span>
        </button>
      </div>

      {/* Tab 1: Dedicated Posters & Banners Grid */}
      {activeTab === 'posters' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-600">
              Showing active academy posters ({postersList.length} of {allPosters.length} available)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRestoreModal(true)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Restore Default Posters</span>
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setShowPosterModal(true);
                }}
                className="text-xs font-bold bg-[#0f2042] text-amber-300 hover:bg-[#1a365d] border border-blue-900 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Class Poster</span>
              </button>
            </div>
          </div>

          {/* Class-wise Filter Pills (کلاس کے حساب سے فلٹر) */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">Filter by Class (کلاس کے حساب سے فلٹر):</span>
            {(['All', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'MDCAT / ECAT'] as const).map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => setSelectedPosterClassFilter(grade)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedPosterClassFilter === grade
                    ? 'bg-[#0f2042] text-amber-300 shadow-sm border border-blue-900'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {grade === 'All' ? `All Classes (${allPosters.length})` : grade}
              </button>
            ))}
          </div>

          {postersList.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200 space-y-3">
              <ImageIcon className="w-10 h-10 mx-auto text-slate-300" />
              <p>No posters found for {selectedPosterClassFilter}.</p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setShowPosterModal(true)}
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition cursor-pointer"
                >
                  Upload Class Poster
                </button>
                <button
                  onClick={() => setShowRestoreModal(true)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
                >
                  Restore Default Posters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {postersList.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-xs border border-slate-200/90 hover:border-blue-300 transition flex flex-col justify-between group"
                >
                  <div>
                    {/* Poster Image Container */}
                    <div
                      onClick={() => setPreviewPoster({ title: p.title, imageUrl: p.posterUrl!, content: p.content })}
                      className="h-56 overflow-hidden bg-slate-900 relative cursor-pointer"
                    >
                      <img
                        src={p.posterUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                        <span className="text-white text-xs font-semibold flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                          <Eye className="w-3.5 h-3.5 text-amber-300" />
                          <span>Click to Zoom Poster</span>
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0f2042]/90 text-amber-300 backdrop-blur-xs border border-amber-400/30">
                          {p.classGrade || 'All Classes'}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/70 text-slate-200 backdrop-blur-xs border border-white/10">
                          {p.category}
                        </span>
                      </div>
                    </div>

                    {/* Poster Details */}
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {p.date}
                        </span>
                        <span className="text-emerald-700 font-semibold">• Live on Website</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {p.content}
                      </p>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPreviewPoster({ title: p.title, imageUrl: p.posterUrl!, content: p.content })}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Full Size</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnnouncementToDelete(p)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Delete this poster"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: All Announcements List */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {announcements.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No announcements published yet.
              </div>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-slate-50/60 transition">
                  <div className="flex items-start gap-4">
                    {a.posterUrl && (
                      <div
                        onClick={() => setPreviewPoster({ title: a.title, imageUrl: a.posterUrl!, content: a.content })}
                        className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 relative group/img cursor-pointer"
                      >
                        <img src={a.posterUrl} alt={a.title} className="w-full h-full object-cover group-hover/img:scale-105 transition" />
                        <span className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition text-[10px] text-white font-bold">
                          View
                        </span>
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0f2042] text-amber-300 border border-blue-900/50">
                          {a.category}
                        </span>
                        <span className="text-xs text-slate-400">{a.date}</span>
                        <span className="text-xs text-emerald-600 font-semibold">• Published</span>
                        {a.posterUrl && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
                            Poster Attached
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-slate-900">{a.title}</h3>
                      <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">{a.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    {a.posterUrl && (
                      <button
                        onClick={() => setPreviewPoster({ title: a.title, imageUrl: a.posterUrl!, content: a.content })}
                        className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition"
                        title="Preview Poster"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setAnnouncementToDelete(a)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Gallery Grid */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {gallery.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center text-slate-400 text-xs border border-slate-200">
              No gallery images uploaded yet.
            </div>
          ) : (
            gallery.map((g) => (
              <div
                key={g.id}
                className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 overflow-hidden bg-slate-100 relative">
                    <img src={g.imageUrl} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <span className="absolute top-2 right-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-black/60 text-white">
                      {g.category}
                    </span>
                  </div>
                  <div className="p-3.5">
                    <h4 className="font-bold text-slate-900 text-xs truncate">{g.title}</h4>
                    {g.description && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{g.description}</p>
                    )}
                  </div>
                </div>
                <div className="p-3.5 pt-0 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setGalleryToDelete(g)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal 1: Dedicated Add New Poster Modal */}
      {showPosterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-700">Official Publicity</span>
                <h3 className="font-bold text-lg text-slate-900">+ Add New Academy Poster (نیا پوسٹر شامل کریں)</h3>
              </div>
              <button onClick={() => setShowPosterModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Adding this poster will safely add it to your poster gallery. All past posters remain active!</span>
            </div>

            <form onSubmit={handleSavePoster} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Choose Class Preset (کلاس کے حساب سے تیار شدہ فارمیٹ منتخب کریں):</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['All Classes', 'Class 9', 'Class 10', 'Class 11 (F.Sc)', 'Class 12 (F.Sc)', 'MDCAT / ECAT'] as const).map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => applyClassTemplate(cls)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                        posterClassGrade === cls
                          ? 'bg-[#0f2042] text-amber-300 border-blue-900 shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      + {cls}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Poster Title *</label>
                <input
                  type="text"
                  required
                  value={posterTitle}
                  onChange={(e) => setPosterTitle(e.target.value)}
                  placeholder="e.g. Admissions Open 2026–2027 (Matric & F.Sc Coaching)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Class (متعلقہ کلاس) *</label>
                  <select
                    value={posterClassGrade}
                    onChange={(e) => setPosterClassGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  >
                    <option value="All Classes">All Classes (تمام کلاسز)</option>
                    <option value="Class 9">Class 9 (نہم سائنس)</option>
                    <option value="Class 10">Class 10 (دہم سائنس)</option>
                    <option value="Class 11 (F.Sc)">Class 11 (F.Sc Pre-Med & Pre-Eng)</option>
                    <option value="Class 12 (F.Sc)">Class 12 (F.Sc & ICS 2nd Year)</option>
                    <option value="MDCAT / ECAT">MDCAT / ECAT Entry Test</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Poster Category</label>
                  <select
                    value={posterCategory}
                    onChange={(e) => setPosterCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  >
                    <option value="admission">Admissions Open</option>
                    <option value="exam">Board Mock Exam / Tests</option>
                    <option value="event">Award Ceremony / Result</option>
                    <option value="holiday">Holiday Notice</option>
                    <option value="general">General Academy Circular</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notice / Issue Date</label>
                  <input
                    type="date"
                    value={posterDate}
                    onChange={(e) => setPosterDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Poster Image: Upload or Link */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block font-bold text-slate-800 text-xs">
                  Poster Image (تصویر یا فائل اپلوڈ کریں) *
                </label>

                {/* Live Preview Card */}
                {(posterPreview || posterImageUrl) ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500/30 bg-slate-900 h-48 flex items-center justify-center group shadow-sm">
                    <img
                      src={posterPreview || posterImageUrl}
                      alt="Poster Preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPosterFile(null);
                          setPosterPreview(null);
                          setPosterImageUrl('');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black text-white text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Change / Remove</span>
                      </button>
                    </div>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                      {posterFile ? `Selected File: ${posterFile.name}` : 'URL Image'}
                    </span>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center transition bg-white group">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Click to choose poster from device / mobile
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      JPG, PNG, WebP supported (auto-compressed for fast loading)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setPosterFile(file);
                        if (file) {
                          setPosterPreview(URL.createObjectURL(file));
                          setPosterImageUrl('');
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}

                <div className="pt-1 text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-medium">
                  ✓ کسی بیرونی URL کی ضرورت نہیں ہے۔ ڈیوائس سے تصویر منتخب کریں یا نیچے دیے گئے ٹیمپلیٹس میں سے چنیں۔ بغیر تصویر کے بھی براہِ راست شائع ہو جائے گا۔
                </div>

                {/* Preset Poster Images */}
                <div className="pt-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                    Or select pre-made academy poster template:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      {
                        label: 'Admissions 2026–2027',
                        url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
                      },
                      {
                        label: 'Board Mock Exams',
                        url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80',
                      },
                      {
                        label: 'Position Holders',
                        url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80',
                      },
                      {
                        label: 'Science Coaching',
                        url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80',
                      },
                    ].map((tmpl) => (
                      <button
                        key={tmpl.label}
                        type="button"
                        onClick={() => {
                          setPosterImageUrl(tmpl.url);
                          setPosterPreview(tmpl.url);
                          setPosterFile(null);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-[11px] text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        {tmpl.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Poster Description & Notice Text</label>
                <textarea
                  rows={3}
                  value={posterContent}
                  onChange={(e) => setPosterContent(e.target.value)}
                  placeholder="Details for this poster, e.g. Admission discount criteria, schedule, timing, or contact details..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Button Action Text</label>
                  <input
                    type="text"
                    value={posterActionText}
                    onChange={(e) => setPosterActionText(e.target.value)}
                    placeholder="e.g. Apply for Admission"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Button Action Link</label>
                  <input
                    type="text"
                    value={posterActionUrl}
                    onChange={(e) => setPosterActionUrl(e.target.value)}
                    placeholder="/admissions or https://wa.me/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPosterModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#0f2042] hover:bg-[#1a365d] text-amber-300 rounded-xl font-bold border border-blue-900"
                >
                  {saving ? 'Saving Poster...' : 'Publish Poster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: General Announcement Modal */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Publish New Notice / Circular</h3>
              <button onClick={() => setShowAnnModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Schedule for Monthly Diagnostic Board Assessment"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="admission">Admission</option>
                    <option value="exam">Examinations</option>
                    <option value="event">Event / Result</option>
                    <option value="holiday">Holiday</option>
                    <option value="general">General Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notice Date</label>
                  <input
                    type="date"
                    value={annDate}
                    onChange={(e) => setAnnDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Announcement Body *</label>
                <textarea
                  required
                  rows={4}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Full text of the announcement..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Optional Poster Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAnnFile(e.target.files?.[0] || null)}
                  className="w-full text-slate-500 text-xs"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold"
                >
                  {saving ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Gallery Modal */}
      {showGalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Upload Gallery Image</h3>
              <button onClick={() => setShowGalModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGallery} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  value={galTitle}
                  onChange={(e) => setGalTitle(e.target.value)}
                  placeholder="e.g. Science Lab Demonstration"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={galCategory}
                    onChange={(e) => setGalCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="campus">Campus & Facilities</option>
                    <option value="classes">Classroom Sessions</option>
                    <option value="events">Events & Meetings</option>
                    <option value="achievements">Awards & Honors</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Upload Photo File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setGalFile(e.target.files?.[0] || null)}
                    className="w-full text-slate-500 text-xs"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                تصویر منتخب کریں یا براہِ راست محفوظ کریں۔ کسی بیرونی URL کی ضرورت نہیں ہے۔
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={galDescription}
                  onChange={(e) => setGalDescription(e.target.value)}
                  placeholder="Brief caption..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGalModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold"
                >
                  {saving ? 'Uploading...' : 'Save Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Full Poster Zoom / Lightbox Modal */}
      {previewPoster && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewPoster(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm truncate">{previewPoster.title}</h3>
              <button
                onClick={() => setPreviewPoster(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto p-4 bg-slate-950 flex items-center justify-center max-h-[70vh]">
              <img
                src={previewPoster.imageUrl}
                alt={previewPoster.title}
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>
            {previewPoster.content && (
              <div className="p-4 bg-white text-xs text-slate-700 leading-relaxed border-t border-slate-200">
                <p>{previewPoster.content}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* In-App Delete Announcement / Poster Confirmation Modal */}
      {announcementToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Delete Poster / Notice?</h3>
                <p className="text-xs text-slate-500">Remove this public announcement.</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              Are you sure you want to permanently delete <strong>{announcementToDelete.title}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAnnouncementToDelete(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingCMS}
                onClick={confirmDeleteAnnouncement}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                {deletingCMS ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Delete Gallery Photo Confirmation Modal */}
      {galleryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Delete Photo?</h3>
                <p className="text-xs text-slate-500">Remove image from academy photo gallery.</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              Are you sure you want to delete <strong>{galleryToDelete.title}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setGalleryToDelete(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingCMS}
                onClick={confirmDeleteGallery}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                {deletingCMS ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Restore Defaults Confirmation Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-blue-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-blue-700">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Restore Default Posters?</h3>
                <p className="text-xs text-slate-500">Admissions, Mock Tests & Position Holders</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              This will restore all default academy flyers and posters for all classes (Class 9, 10, 11, 12, MDCAT). Any posters you personally created will remain safe.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingCMS}
                onClick={confirmRestoreDefaults}
                className="px-3.5 py-1.5 bg-[#0f2042] hover:bg-[#1a365d] text-amber-300 border border-blue-900 rounded-lg text-xs font-bold cursor-pointer shadow-xs"
              >
                {deletingCMS ? 'Restoring...' : 'Restore Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
