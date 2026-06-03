'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

const TONES = [
  { value: 'romantic and heartfelt', label: '❤️ Romantic' },
  { value: 'sweet and cute', label: '🍬 Sweet' },
  { value: 'passionate and intense', label: '🔥 Passionate' },
  { value: 'soft and gentle', label: '🌸 Soft & Gentle' },
  { value: 'playful and fun', label: '😄 Playful' },
  { value: 'deep and emotional', label: '💙 Deep & Emotional' },
];

export default function WriteLetterPage() {
  const router = useRouter();
  const [originalText, setOriginalText] = useState('');
  const [enhancedText, setEnhancedText] = useState('');
  const [tone, setTone] = useState('romantic and heartfelt');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleEnhance = async () => {
    if (!originalText.trim() || originalText.trim().length < 10) {
      showToast('❌ Please write at least 10 characters.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('ll_token');
      const res = await fetch('http://localhost:3001/api/letters/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ originalText, tone }),
      });
      const data = await res.json();
      if (data.success) {
        setEnhancedText(data.enhanced);
        setStep(2);
      } else {
        showToast('❌ ' + data.message);
      }
    } catch (err) {
      showToast('❌ Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const saveRes = await api.post('/api/letters/generate', {
        mode: 'custom',
        generation_type: 'A',
        custom_content: enhancedText,
        sendNow: true,
      });
      if (saveRes.data.success) {
        showToast('💌 Letter sent successfully!');
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        showToast('❌ Failed to send.');
      }
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.error || 'Failed to send.'));
    } finally {
      setSending(false);
    }
  };

  const handleSaveOnly = async () => {
    setSending(true);
    try {
      const saveRes = await api.post('/api/letters/generate', {
        mode: 'custom',
        generation_type: 'A',
        custom_content: enhancedText,
        sendNow: false,
      });
      if (saveRes.data.success) {
        showToast('✅ Letter saved to history!');
        setTimeout(() => router.push('/history'), 1500);
      } else {
        showToast('❌ Failed to save.');
      }
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.error || 'Failed to save.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-pink-200 text-pink-700 px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-pink-400 hover:text-pink-600 text-2xl"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-pink-700">✍️ Write Your Own Letter</h1>
            <p className="text-sm text-pink-400">Write from the heart, AI will polish it</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${step === 1 ? 'bg-pink-500 text-white' : 'bg-pink-200 text-pink-600'}`}>
            ✏️ Write
          </div>
          <div className="text-pink-300">→</div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${step === 2 ? 'bg-pink-500 text-white' : 'bg-pink-200 text-pink-600'}`}>
            ✨ AI Enhanced Preview
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-pink-600 mb-2">
                🎭 Choose Tone
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                      tone === t.value
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-white text-pink-600 border-pink-200 hover:border-pink-400'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-pink-600 mb-2">
                💬 Your Letter
              </label>
              <textarea
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="Write your letter here... Don't worry about grammar — just write from the heart! AI will enhance it for you. 💕"
                rows={10}
                className="w-full border border-pink-200 rounded-xl p-4 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
              />
              <p className="text-xs text-pink-300 mt-1 text-right">
                {originalText.length} characters
              </p>
            </div>

            <button
              onClick={handleEnhance}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? '✨ AI is enhancing your letter...' : '✨ Enhance with AI'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">📝 Your Original</h3>
              <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
                {originalText}
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-2xl shadow-md p-6">
              <h3 className="text-sm font-semibold text-pink-600 mb-3">✨ AI Enhanced Version</h3>
              <textarea
                value={enhancedText}
                onChange={(e) => setEnhancedText(e.target.value)}
                rows={10}
                className="w-full bg-transparent text-gray-700 text-sm focus:outline-none resize-none leading-relaxed"
              />
              <p className="text-xs text-pink-400 mt-2">💡 You can still edit the enhanced version above</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-pink-300 text-pink-600 py-3 rounded-xl font-semibold text-sm hover:bg-pink-50 transition"
              >
                ← Edit Again
              </button>
              <button
                onClick={handleSaveOnly}
                disabled={sending}
                className="flex-1 bg-pink-100 text-pink-700 py-3 rounded-xl font-semibold text-sm hover:bg-pink-200 transition disabled:opacity-50"
              >
                💾 Save Only
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {sending ? 'Sending...' : '💌 Send Now'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}