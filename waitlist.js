import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Invalid email' });
  }
  try {
    const { error } = await supabase.from('waitlist').insert({ email });
    if (error) {
      console.error('Supabase error', error);
      return res.status(500).json({ error: 'Failed to save email' });
    }
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    console.error('Handler error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}