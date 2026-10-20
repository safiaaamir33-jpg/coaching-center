import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { AcademySettings } from '../types';

export const DEFAULT_ACADEMY_SETTINGS: AcademySettings = {
  id: 'default',
  academyName: 'Bright Future Coaching Academy',
  tagline: 'Empowering Students for Academic Excellence & Board Exam Success',
  address: 'Main Kacha Sadiqabad Road, Near Model Town, Sadiqabad, District Rahim Yar Khan',
  city: 'Sadiqabad',
  province: 'Punjab, Pakistan',
  phone: '+92 300 1234567',
  alternatePhone: '+92 68 5701234',
  whatsappNumber: '+923001234567',
  email: 'info@brightfutureacademy.edu.pk',
  admissionOpen: true,
  admissionBannerTitle: 'Admissions Open for Session 2026–2027!',
  admissionBannerText: 'Morning & Evening Coaching for Class 1 to 12, Matric & F.Sc (Pre-Medical / Pre-Engg / ICS). Limited seats available.',
  marqueeAnnouncement: '🎯 New batches for Class 9th, 10th & F.Sc starting soon in Sadiqabad! Register today for special fee discount.',
  aboutText: 'Bright Future Coaching Academy is Sadiqabad\'s premier tuition and coaching institution. We are dedicated to providing conceptual clarity, structured test sessions, and top-tier faculty mentoring for school and intermediate board students.',
  missionText: 'To deliver high-impact coaching and rigorous exam preparation that enables students in Sadiqabad to excel in BISE Bahawalpur examinations and competitive medical & engineering entrance exams.',
  visionText: 'To be the benchmark of educational excellence in Southern Punjab, inspiring students with strong ethics, critical thinking, and outstanding academic achievements.',
  facilities: [
    'Air-Conditioned & Well-Lit Modern Classrooms',
    'Experienced Board Specialist Faculty',
    'Weekly Chapter-Wise Assessments & Grand Tests',
    'Detailed Student Progress Reports & SMS Alerts',
    'Special Doubt Clearing & Problem Solving Hours',
    'Complete Past Papers & Guess Papers Analysis',
    'Standby Solar / Generator Backup System',
    'Separate Batches for Boys and Girls'
  ],
  primaryColor: '#0f2042',
  accentColor: '#f59e0b',
  logoUrl: '/academy_logo.jpg',
  currency: 'PKR',
  officeHours: 'Monday – Saturday: 8:00 AM – 8:00 PM | Sunday: 9:00 AM – 2:00 PM (Tests Only)',
  facebookUrl: 'https://facebook.com',
  youtubeUrl: 'https://youtube.com',
  instagramUrl: 'https://instagram.com',
  googleMapUrl: 'https://maps.google.com/?q=Sadiqabad+Punjab+Pakistan',
  chatbotSettings: {
    enabled: true,
    botName: 'Bright Future AI Counselor',
    botTagline: '24/7 Virtual Admissions Desk',
    welcomeMessage: 'Assalam-o-Alaikum! Welcome to Bright Future Coaching Academy (Sadiqabad). How can I assist you with admissions, fees, class schedules, or test sessions today?',
    systemPrompt: 'You are the official 24/7 Virtual Counselor for Bright Future Coaching Academy located in Sadiqabad, District Rahim Yar Khan, Punjab. You guide students and parents about admissions for Class 9, 10, 11 (F.Sc Pre-Med, Pre-Engg, ICS), 12, fee concessions, timings, and campus facilities. Always answer politely in English, Urdu, or Roman Urdu depending on the user query. Never disclose administrative passwords or confidential keys.',
    tone: 'islamic_courteous',
    quickQuestions: [
      'Admissions 2026 Process',
      'Monthly Fee Structure',
      'Class 9 & 10 Batches',
      'F.Sc (Pre-Med & Pre-Engg)',
      'Campus Location & Timings',
      'Scholarships & Concessions'
    ],
    customKnowledge: 'Campus is located near Model Town, Main Kacha Sadiqabad Road. Morning shift for girls starts at 8:00 AM, Evening shift for boys starts at 3:30 PM. Weekly Sunday grand test sessions are conducted for board preparation.',
    autoOpenDelaySeconds: 0
  }
};

const DOC_PATH = 'academySettings';
const LOCAL_SETTINGS_KEY = 'bfa_academy_settings';

function getLocalSettings(): AcademySettings | null {
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalSettings(settings: AcademySettings) {
  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bfa_settings_changed', { detail: settings }));
    }
  } catch {
    // ignore
  }
}

export async function getAcademySettings(): Promise<AcademySettings> {
  const local = getLocalSettings();
  try {
    const docRef = doc(db, DOC_PATH, 'default');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as AcademySettings;
      const merged: AcademySettings = {
        id: snap.id,
        ...DEFAULT_ACADEMY_SETTINGS,
        ...(local || {}),
        ...data,
        logoUrl: data.logoUrl || local?.logoUrl || DEFAULT_ACADEMY_SETTINGS.logoUrl,
      };
      saveLocalSettings(merged);
      return merged;
    }
    if (local) return { ...DEFAULT_ACADEMY_SETTINGS, ...local };
    return DEFAULT_ACADEMY_SETTINGS;
  } catch (error) {
    console.warn('Error fetching academy settings from Firestore (quota limit or offline), using cached/defaults:', error);
    if (local) return { ...DEFAULT_ACADEMY_SETTINGS, ...local };
    return DEFAULT_ACADEMY_SETTINGS;
  }
}

export async function updateAcademySettings(settings: Partial<AcademySettings>): Promise<void> {
  const current = getLocalSettings() || DEFAULT_ACADEMY_SETTINGS;
  const merged: AcademySettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  // 1. Save to local storage IMMEDIATELY so the user's changes take effect right away!
  saveLocalSettings(merged);

  // 2. Try saving to Firestore via setDoc with merge: true (does NOT do a pre-read!)
  try {
    const docRef = doc(db, DOC_PATH, 'default');
    await setDoc(docRef, merged, { merge: true });
  } catch (error: unknown) {
    console.warn('Firestore write failed (likely quota limit), settings retained in local cache:', error);
    const msg = error instanceof Error ? error.message : String(error);
    // If it's a quota error, do not throw a blocking fatal error; local copy is successfully saved!
    if (msg.includes('Quota limit exceeded') || msg.includes('quota') || msg.includes('Free daily read units')) {
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, `${DOC_PATH}/default`);
  }
}
