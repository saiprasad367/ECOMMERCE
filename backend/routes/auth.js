const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
require('dotenv').config();

// ----------------- SIGNUP -----------------
router.post('/signup', async (req, res) => {
  const { full_name, email, password, confirm_password } = req.body;
  if (!full_name || !email || !password || !confirm_password)
    return res.status(400).json({ message: 'All fields required' });
  
  if (password !== confirm_password)
    return res.status(400).json({ message: 'Passwords do not match' });

  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (existingUser) return res.status(400).json({ message: 'Email already registered' });

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([{ full_name, email, password: hashedPassword }])
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });

  res.status(201).json({ message: 'User registered', user: data });
});

// ----------------- LOGIN -----------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email & password required' });

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (!user) return res.status(400).json({ message: 'User not found' });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ message: 'Login successful', token });
});

// ----------------- FORGOT PASSWORD -----------------
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (!user) return res.status(400).json({ message: 'User not found' });

  const otp = Math.floor(100000 + Math.random() * 900000);
  
  // Save OTP in metadata (or create separate table for OTPs)
  await supabase
    .from('users')
    .update({ metadata: { ...user.metadata, otp } })
    .eq('id', user.id);

  await sendEmail(email, 'Reset Password OTP', `<p>Your OTP is: <b>${otp}</b></p>`);

  res.json({ message: 'OTP sent to email' });
});

// ----------------- RESET PASSWORD -----------------
router.post('/reset-password', async (req, res) => {
  const { email, otp, new_password } = req.body;
  if (!email || !otp || !new_password)
    return res.status(400).json({ message: 'All fields required' });

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (!user) return res.status(400).json({ message: 'User not found' });

  if (!user.metadata?.otp || user.metadata.otp != otp)
    return res.status(400).json({ message: 'Invalid OTP' });

  const hashedPassword = await bcrypt.hash(new_password, 10);

  await supabase
    .from('users')
    .update({ password: hashedPassword, metadata: { ...user.metadata, otp: null } })
    .eq('id', user.id);

  res.json({ message: 'Password reset successful' });
});

module.exports = router;
