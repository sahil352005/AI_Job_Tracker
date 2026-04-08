import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const signToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password required' });
    return;
  }
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409).json({ message: 'Email already in use' });
    return;
  }
  const user = await User.create({ email, password });
  res.status(201).json({ token: signToken(user.id as string), email: user.email });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  res.json({ token: signToken(user.id as string), email: user.email });
};
