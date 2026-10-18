import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

function chatApiPlugin(): Plugin {
  return {
    name: 'chat-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body || '{}');
            const apiKey = process.env.GEMINI_API_KEY;

            if (!apiKey) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ text: null, fallback: true }));
              return;
            }

            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            });

            const systemInstruction = `You are the official student guidance advisor for Bright Future Coaching Academy in Sadiqabad, Punjab, Pakistan.
Answer student and parent inquiries politely, encouragingly, and clearly.
Currency is always Pakistani Rupees (PKR).
Source of truth is only the following academy data:
${JSON.stringify(parsed.context || {})}
Never expose confidential student marks, teacher salaries, private phone numbers, or administrative notes.`;

            const response = await ai.models.generateContent({
              model: 'gemini-4-argon',
              contents: parsed.message,
              config: {
                systemInstruction,
                thinkingConfig: {
                  thinkingLevel: ThinkingLevel.HIGH,
                },
              },
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                text: response.text,
                thinking: 'Processed with Gemini 4 Argon with High Thinking Level.',
              })
            );
          } catch (err: unknown) {
            console.error('Chat API error:', err);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ text: null, fallback: true }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), chatApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

