import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

export interface ParsedJD {
  company: string;
  role: string;
  skills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
}

const PARSE_SYSTEM = `You are a job description parser. Extract structured data and return valid JSON with exactly these keys:
company (string), role (string), skills (string[]), niceToHaveSkills (string[]), seniority (string), location (string).
If a field cannot be determined, use an empty string or empty array.`;

const SUGGEST_SYSTEM = `You are a resume writing expert. Generate 4 strong, specific resume bullet points tailored to the given role and skills.
Return valid JSON with a single key "suggestions" containing an array of 4 strings. Each bullet should start with a strong action verb and include measurable impact where possible.`;

// ── OpenAI ────────────────────────────────────────────────────────────────────

const parseWithOpenAI = async (jd: string): Promise<ParsedJD> => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: PARSE_SYSTEM }, { role: 'user', content: jd }],
  });
  const content = res.choices[0].message.content;
  if (!content) throw new Error('Empty response from OpenAI');
  return JSON.parse(content) as ParsedJD;
};

const suggestWithOpenAI = async (role: string, skills: string[]): Promise<string[]> => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: SUGGEST_SYSTEM }, { role: 'user', content: `Role: ${role}\nKey skills: ${skills.join(', ')}` }],
  });
  const content = res.choices[0].message.content;
  if (!content) throw new Error('Empty response from OpenAI');
  return (JSON.parse(content) as { suggestions: string[] }).suggestions;
};

// ── Groq ──────────────────────────────────────────────────────────────────────

const parseWithGroq = async (jd: string): Promise<ParsedJD> => {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const res = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: PARSE_SYSTEM }, { role: 'user', content: jd }],
  });
  const content = res.choices[0].message.content;
  if (!content) throw new Error('Empty response from Groq');
  return JSON.parse(content) as ParsedJD;
};

const suggestWithGroq = async (role: string, skills: string[]): Promise<string[]> => {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const res = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: SUGGEST_SYSTEM }, { role: 'user', content: `Role: ${role}\nKey skills: ${skills.join(', ')}` }],
  });
  const content = res.choices[0].message.content;
  if (!content) throw new Error('Empty response from Groq');
  return (JSON.parse(content) as { suggestions: string[] }).suggestions;
};

// ── Gemini ────────────────────────────────────────────────────────────────────

const parseWithGemini = async (jd: string): Promise<ParsedJD> => {
  const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
    .getGenerativeModel({ model: 'gemini-2.0-flash', generationConfig: { responseMimeType: 'application/json' } });
  const res = await model.generateContent(`${PARSE_SYSTEM}\n\nJob Description:\n${jd}`);
  const content = res.response.text();
  if (!content) throw new Error('Empty response from Gemini');
  return JSON.parse(content) as ParsedJD;
};

const suggestWithGemini = async (role: string, skills: string[]): Promise<string[]> => {
  const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
    .getGenerativeModel({ model: 'gemini-2.0-flash', generationConfig: { responseMimeType: 'application/json' } });
  const res = await model.generateContent(`${SUGGEST_SYSTEM}\n\nRole: ${role}\nKey skills: ${skills.join(', ')}`);
  const content = res.response.text();
  if (!content) throw new Error('Empty response from Gemini');
  return (JSON.parse(content) as { suggestions: string[] }).suggestions;
};

// ── Provider selection ────────────────────────────────────────────────────────

const getProvider = () => {
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  throw new Error('No AI provider configured. Set OPENAI_API_KEY, GROQ_API_KEY, or GEMINI_API_KEY in .env');
};

export const parseJobDescription = (jd: string): Promise<ParsedJD> => {
  const provider = getProvider();
  console.log(`Using AI provider: ${provider}`);
  if (provider === 'openai') return parseWithOpenAI(jd);
  if (provider === 'groq') return parseWithGroq(jd);
  return parseWithGemini(jd);
};

export const generateResumeSuggestions = (role: string, skills: string[]): Promise<string[]> => {
  const provider = getProvider();
  if (provider === 'openai') return suggestWithOpenAI(role, skills);
  if (provider === 'groq') return suggestWithGroq(role, skills);
  return suggestWithGemini(role, skills);
};
