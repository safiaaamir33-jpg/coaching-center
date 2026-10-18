import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Calendar, Filter, Sparkles, X } from 'lucide-react';
import { GalleryItem, Announcement } from '../types';
import { getPublishedGallery, getPublishedAnnouncements } from '../services/cmsService';
import { useAcademy } from '../context/AcademyContext';

export const GalleryPage: React.FC = () => {
  const { settings } = useAcademy();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedCat, setSelectedCat] = useState<'all' | 'campus' | 'classes' | 'events' | 'achievements'>('all');
  const [previewImage, setPreviewImage] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPublishedGallery(), getPublishedAnnouncements()])
      .then(([g, a]) => {
        setGallery(g);
        setAnnouncements(a);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredGallery = gallery.filter((item) => {
    if (selectedCat === 'all') return true;
    return item.category === selectedCat;
  });

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold tracking-wide border border-blue-700/50">
            <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
            <span>Campus Life & Events</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight">
            Gallery & Announcements
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto font-light">
            Highlights from student achievement celebrations, science lab sessions, and official academy notices in Sadiqabad.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 space-y-12">
        {/* Gallery Controls */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200/80 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-slate-500 uppercase mr-1">Category:</span>
            {[
              { id: 'all', label: 'All Photos' },
              { id: 'campus', label: 'Campus & Facilities' },
              { id: 'classes', label: 'Classroom Sessions' },
              { id: 'events', label: 'Events & Meetings' },
              { id: 'achievements', label: 'Awards & Honors' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                  selectedCat === cat.id
                    ? 'bg-blue-700 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Showing {filteredGallery.length} photos
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              onClick={() => setPreviewImage(item)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 hover:shadow-lg transition cursor-pointer group flex flex-col justify-between"
            >
              <div className="h-64 overflow-hidden bg-slate-100 relative">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-200 flex items-end p-4">
                  <span className="text-white text-xs font-semibold">Click to preview</span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider bg-black/60 text-white backdrop-blur-xs">
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Announcements Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200 space-y-6">
          <div className="border-b pb-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-1">
              Official Bulletin
            </span>
            <h2 className="text-2xl font-bold font-serif text-slate-900">
              Announcements & Examination Circulars
            </h2>
          </div>

          <div className="space-y-4">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0f2042] text-amber-300 border border-blue-900/50">
                      {a.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(a.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{a.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {a.content}
                  </p>
                </div>
                {a.posterUrl && (
                  <div
                    onClick={() => setPreviewImage({ id: a.id || 'poster', title: a.title, imageUrl: a.posterUrl!, category: 'campus', description: a.content, isPublished: true })}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0 border border-slate-200 cursor-pointer group/poster relative shadow-2xs"
                    title="Click to zoom poster"
                  >
                    <img src={a.posterUrl} alt={a.title} className="w-full h-full object-cover group-hover/poster:scale-105 transition duration-200" />
                    <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-bold opacity-0 group-hover/poster:opacity-100 transition">
                      Zoom Poster
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={previewImage.imageUrl}
                alt={previewImage.title}
                className="w-full max-h-[70vh] object-contain bg-slate-950"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                {previewImage.category}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{previewImage.title}</h3>
              {previewImage.description && (
                <p className="text-xs text-slate-600 mt-2">{previewImage.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
