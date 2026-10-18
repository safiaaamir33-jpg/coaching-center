import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, Send, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { Review } from '../types';
import { getApprovedReviews, submitReview } from '../services/reviewService';
import { useAcademy } from '../context/AcademyContext';

export const ReviewsPage: React.FC = () => {
  const { settings } = useAcademy();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [roleOrClass, setRoleOrClass] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getApprovedReviews()
      .then(setReviews)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!authorName.trim() || !comment.trim()) {
      setError('Please provide your name and your review feedback.');
      return;
    }

    setSubmitting(true);
    try {
      await submitReview({
        authorName: authorName.trim(),
        roleOrClass: roleOrClass.trim() || 'Student / Parent',
        rating,
        comment: comment.trim(),
      });
      setSubmitted(true);
      setAuthorName('');
      setRoleOrClass('');
      setComment('');
    } catch (err: unknown) {
      console.error('Submit review error:', err);
      setError(err instanceof Error ? err.message : 'Error submitting review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold tracking-wide border border-blue-700/50">
            <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Parent & Student Testimonials</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight">
            Reviews & Feedback
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto font-light">
            Read verified experiences from students and guardians at Bright Future Coaching Academy in Sadiqabad.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200/80 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Approved Testimonials ({reviews.length})
                </h3>
                <p className="text-xs text-slate-500">Moderated by academy administration</p>
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
                No approved reviews yet. Be the first to share your experience!
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{r.authorName}</div>
                        <div className="text-xs text-blue-600 font-medium">{r.roleOrClass}</div>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                      "{r.comment}"
                    </p>
                    <div className="text-[10px] text-slate-400 text-right">
                      Verified Review • Sadiqabad
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Review Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 sticky top-28 space-y-6">
              <div className="border-b pb-4">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-1">
                  Share Your Story
                </span>
                <h3 className="text-xl font-bold font-serif text-slate-900">
                  Submit a Review
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your review will be verified by the admin before appearing publicly.
                </p>
              </div>

              {submitted && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Thank you for your feedback!</strong>
                    <p className="mt-0.5">
                      Your review has been submitted for moderation and will appear on the website once approved by academy staff.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Haji Muhammad Tariq"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Role / Class (Optional)
                  </label>
                  <input
                    type="text"
                    value={roleOrClass}
                    onChange={(e) => setRoleOrClass(e.target.value)}
                    placeholder="e.g. Parent of Class 10 Topper / F.Sc Student"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 ml-2">
                      {rating} out of 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Review / Experience *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe how the faculty, testing routine, and academy environment helped your academic journey in Sadiqabad..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Submitting...' : 'Submit Testimonial'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
