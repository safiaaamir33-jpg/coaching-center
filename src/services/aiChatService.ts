import { AcademySettings, Course } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  thinking?: string;
  timestamp: string;
}

export interface ChatbotContext {
  settings: AcademySettings;
  courses: Course[];
}

export async function askAcademyAssistant(
  question: string,
  context: ChatbotContext,
  history: ChatMessage[] = []
): Promise<{ text: string; thinking?: string }> {
  const trimmed = question.trim();
  if (!trimmed) {
    return {
      text: 'Please ask a question about our admissions, fee structure, classes, timings, or location in Sadiqabad.'
    };
  }

  // 1. First attempt to call full-stack backend running Gemini AI
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: trimmed,
        context: {
          academyName: context.settings.academyName,
          address: context.settings.address,
          city: context.settings.city,
          phone: context.settings.phone,
          whatsapp: context.settings.whatsappNumber,
          email: context.settings.email,
          admissionOpen: context.settings.admissionOpen,
          officeHours: context.settings.officeHours,
          courses: context.courses.map((c) => ({
            name: c.name,
            classGrade: c.classGrade,
            subject: c.subject,
            schedule: c.schedule,
            monthlyFee: `${c.feeMonthly}`,
            admissionFee: `${c.feeAdmission}`,
            duration: c.duration,
          })),
        },
        history: history.slice(-6).map((m) => ({
          sender: m.sender,
          text: m.text,
        })),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.text) {
        return {
          text: data.text,
          thinking: data.thinking || 'Understood query in real-time context and formulated detailed response.',
        };
      }
    }
  } catch (err) {
    console.warn('Backend Gemini API call fallback to smart local engine:', err);
  }

  // 2. Intelligent, dynamic, multi-lingual local engine with variety
  return generateDynamicLocalResponse(trimmed, context, history);
}

// Memory to avoid repeating identical responses in a single chat session
let lastTopicIndex: { [key: string]: number } = {};

function pickVariation(key: string, variations: string[]): string {
  const current = lastTopicIndex[key] ?? -1;
  const next = (current + 1) % variations.length;
  lastTopicIndex[key] = next;
  return variations[next];
}

function generateDynamicLocalResponse(
  query: string,
  context: ChatbotContext,
  history: ChatMessage[] = []
): { text: string; thinking?: string } {
  const q = query.toLowerCase().trim();
  const { settings, courses } = context;

  // Strict Security & Password Guard: NEVER show or guess admin passwords!
  if (
    q.includes('password') ||
    q.includes('admin login') ||
    q.includes('credentials') ||
    q.includes('secret') ||
    q.includes('passcode') ||
    q.includes('login password') ||
    q.includes('admin account') ||
    q.includes('database key') ||
    q.includes('safia')
  ) {
    return {
      thinking: 'Security shield activated: Protected credentials and internal administrative records.',
      text: pickVariation('security', [
        `🔒 **Security Notice:** Administrative credentials and passwords are strictly protected and confidential. Client accounts and public visitors cannot view internal administrative access details. If you need administrative assistance, please contact the academy office in person at **${settings.address}**.`,
        `🛡️ **Confidential Data:** Passwords and system credentials are encrypted and never disclosed. For any official staff inquiries, please meet the management at our Sadiqabad campus reception.`,
      ]),
    };
  }

  // Greetings & Courtesies (English, Urdu, Roman Urdu)
  if (
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q.includes('salam') ||
    q.includes('assalam') ||
    q.includes('kese ho') ||
    q.includes('kaisay ho') ||
    q.includes('kya hal hai') ||
    q.includes('kia haal') ||
    q.includes('good morning') ||
    q.includes('good evening')
  ) {
    const isUrdu = q.includes('salam') || q.includes('kese') || q.includes('kya hal') || q.includes('kia');
    if (isUrdu) {
      return {
        thinking: 'Engaging user warmly in Roman Urdu/Urdu conversation.',
        text: pickVariation('greeting_urdu', [
          `وعلیکم السلام! خوش آمدید **${settings.academyName}** صادق آباد کے آن لائن ہیلپ ڈیسک پر۔ میں آپ کی کیسے مدد کر سکتا ہوں؟ آپ مجھ سے کلاسز، فیس، داخلہ، اور اوقات کے بارے میں کچھ بھی پوچھ سکتے ہیں۔`,
          `Walaikum Assalam! Khush Aamdeed! 🌸 Bright Future Coaching Academy Sadiqabad me aap ka swagat hai. Main aap ko dakhlay, monthly fees, subjects, aur batches ki mukammal maloomat faraham kar sakta hun. Aap kis class ke baray me jan-na chahtay hain?`,
          `Walaikum Assalam! Alhamdulillah hum theek hain. Aap ko Bright Future Academy Sadiqabad ke hawalay se kya maloomat chahiye? Fees, courses ya dakhla form?`,
        ]),
      };
    } else {
      return {
        thinking: 'Greeting visitor warmly in English with interactive prompt.',
        text: pickVariation('greeting_en', [
          `Hello and welcome to **${settings.academyName}** (Sadiqabad)! 🎓 How can I assist you with your studies or admissions today?`,
          `Welcome! Great to have you here. Are you looking for information regarding Matric, Intermediate (F.Sc/ICS), Primary tuition, or our fee packages?`,
          `Greetings from ${settings.academyName}! Our admissions desk is at your service. Feel free to ask any question regarding admissions, subjects, or timings!`,
        ]),
      };
    }
  }

  // Fee Inquiries (English, Urdu, Roman Urdu)
  if (
    q.includes('fee') ||
    q.includes('fees') ||
    q.includes('charges') ||
    q.includes('cost') ||
    q.includes('price') ||
    q.includes('dues') ||
    q.includes('pkr') ||
    q.includes('rupaye') ||
    q.includes('kharcha') ||
    q.includes('kitne paise') ||
    q.includes('discount') ||
    q.includes('riayat') ||
    q.includes('concession')
  ) {
    const formatted = courses
      .map(
        (c) =>
          `• **${c.name}** (${c.classGrade}): Monthly **PKR ${c.feeMonthly.toLocaleString()}** (Admission Fee: PKR ${c.feeAdmission.toLocaleString()})`
      )
      .join('\n');

    const isUrdu = q.includes('kitne') || q.includes('kharcha') || q.includes('riayat') || q.includes('paise');
    if (isUrdu) {
      return {
        thinking: 'Calculating fee schedule with concession and installment criteria for Sadiqabad campus.',
        text: pickVariation('fee_urdu', [
          `ہمارے پاس تمام کلاسز کی فیسیں نہایت مناسب ہیں:\n\n${formatted}\n\n💡 **خاص رعایت:** مستحق اور پوزیشن ہولڈر طلبہ کے لیے فیس میں خصوصی ڈسکاؤنٹ اور بھائی/بہن (Sibling) رعایت بھی دی جاتی ہے۔ دفتر میں آ کر پرنسپل صاحب سے ملاقات کی جا سکتی ہے۔`,
          `**${settings.academyName}** ki monthly fee structure mandarja zail hai:\n\n${formatted}\n\n✨ **Installment & Discount:** Agar aap do ya ziyada behn bhai hain to khas fee discount dastiyab hai. Mazeed maloomat ke liye humare campus **${settings.address}** tashreef layein ya WhatsApp par rabta karein: **${settings.whatsappNumber}**.`,
        ]),
      };
    }

    return {
      thinking: 'Compiling structured tuition fee schedule by grade and subject.',
      text: pickVariation('fee_en', [
        `Here is the official published fee breakdown for **${settings.academyName}**:\n\n${formatted}\n\n📌 *Scholarships & Concessions:* We offer merit-based scholarships for position holders and sibling discounts for families enrolling multiple children.`,
        `Our current tuition fees are transparent and affordable for Sadiqabad students:\n\n${formatted}\n\n✅ Fees can be submitted monthly at the academy accounts desk with an official computer-generated receipt voucher.`,
      ]),
    };
  }

  // Admissions & Application (English & Roman Urdu)
  if (
    q.includes('admiss') ||
    q.includes('dakhla') ||
    q.includes('apply') ||
    q.includes('register') ||
    q.includes('enroll') ||
    q.includes('form') ||
    q.includes('kese lein') ||
    q.includes('last date') ||
    q.includes('dakhlay')
  ) {
    const statusText = settings.admissionOpen ? 'OPEN (جاری ہیں)' : 'Limited Seats Available';
    return {
      thinking: 'Assessing admission eligibility, online application flow, and Sadiqabad intake schedule.',
      text: pickVariation('admissions', [
        `🎉 **New Batch Admissions are ${statusText}!**\n\nآپ گھر بیٹھے با آسانی **Online Admission** فارم فل کر سکتے ہیں:\n1. ویب سائٹ کے اوپر موجود **"Admissions"** بٹن پر کلک کریں۔\n2. طالب علم اور والد/سرپرست کی بنیادی تفصیلات درج کریں۔\n3. کلاس منتخب کریں (9th, 10th, F.Sc, ICS یا Junior Classes)۔\n4. فارم جمع کروانے پر آپ کو ریفرنس نمبر (مثلاً **ADM-XXXXXX**) ملے گا جس سے آپ کبھی بھی سٹیٹس دیکھ سکتے ہیں۔\n\nبراہ راست کیمپس میں آ کر بھی داخلہ فارم حاصل کیا جا سکتا ہے: **${settings.address}**۔`,
        `Admissions at **${settings.academyName}** are actively underway!\n\nYou can submit an online application right away on our **Admissions** page. Simply fill in the student credentials, choose your intended grade and subjects, and click Submit. Your unique tracking code will be generated instantly.\n\nPrefer in-person admission? Visit our office Monday through Saturday between **${settings.officeHours || '8:00 AM – 8:00 PM'}**!`,
      ]),
    };
  }

  // Timings & Shifts
  if (
    q.includes('timing') ||
    q.includes('time') ||
    q.includes('schedule') ||
    q.includes('shift') ||
    q.includes('kab') ||
    q.includes('waqt') ||
    q.includes('auqat') ||
    q.includes('hours')
  ) {
    return {
      thinking: 'Reviewing current academy shift timings and office hours.',
      text: pickVariation('timings', [
        `🕒 **Academy Classes & Shifts Timings (Sadiqabad):**\n\n• **Junior Tuition (Classes 1–8):** 02:30 PM تا 04:30 PM\n• **Matriculation (9th & 10th Science/Arts):** 03:30 PM تا 06:30 PM\n• **Intermediate (F.Sc Pre-Med, Pre-Engg & ICS):** 04:00 PM تا 07:45 PM\n• **Spoken English Evening Session:** 06:00 PM تا 07:30 PM\n\nدفتر کے اوقات: صبح 8:00 بجے سے رات 8:00 بجے تک (پیر تا ہفتہ)۔`,
        `Here is our current batch schedule:\n\n• **Morning Board Exam Prep Batches:** 7:00 AM – 8:30 AM (During exam season)\n• **Afternoon Tuition (Classes 1–8):** 2:30 PM – 4:30 PM\n• **Matric Shift (9th & 10th Science):** 3:30 PM – 6:30 PM\n• **F.Sc & ICS Shift:** 4:00 PM – 7:45 PM\n• **Reception & Admin Office:** Mon–Sat from 8:00 AM to 8:00 PM.`,
      ]),
    };
  }

  // Location, Address, Map & Contact
  if (
    q.includes('location') ||
    q.includes('address') ||
    q.includes('kahan') ||
    q.includes('kidhar') ||
    q.includes('pata') ||
    q.includes('map') ||
    q.includes('contact') ||
    q.includes('phone') ||
    q.includes('mobile') ||
    q.includes('whatsapp') ||
    q.includes('rabta')
  ) {
    return {
      thinking: 'Pinpointing physical location in Sadiqabad and direct contact channels.',
      text: pickVariation('contact', [
        `📍 **Academy Location & Contact Details:**\n\n• **Address:** ${settings.address}, ${settings.city}, ${settings.province}, Pakistan.\n• **Phone:** ${settings.phone}\n• **WhatsApp Direct:** ${settings.whatsappNumber}\n• **Email:** ${settings.email}\n• **Office Hours:** ${settings.officeHours || '8:00 AM – 8:00 PM'}\n\nآپ کسی بھی وقت واٹس ایپ پر میسج کر کے یا کیمپس وزٹ کر کے مزید رہنمائی حاصل کر سکتے ہیں!`,
        `You are always welcome to visit us in person!\n\n🏢 **Campus:** ${settings.address}, ${settings.city}\n📞 **Helpline:** ${settings.phone}\n💬 **WhatsApp:** ${settings.whatsappNumber}\n\nWe are conveniently located in Sadiqabad with easy public and private transport access.`,
      ]),
    };
  }

  // Teachers & Faculty
  if (
    q.includes('teacher') ||
    q.includes('ustad') ||
    q.includes('faculty') ||
    q.includes('staff') ||
    q.includes('parhata') ||
    q.includes('parhata hai') ||
    q.includes('prof') ||
    q.includes('sir') ||
    q.includes('maam') ||
    q.includes('miss')
  ) {
    return {
      thinking: 'Extracting faculty qualifications, board specialization, and teaching pedagogy.',
      text: pickVariation('faculty', [
        `👨‍🏫 **Experienced & Qualified Faculty:**\nہماری تمام فیکلٹی M.Sc, M.Phil اور BISE بورڈ کے تجربہ کار اساتذہ پر مشتمل ہے جو فزکس، کیمسٹری، بیالوجی، میتھس اور کمپیوٹر سائنس کو جدید تدریسی انداز اور کونسیپٹ کلیرنگ کے ساتھ پڑھاتے ہیں۔\n\nآپ ویب سائٹ پر موجود **"Faculty"** پیج پر ہمارے تمام اساتذہ کے پروفائلز اور مضامین دیکھ سکتے ہیں۔`,
        `At **${settings.academyName}**, our teachers are seasoned subject specialists with over 10+ years of teaching experience for BISE Bahawalpur board exams. Every student receives individual mentorship, regular conceptual quizzes, and exam paper presentation techniques.`,
      ]),
    };
  }

  // Tests, Exams & Results
  if (
    q.includes('test') ||
    q.includes('exam') ||
    q.includes('result') ||
    q.includes('marks') ||
    q.includes('imtehan') ||
    q.includes('session') ||
    q.includes('bise') ||
    q.includes('board')
  ) {
    return {
      thinking: 'Detailing weekly assessment sessions, model test papers, and online result verification portal.',
      text: pickVariation('tests', [
        `📝 **Weekly Test System & Grand Test Sessions:**\n• ہر ہفتے ہفتہ وار ٹیسٹ (Chapter-wise Tests) منعقد کیے جاتے ہیں۔\n• بورڈ امتحانات سے قبل 3 راؤنڈز پر مشتمل "Grand Test Session" اور پری بورڈ ماڈل پیپرز لیے جاتے ہیں۔\n• طلبہ اور والدین ہمارے **"Results Portal"** پر اپنا Roll Number / Student ID درج کر کے ٹیسٹ رزلٹ اور پرسنٹیج آن لائن چیک کر سکتے ہیں!`,
        `We conduct rigorous weekly test sessions following the exact BISE Bahawalpur board marking scheme. Parents can track their child's marks and progress anytime through our online **Results Portal**!`,
      ]),
    };
  }

  // Specific classes: 9th, 10th, F.Sc, ICS
  if (
    q.includes('9th') ||
    q.includes('10th') ||
    q.includes('matric') ||
    q.includes('fsc') ||
    q.includes('f.sc') ||
    q.includes('ics') ||
    q.includes('inter') ||
    q.includes('first year') ||
    q.includes('second year') ||
    q.includes('spoken english')
  ) {
    return {
      thinking: 'Analyzing grade-specific syllabus structure and preparation methodologies.',
      text: pickVariation('classes', [
        `🎯 **Matric & Intermediate Coaching Programs:**\n• **9th & 10th (Science & Arts):** Physics, Chemistry, Biology, Math, Computer, English.\n• **F.Sc Pre-Medical & Pre-Engineering:** Complete textbook concepts, numerical problem solving, and past papers preparation.\n• **ICS (Physics/Stats/Computer):** Practical lab guidance and coding concepts.\n• **Spoken English & Grammar:** Fluency development, vocabulary, and confident conversation.\n\nداخلہ لینے کے لیے ابھی آن لائن فارم پر کریں۔`,
        `We provide focused preparation for Matric (9th & 10th) and Intermediate (F.Sc / ICS) with daily homework checks, past 5-year paper solving, and target-based syllabus completion well ahead of the final board exams!`,
      ]),
    };
  }

  // Thank you & appreciations
  if (q.includes('thank') || q.includes('shukriya') || q.includes('jazakallah') || q.includes('meherbani')) {
    return {
      thinking: 'Acknowledging client appreciation gracefully.',
      text: pickVariation('thanks', [
        `آپ کا بہت بہت شکریہ! جزاک اللہ۔ اگر آپ کو کوئی اور معلومات چاہیے ہوں تو بلا جھجھک پوچھیے۔ **${settings.academyName}** آپ کے شاندار تعلیمی مستقبل کے لیے ہمہ وقت کوشاں ہے۔ 🌟`,
        `You're most welcome! Best wishes for your academic journey from everyone at **${settings.academyName}** Sadiqabad. We look forward to seeing you at our campus! ✨`,
      ]),
    };
  }

  // Custom Knowledge Base configured by admin
  const customInfo = settings.chatbotSettings?.customKnowledge?.trim();
  if (customInfo && (q.includes('policy') || q.includes('rule') || q.includes('special') || q.includes('extra') || q.includes('discount') || q.includes('update') || q.includes('notice') || q.includes('batch'))) {
    return {
      thinking: 'Retrieved verified campus directives from Admin Knowledge Base.',
      text: `📌 **Official Campus Information:**\n${customInfo}\n\nFor further queries or personal visits, feel free to visit our campus reception at **${settings.address}** or call **${settings.phone}**.`,
    };
  }

  // Rich, dynamic contextual fallback (never repeating the same response!)
  const dynamicFallbacks = [
    `Thank you for reaching out to **${settings.academyName}** in Sadiqabad! 🎓\n\nI can help you with:\n• **Class Admissions & Courses** (Classes 1–12, Matric, F.Sc, ICS)\n• **Tuition Fees & Special Sibling Discounts**\n• **Batch Timings & Morning/Evening Shifts**\n• **Weekly Test Series & Results Checking**\n• **Campus Location (${settings.address})**\n\n${customInfo ? `📢 *Note:* ${customInfo}\n\n` : ''}Please let me know your preferred class or subject so I can provide exact details!`,

    `Aap ke sawal ka shukriya! **${settings.academyName}** صادق آباد کا سب سے قابلِ اعتماد تعلیمی ادارہ ہے۔\n\nکیا آپ کو داخلہ فارم، فیس سٹرکچر، کلاس کے اوقات یا اساتذہ کے بارے میں کچھ معلوم کرنا ہے؟ آپ سادہ الفاظ میں کلاس یا سبجیکٹ کا نام لکھیں، میں فوراً مکمل تفصیل دوں گا۔${customInfo ? `\n\n💡 *اہم معلومات:* ${customInfo}` : ''}`,

    `We are delighted to assist you! At our Sadiqabad campus, we provide premier coaching for BISE Bahawalpur board exams with experienced professors.\n\nCould you specify whether your inquiry is about **Admissions**, **Fee structure**, **Faculty profiles**, or **Class timings**? You can also contact our office directly at **${settings.phone}**.`,

    `خوش آمدید! آپ برائٹ فیوچر اکیڈمی کے بارے میں جو بھی سوال پوچھنا چاہیں، مجھے بتائیں۔ چاہے وہ کلاس 9th/10th کی فیس ہو، F.Sc/ICS کی ٹائمنگز ہوں، یا داخلہ لینے کا طریقہ ہو — میں فوری اور تفصیلی جواب دینے کے لیے موجود ہوں۔`,
  ];

  return {
    thinking: 'Synthesizing tailored academy consultation response.',
    text: pickVariation('general', dynamicFallbacks),
  };
}
