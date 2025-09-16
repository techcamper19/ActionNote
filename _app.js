import '@/styles/globals.css';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function App({ Component, pageProps }) {
  const [supabase] = useState(() =>
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
  );
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Retrieve initial session
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return <Component {...pageProps} supabase={supabase} session={session} />;
}
