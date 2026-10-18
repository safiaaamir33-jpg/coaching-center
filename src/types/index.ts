export interface AcademySettings {
  id?: string;
  academyName: string;
  tagline: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  alternatePhone?: string;
  whatsappNumber: string;
  email: string;
  admissionOpen: boolean;
  admissionBannerTitle: string;
  admissionBannerText: string;
  marqueeAnnouncement?: string;
  aboutText: string;
  missionText: string;
  visionText: string;
  facilities: string[];
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
  currency: string;
  googleMapUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  officeHours?: string;
  chatbotSettings?: ChatbotSettings;
  updatedAt?: string;
}

export interface ChatbotSettings {
  enabled: boolean;
  botName: string;
  botTagline?: string;
  welcomeMessage: string;
  systemPrompt: string;
  tone: 'friendly' | 'academic' | 'professional' | 'islamic_courteous';
  quickQuestions: string[];
  customKnowledge?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  autoOpenDelaySeconds: number;
}

export interface FAQItem {
  id?: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  isPublished: boolean;
  createdAt?: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  name?: string;
  role: 'superadmin' | 'admin';
  createdAt: string;
}

export interface Course {
  id?: string;
  name: string;
  classGrade: string; // e.g. "Class 9", "Matric", "FSc Pre-Medical", "ICS", "Spoken English"
  subject: string; // e.g. "Biology & Chemistry", "Mathematics", "All Subjects"
  description: string;
  schedule: string; // e.g. "Mon-Fri (4:00 PM - 7:00 PM)"
  duration: string; // e.g. "Full Academic Session (9 Months)"
  feeMonthly: number;
  feeAdmission: number;
  teacherName?: string;
  seatsAvailable: number;
  isPublished: boolean;
  featured?: boolean;
  posterUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id?: string;
  studentId: string; // e.g. "BFA-2026-001"
  fullName: string;
  fatherName: string;
  dob?: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  guardianPhone: string;
  address: string;
  currentClass: string;
  enrolledCourses: string[];
  status: 'active' | 'graduated' | 'suspended' | 'left';
  monthlyFee: number;
  discount: number;
  totalPaid: number;
  balance: number;
  enrollmentDate: string;
  email?: string;
  photoUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdmissionApplication {
  id?: string;
  applicationRef: string; // e.g. "ADM-784912"
  fullName: string;
  fatherName: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  phone: string;
  guardianPhone: string;
  address: string;
  previousEducation?: string;
  requestedClass: string;
  previousSchool?: string;
  message?: string;
  photoUrl?: string;
  documentUrl?: string;
  consent: boolean;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  studentId?: string; // Assigned if converted
  reviewerNotes?: string;
  submittedAt: string;
  updatedAt?: string;
}

export interface Teacher {
  id?: string;
  name: string;
  qualification: string;
  experience: string;
  subjects: string[];
  classes: string[];
  phone?: string; // Private
  email?: string; // Private
  salaryMonthly?: number; // Private
  bio: string;
  photoUrl?: string;
  isPublished: boolean;
  status: 'active' | 'on_leave' | 'resigned';
  joiningDate?: string;
  createdAt?: string;
}

export interface FeePayment {
  id?: string;
  paymentId: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  fatherName?: string;
  classGrade: string;
  amount: number;
  feeMonth: string; // e.g. "October 2026"
  paymentType: 'monthly' | 'admission' | 'exam' | 'annual' | 'other';
  paymentMethod: 'cash' | 'bank_transfer' | 'easypaisa' | 'jazzcash' | 'cheque';
  referenceNumber?: string;
  paidBy?: string;
  discountApplied?: number;
  receivedBy?: string;
  notes?: string;
  paidAt: string;
  createdAt?: string;
}

export interface AttendanceRecord {
  id?: string;
  date: string; // YYYY-MM-DD
  classGrade: string;
  records: Record<string, {
    studentId: string;
    studentName: string;
    status: 'present' | 'absent' | 'late' | 'leave';
    remarks?: string;
  }>;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  leaveCount: number;
  recordedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Exam {
  id?: string;
  title: string;
  examType: 'monthly_test' | 'midterm' | 'final' | 'mock_exam' | 'weekly_quiz';
  classGrade: string;
  subject?: string;
  date: string;
  totalMarks: number;
  passingMarks?: number;
  isPublished: boolean;
  createdAt?: string;
}

export interface Result {
  id?: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  fatherName?: string;
  classGrade: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  remarks?: string;
  isPublished: boolean;
  announcedAt?: string;
  createdAt?: string;
}

export interface Announcement {
  id?: string;
  title: string;
  category: 'admission' | 'exam' | 'event' | 'holiday' | 'general';
  classGrade?: string; // e.g. 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'MDCAT / ECAT', 'All Classes'
  content: string;
  posterUrl?: string;
  date: string;
  isImportant?: boolean;
  isPublished: boolean;
  actionText?: string;
  actionUrl?: string;
  createdAt?: string;
}

export interface GalleryItem {
  id?: string;
  title: string;
  category: 'campus' | 'classes' | 'events' | 'achievements';
  imageUrl: string;
  description?: string;
  isPublished: boolean;
  createdAt?: string;
}

export interface Review {
  id?: string;
  authorName: string;
  roleOrClass: string; // e.g. "Parent of Class 10 Student" or "FSc Pre-Medical Topper"
  rating: number; // 1 to 5
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'resolved';
  submittedAt: string;
}

export interface TeacherSalary {
  id?: string;
  teacherId: string;
  teacherName: string;
  month: string; // e.g. "September 2026"
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'easypaisa' | 'jazzcash' | 'cheque';
  reference?: string;
  remarks?: string;
  paidBy?: string;
  paidAt: string;
  createdAt?: string;
}
