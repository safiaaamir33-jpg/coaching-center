import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Initialize Gemini Client
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // API endpoint for dynamic, intelligent chatbot
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, context, history } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      if (!ai) {
        return res.status(503).json({
          error: 'Gemini AI service is not initialized on server. Using smart local engine.',
          fallback: true,
        });
      }

      // Build context summary for the academy
      const academyName = context?.academyName || 'Bright Future Coaching Academy';
      const address = context?.address || 'Near Model Town, Sadiqabad, Punjab, Pakistan';
      const phone = context?.phone || '+92 300 1234567';
      const whatsapp = context?.whatsapp || '+92 300 1234567';
      const email = context?.email || 'info@brightfutureacademy.edu.pk';
      const officeHours = context?.officeHours || 'Mon–Sat: 8:00 AM – 8:00 PM';
      const admissionOpen = context?.admissionOpen ? 'OPEN NOW for new batch' : 'Closed for current session';
      const coursesSummary = Array.isArray(context?.courses)
        ? context.courses.map((c: any) => `- ${c.name} (${c.classGrade}): Monthly Fee PKR ${c.monthlyFee}, Admission PKR ${c.admissionFee}, Timing: ${c.schedule || 'Flexible'}`).join('\n')
        : 'Classes 1–12, Matric (9th/10th), F.Sc (Pre-Med/Pre-Engg), ICS, Spoken English';

      const systemInstruction = `
You are the official Senior Admissions Counselor and AI Assistant for "${academyName}", a prestigious coaching center located in Sadiqabad, Punjab, Pakistan.

ACADEMY PROFILE & FACTUAL KNOWLEDGE:
- Location: ${address}
- Contact Phone: ${phone}
- WhatsApp Inquiries: ${whatsapp}
- Email: ${email}
- Admission Status: ${admissionOpen}
- Office Hours: ${officeHours}
- Offered Programs & Tuition:
${coursesSummary}

CRITICAL RULES:
1. SECURITY & PRIVACY:
   - NEVER show, guess, or discuss any administrator passwords, login credentials, database keys, or private staff salaries.
   - If anyone asks for passwords, admin access, or sensitive credentials, firmly and politely state: "Administrative credentials, passwords, and student private records are strictly confidential and protected by academy security policies."

2. NATURAL, DYNAMIC & VARIED RESPONSES (NO REPETITIVE CANNED ANSWERS):
   - Do NOT repeat the exact same greeting or boilerplates repeatedly.
   - Address the user's specific query immediately and directly.
   - Understand and respond fluently in English, Urdu (اردو), or Roman Urdu (e.g. "mujhe 10th me admission lena hai", "fees kitni hai", "kia timing hai", "teachers kaisy hain", "location kahan hai").
   - Match the user's language: If asked in Roman Urdu, reply in natural, courteous Roman Urdu. If asked in English, reply in polished English. If in Urdu script, reply in clear Urdu.
   - Be welcoming, motivating, respectful, and helpful to students and parents of Sadiqabad.
   - Highlight the BISE Bahawalpur board preparation, weekly test series, and personalized attention.
`;

      // Build conversation contents
      const conversationContents: any[] = [];

      // Add recent history if available
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-6)) {
          if (item.sender === 'user') {
            conversationContents.push({ role: 'user', parts: [{ text: item.text }] });
          } else if (item.sender === 'assistant') {
            conversationContents.push({ role: 'model', parts: [{ text: item.text }] });
          }
        }
      }

      // Add current message
      conversationContents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      // Call Gemini 3.8 Flash model
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: conversationContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = response.text || "Thank you for contacting Bright Future Coaching Academy. Our admissions desk in Sadiqabad is ready to help you!";

      return res.json({
        text: responseText,
        source: 'gemini-ai',
      });
    } catch (error: any) {
      console.error('Gemini chat API error:', error?.message || error);
      return res.status(500).json({
        error: error?.message || 'Chat service error',
        fallback: true,
      });
    }
  });

  // Serve app via Vite in development, static in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // SPA fallback in development mode
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    const distIndexPath = path.resolve(distPath, 'index.html');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
    app.get('*', (_req, res) => {
      if (fs.existsSync(distIndexPath)) {
        res.sendFile(distIndexPath);
      } else {
        res.sendFile(path.resolve(__dirname, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
