import { useState } from 'react';

export default function Dashboard({ session, supabase }) {
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === 'string') {
        setTranscript(text);
      }
    };
    reader.readAsText(file);
  };

  const handleSummarize = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, summary_sentences: 3 }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to summarise');
      }
      const data = await res.json();
      setSummary(data.summary);
      setTasks(data.tasks);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const exportTo = async (destination) => {
    const content = `Summary:\n${summary}\n\nTasks:\n${tasks.join('\n- ')}`;
    if (destination === 'clipboard') {
      await navigator.clipboard.writeText(content);
      alert('Copied to clipboard');
    } else {
      alert(`Export to ${destination} is not configured in this demo.`);
    }
  };

  const handleSignIn = () => {
    supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleSignOut = () => {
    supabase.auth.signOut();
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-4">Welcome to ActionNote</h1>
        <p className="mb-6 text-gray-600">Sign in to start summarising your meetings.</p>
        <button
          onClick={handleSignIn}
          className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-light"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">{session.user.email}</span>
          <button onClick={handleSignOut} className="text-primary hover:underline">Sign out</button>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input panel */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Upload or paste transcript</h2>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript here..."
            className="w-full h-48 p-3 border border-gray-300 rounded-md mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary-light"
          ></textarea>
          <div className="mb-4">
            <input type="file" accept=".txt,.md" onChange={handleFileUpload} />
          </div>
          <button
            onClick={handleSummarize}
            disabled={loading || !transcript.trim()}
            className="px-5 py-2 bg-primary text-white rounded-md hover:bg-primary-light disabled:opacity-50"
          >
            {loading ? 'Summarizing…' : 'Summarize'}
          </button>
          {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
        </div>
        {/* Output panel */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          {summary ? (
            <div>
              <p className="whitespace-pre-line mb-4 text-gray-800">{summary}</p>
              <h3 className="text-lg font-semibold mb-2">Action Items</h3>
              <ul className="list-disc list-inside space-y-1">
                {tasks.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-4">
                <button onClick={() => exportTo('clipboard')} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light">Copy</button>
                <button onClick={() => exportTo('notion')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Notion</button>
                <button onClick={() => exportTo('slack')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Slack</button>
                <button onClick={() => exportTo('email')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Email</button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Your summary will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
