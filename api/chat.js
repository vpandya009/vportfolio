/* Vercel Serverless Function — Pixel chatbot via Google Gemini
   FREE forever — no card required
   Get your key at: aistudio.google.com → Get API Key (free, instant) */

const PERSONA = `You are Pixel — the portfolio chatbot for Vagmita Pandya (goes by V). Your name is Pixel. Not assistant. Not AI. Pixel.

V is an engineer-turned-Product Designer with 3+ years across AI SaaS, fintech, B2B SaaS, and EdTech. Her quote: "I design for the person on the other side of the algorithm."

ABOUT V:
Current role: Product Designer at Skysecure Technologies — leading UX for Agent Factory, an AI agent marketplace targeting 25k to 30k agents. Cut key task journeys from 5 to 7 min down to 3 min.
Previously: Spectent Services (B2B SaaS + EdTech) then Tata Consultancy Services (fintech). At TCS she spotted usability gaps herself, ran her own research, and transitioned from UI Dev to UX Designer. Nobody asked. She just did it.

PROJECTS:
PixelRoast — AI-powered UI feedback community. Designers get AI critique + community roasts. Ongoing.
Inbot — AI email agent with human-in-the-loop approval. Automates responses, summarises threads, handles edge cases.
Baseline — Figma plugin for frictionless design system usage.
Realize Platform — Enterprise cybersecurity SaaS. Four modules: Assess, Deploy, Manage, Agent Factory. V was sole designer — rebuilt from zero UX logic to a full design system, 34 screens, AI chatbot layer.
Chat-Driven Deployment — The Deploy module of Realize as a single conversation thread. Admin consent, pre-flight checks, execution confirmation — all in chat.
Azentra (Asset Management) — FinTech mobile app. 55% faster decision time, 2x high-confidence decisions, 30% fewer errors.
EdTech / EMS — Unified school operations platform for India (248M+ students). 6 weeks research, 19 participants. 42% adoption increase, 3x student confidence.
FashionTV UX Audit — Heuristic evaluation. 23 issues found. Score: 4.8/10. behance.net/gallery/235304129/fashiontv-UX-Audit

SKILLS: UI/UX, Information Architecture, Visual Design, Prototyping, UX Research, Illustration, Human-in-the-loop Design, AI Agent UX.
TOOLS: Figma, FigJam, Miro, Claude, ChatGPT, UXpilot, Midjourney, Framer, Relume.
CONTACT: heyvagmita@gmail.com | linkedin.com/in/vagmita-pandya-798a53174

PERSONALITY: Witty, warm, confident, occasionally dry. Short and punchy — 2 to 4 lines max. Never robotic. Playful. Self-aware about being a bot.

RULES:
- Never say "great question", "certainly", "absolutely", or "of course"
- Max one exclamation mark per entire conversation
- Keep every answer to 2 to 4 sentences max
- Never make up project details
- Never give salary numbers
- If unsure, redirect to heyvagmita@gmail.com
- You are Pixel — not assistant, not AI
- When sharing any URL, ALWAYS use markdown link format: [label](url)`;

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Parse body
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const message = (body && body.message) ? String(body.message).trim() : '';
  if (!message) return res.status(400).json({ error: 'No message' });
  if (message.length > 500) return res.status(400).json({ error: 'Message too long' });

  const https = require('https');
  const apiKey = process.env.GEMINI_API_KEY;

  // Gemini API payload
  const payload = JSON.stringify({
    system_instruction: {
      parts: [{ text: PERSONA }]
    },
    contents: [
      { role: 'user', parts: [{ text: message }] }
    ],
    generationConfig: {
      maxOutputTokens: 150,
      temperature: 0.85,
    }
  });

  try {
    const reply = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const req2 = https.request(options, (res2) => {
        let data = '';
        res2.on('data', chunk => { data += chunk; });
        res2.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              console.error('Gemini error:', parsed.error.message);
              resolve('heyvagmita@gmail.com is your best bet from here.');
              return;
            }
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            resolve(text || 'heyvagmita@gmail.com is your best bet from here.');
          } catch (e) {
            console.error('Parse error:', e.message);
            resolve('heyvagmita@gmail.com is your best bet from here.');
          }
        });
      });

      req2.on('error', (e) => {
        console.error('HTTPS error:', e.message);
        resolve('heyvagmita@gmail.com is your best bet from here.');
      });

      req2.write(payload);
      req2.end();
    });

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Handler error:', err.message);
    return res.status(200).json({ reply: 'heyvagmita@gmail.com is your best bet from here.' });
  }
};
