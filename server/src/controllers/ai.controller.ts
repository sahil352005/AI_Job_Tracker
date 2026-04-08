import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { parseJobDescription, generateResumeSuggestions } from '../services/ai.service';

export const parseJD = async (req: AuthRequest, res: Response): Promise<void> => {
  const { jobDescription } = req.body;
  if (!jobDescription) {
    res.status(400).json({ message: 'jobDescription is required' });
    return;
  }
  try {
    const parsed = await parseJobDescription(jobDescription);
    const suggestions = await generateResumeSuggestions(parsed.role, parsed.skills);
    res.json({ ...parsed, resumeSuggestions: suggestions });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('AI error:', message);
    res.status(502).json({ message: 'AI parsing failed.', detail: message });
  }
};
