'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

const STATUS_COLORS = {
  sent: '#4caf50',
  pending: '#ff9800',
  failed: '#f44336'
};

export default function HistoryPage() {
  const router = useRouter();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem('ll_token');
    if (!token) {
      router.push('/login');
      return;
    }
    api
      .get('/api/history')
      .then((r) => setLetters(r.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  const deleteLetter = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this letter?');
    if (!confirmed) return;
    try {
      await api.delete(`/api/history/${id}`);
      setLetters((prev) => prev.filter((letter) => letter.id !== id));
      showToast('🗑 Letter deleted!');
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to delete letter');
    }
  };

  const startEdit = (letter) => {
    setEditingId(letter.id);
    setEditContent(letter.was_edited ? letter.edited_content : letter.content);
    setExpanded(letter.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const saveLetter = async (id) => {
    setSaving(true);
    try {
      await api.put(`/api/letters/${id}/edit`, { content: editContent });
      setLetters((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, edited_content: editContent, was_edited: true }
            : l
        )
      );
      setEditingId(null);
      showToast('✅ Letter saved!');
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to save letter');
    } finally {
      setSaving(false);
    }
  };

  const sendLetter = async (id) => {
    const confirmed = window.confirm('Send this letter now?');
    if (!confirmed) return;
    setSending(id);
    try {
      await api.post(`/api/letters/${id}/send`);
      setLetters((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, delivery_status: 'sent', was_sent: true }
            : l
        )
      );
      showToast('💌 Letter sent successfully!');
    } catch (err) {
      console.error(err);
      showToast('❌ ' + (err.response?.data?.error || 'Failed to send letter'));
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#fff8f0' }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-pink-200 text-pink-700 px-4 py-3 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}

      <header
        style={{ background: 'linear-gradient(135deg,#c2185b,#e91e63)' }}
        className="px-6 py-4 flex justify-between items-center shadow-md"
      >
        <div className="text-white">
          <h1 className="text-xl font-bold">📋 Letter History</h1>
          <p className="text-pink-100 text-xs">{letters.length} letters sent</p>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-white text-sm bg-white/20 px-3 py-1.5 rounded-lg"
        >
          ← Back
        </button>
      </header>

      <div className="max-w-2xl mx-auto p-6 space-y-3">
        {loading && (
          <p className="text-center text-gray-400 py-10">Loading...</p>
        )}

        {!loading && letters.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">💌</div>
            <p className="text-gray-500">No letters yet — generate your first one!</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-6 py-2 rounded-xl text-white text-sm"
              style={{ background: '#e91e63' }}
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {letters.map((letter) => (
          <div
            key={letter.id}
            className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden"
          >
            <button
              className="w-full px-5 py-4 flex justify-between items-center text-left"
              onClick={() =>
                setExpanded(expanded === letter.id ? null : letter.id)
              }
            >
              <div className="flex flex-col">
                <span
                  className="font-semibold text-sm capitalize"
                  style={{ color: '#c2185b' }}
                >
                  Your Daily Love Letter 💌
                  {letter.was_edited && (
                    <span className="ml-2 text-xs text-pink-400">(edited)</span>
                  )}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  {new Date(letter.created_at).toLocaleDateString()}{' '}
                  {new Date(letter.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white capitalize"
                  style={{
                    background: STATUS_COLORS[letter.delivery_status] || '#999',
                  }}
                >
                  {letter.delivery_status || 'pending'}
                </span>

                {/* Pending only buttons */}
                {letter.delivery_status === 'pending' && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(letter);
                      }}
                      className="px-3 py-1 rounded-lg text-white text-xs transition"
                      style={{ background: '#e91e63' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sendLetter(letter.id);
                      }}
                      disabled={sending === letter.id}
                      className="px-3 py-1 rounded-lg text-white text-xs transition"
                      style={{ background: '#4caf50', opacity: sending === letter.id ? 0.7 : 1 }}
                    >
                      {sending === letter.id ? '...' : '📬 Send'}
                    </button>
                  </>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLetter(letter.id);
                  }}
                  className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs hover:bg-red-600 transition"
                >
                  🗑 Delete
                </button>

                <span className="text-gray-400">
                  {expanded === letter.id ? '▲' : '▼'}
                </span>
              </div>
            </button>

            {expanded === letter.id && (
              <div className="px-5 pb-5 border-t border-pink-50">
                {editingId === letter.id ? (
                  <div className="mt-3 space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={8}
                      className="w-full border border-pink-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
                      style={{ color: '#3d1a26', fontFamily: 'Georgia, serif' }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveLetter(letter.id)}
                        disabled={saving}
                        className="flex-1 py-2 rounded-xl text-white text-sm font-semibold"
                        style={{ background: 'linear-gradient(135deg,#c2185b,#e91e63)', opacity: saving ? 0.7 : 1 }}
                      >
                        {saving ? 'Saving...' : '💾 Save Changes'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold border-2"
                        style={{ borderColor: '#e91e63', color: '#e91e63' }}
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    className="text-sm leading-relaxed whitespace-pre-line mt-3"
                    style={{ color: '#3d1a26', fontFamily: 'Georgia, serif' }}
                  >
                    {letter.was_edited ? letter.edited_content : letter.content}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}