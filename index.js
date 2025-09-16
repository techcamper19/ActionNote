import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        throw new Error('Error signing up');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero section */}
      <header className="flex-1 flex flex-col items-center justify-center px-4 text-center bg-gradient-to-b from-white to-blue-50">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Turn meetings into actions, instantly.
        </h1>
        <p className="text-lg md:text-2xl text-gray-600 max-w-3xl mb-8">
          ActionNote automatically transcribes your meetings, creates concise summaries and
          actionable task lists, and lets you export them to Notion, Slack or email.
        </p>
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email to join the waitlist"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="px-6 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary-light disabled:opacity-50"
            >
              {status === 'submitting' ? 'Submitting…' : 'Join Waitlist'}
            </button>
          </div>
          {status === 'success' && (
            <p className="mt-2 text-green-600 text-sm">Thanks! You’re on the list.</p>
          )}
          {status === 'error' && (
            <p className="mt-2 text-red-600 text-sm">There was an error. Please try again.</p>
          )}
        </form>
      </header>
      {/* Features section */}
      <section className="bg-white py-16 px-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6 rounded-lg shadow-md bg-gray-50">
            <h3 className="text-xl font-semibold mb-2">AI Summariser</h3>
            <p className="text-gray-600">Get concise summaries of lengthy meeting transcripts, highlighting what matters.</p>
          </div>
          <div className="text-center p-6 rounded-lg shadow-md bg-gray-50">
            <h3 className="text-xl font-semibold mb-2">Action Items</h3>
            <p className="text-gray-600">Automatically extract tasks and next steps so nothing falls through the cracks.</p>
          </div>
          <div className="text-center p-6 rounded-lg shadow-md bg-gray-50">
            <h3 className="text-xl font-semibold mb-2">Export Anywhere</h3>
            <p className="text-gray-600">Send summaries to Notion, Slack or by email with one click.</p>
          </div>
        </div>
      </section>
      {/* Pricing section */}
      <section className="bg-blue-50 py-16 px-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="border border-gray-300 p-6 rounded-lg text-center bg-white">
            <h3 className="text-2xl font-semibold mb-2">Free</h3>
            <p className="mb-4 text-gray-600">Up to 5 summaries per month</p>
            <p className="text-3xl font-bold mb-4">$0</p>
            <button className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-light">Get Started</button>
          </div>
          <div className="border border-primary p-6 rounded-lg text-center bg-white shadow-lg">
            <h3 className="text-2xl font-semibold mb-2">Pro</h3>
            <p className="mb-4 text-gray-600">Unlimited summaries for individuals</p>
            <p className="text-3xl font-bold mb-4">$9/mo</p>
            <button className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-light">Upgrade</button>
          </div>
          <div className="border border-gray-300 p-6 rounded-lg text-center bg-white">
            <h3 className="text-2xl font-semibold mb-2">Team</h3>
            <p className="mb-4 text-gray-600">Collaborate with your team and assign tasks</p>
            <p className="text-3xl font-bold mb-4">$29/mo</p>
            <button className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-light">Upgrade</button>
          </div>
        </div>
      </section>
      <footer className="bg-white py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} ActionNote. All rights reserved.
      </footer>
    </div>
  );
}