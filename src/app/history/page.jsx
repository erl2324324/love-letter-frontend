'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

export default function HistoryPage() {
  const router = useRouter();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const token = localStorage.getItem('ll_token');
    if (!token) { router.push('/login'); return; }
    api.get('/api/history')
      .then(r => setLetters(r.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  const deleteLetter = async (id) => {
    if (!window.confirm('Delete this letter?')) return;
    try {
      await api.delete(`/api/history/${id}`);
      setLetters(prev => prev.filter(l => l.id !== id));
      if (expanded === id) setExpanded(null);
      showToast('🗑️ Letter deleted!');
    } catch { showToast('Failed to delete', 'error'); }
  };

  const startEdit = (letter) => {
    setEditingId(letter.id);
    setEditContent(letter.was_edited ? letter.edited_content : letter.content);
    setExpanded(letter.id);
  };

  const cancelEdit = () => { setEditingId(null); setEditContent(''); };

  const saveLetter = async (id) => {
    setSaving(true);
    try {
      await api.put(`/api/letters/${id}/edit`, { content: editContent });
      setLetters(prev => prev.map(l => l.id === id ? { ...l, edited_content: editContent, was_edited: true } : l));
      setEditingId(null);
      showToast('✅ Letter saved!');
    } catch { showToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const sendLetter = async (id) => {
    if (!window.confirm('Send this letter now?')) return;
    setSending(id);
    try {
      await api.post(`/api/letters/${id}/send`);
      setLetters(prev => prev.map(l => l.id === id ? { ...l, delivery_status: 'sent', was_sent: true } : l));
      showToast('💌 Letter sent!');
    } catch (err) { showToast(err.response?.data?.error || 'Failed to send', 'error'); }
    finally { setSending(null); }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  const statusColor = { sent: '#4caf50', pending: '#ff9800', failed: '#f44336' };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }

        .history-root {
          min-height: 100vh;
          min-height: 100dvh;
          background: #1a0a0f;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          padding-bottom: 5rem;
        }

        .nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(26,10,15,0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(194,24,91,0.2);
          padding: 0 1rem; height: 60px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1rem, 3vw, 1.2rem);
          color: #f48fb1; font-style: italic;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .nav-count { font-size: 0.72rem; color: rgba(255,255,255,0.35); margin-top: 0.1rem; }
        .back-btn {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          padding: 0.45rem 0.9rem; border-radius: 50px;
          font-size: 0.8rem; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .back-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }

        .content {
          max-width: 680px; margin: 0 auto;
          padding: 1.5rem 1rem;
          display: flex; flex-direction: column; gap: 0.85rem;
        }

        .empty {
          text-align: center; padding: 4rem 2rem;
          display: flex; flex-direction: column; align-items: center; gap: 1rem;
        }
        .empty-icon { font-size: 3.5rem; opacity: 0.4; }
        .empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem; color: rgba(244,143,177,0.6); font-style: italic;
        }
        .empty-desc { font-size: 0.85rem; color: rgba(255,255,255,0.3); }
        .empty-btn {
          margin-top: 0.5rem; padding: 0.75rem 1.75rem;
          background: linear-gradient(135deg, #880e4f, #e91e63);
          border: none; border-radius: 50px; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 600;
          cursor: pointer; box-shadow: 0 6px 20px rgba(233,30,99,0.3);
          transition: all 0.2s;
        }
        .empty-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(233,30,99,0.4); }

        .letter-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; overflow: hidden;
          transition: border-color 0.2s;
        }
        .letter-card:hover { border-color: rgba(194,24,91,0.3); }

        .letter-header {
          width: 100%; padding: 1rem 1.25rem;
          display: flex; justify-content: space-between; align-items: center;
          background: none; border: none; cursor: pointer; text-align: left;
          -webkit-tap-highlight-color: transparent;
          gap: 0.75rem;
        }
        .letter-meta { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; min-width: 0; }
        .letter-title {
          font-family: 'Playfair Display', serif;
          font-size: 0.95rem; color: #f48fb1; font-style: italic;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .letter-date { font-size: 0.72rem; color: rgba(255,255,255,0.35); }
        .edited-badge {
          font-size: 0.65rem; color: rgba(244,143,177,0.6);
          background: rgba(244,143,177,0.1); padding: 0.15rem 0.5rem;
          border-radius: 50px; border: 1px solid rgba(244,143,177,0.2);
          display: inline-block; margin-left: 0.4rem;
        }

        .letter-actions {
          display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0;
          flex-wrap: wrap; justify-content: flex-end;
        }

        .status-badge {
          font-size: 0.65rem; padding: 0.2rem 0.6rem;
          border-radius: 50px; color: #fff; font-weight: 600;
          text-transform: capitalize;
        }

        .action-btn {
          padding: 0.35rem 0.7rem; border-radius: 8px;
          font-size: 0.75rem; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          border: none; cursor: pointer; transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .btn-edit { background: rgba(233,30,99,0.2); color: #f48fb1; border: 1px solid rgba(233,30,99,0.3); }
        .btn-edit:hover { background: rgba(233,30,99,0.35); }
        .btn-send { background: rgba(76,175,80,0.2); color: #81c784; border: 1px solid rgba(76,175,80,0.3); }
        .btn-send:hover { background: rgba(76,175,80,0.35); }
        .btn-delete { background: rgba(244,67,54,0.2); color: #ef9a9a; border: 1px solid rgba(244,67,54,0.3); }
        .btn-delete:hover { background: rgba(244,67,54,0.35); }
        .btn-disabled { opacity: 0.5; cursor: not-allowed; }

        .chevron { color: rgba(255,255,255,0.3); font-size: 0.75rem; flex-shrink: 0; }

        .letter-body {
          padding: 0 1.25rem 1.25rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .letter-text {
          font-size: 0.88rem; line-height: 1.85;
          color: rgba(255,255,255,0.75);
          white-space: pre-line; margin-top: 1rem;
          font-family: 'Playfair Display', serif;
          font-style: italic;
        }

        .edit-area {
          width: 100%; margin-top: 1rem;
          padding: 1rem; min-height: 160px;
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(233,30,99,0.3);
          border-radius: 14px; color: #fff;
          font-family: 'Playfair Display', serif;
          font-size: 0.88rem; line-height: 1.8;
          font-style: italic; resize: vertical;
          outline: none; transition: border-color 0.2s;
        }
        .edit-area:focus { border-color: rgba(233,30,99,0.6); box-shadow: 0 0 0 3px rgba(233,30,99,0.12); }

        .edit-actions { display: flex; gap: 0.75rem; margin-top: 0.85rem; }
        .save-btn {
          flex: 1; padding: 0.8rem;
          background: linear-gradient(135deg, #880e4f, #e91e63);
          border: none; border-radius: 12px; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .cancel-btn {
          flex: 1; padding: 0.8rem;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px; color: rgba(255,255,255,0.6);
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .cancel-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }

        .loading-wrap {
          display: flex; align-items: center; justify-content: center;
          min-height: 40vh; gap: 0.75rem;
          color: rgba(244,143,177,0.6); font-size: 0.9rem;
        }

        .toast {
          position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
          z-index: 999; padding: 0.75rem 1.25rem; border-radius: 50px;
          font-size: 0.875rem; font-weight: 500; font-family: 'DM Sans', sans-serif;
          white-space: nowrap; animation: toastIn 0.3s ease both;
          max-width: 90vw; text-align: center;
        }
        .toast.success { background: rgba(34,197,94,0.2); border: 1px solid rgba(34,197,94,0.4); color: #86efac; backdrop-filter: blur(10px); }
        .toast.error { background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; backdrop-filter: blur(10px); }
        @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
      `}</style>

      <div className="history-root">
        <nav className="nav">
          <div>
            <div className="nav-title"><span>💌</span><span>Letter History</span></div>
            <div className="nav-count">{letters.length} letter{letters.length !== 1 ? 's' : ''} sent</div>
          </div>
          <button className="back-btn" onClick={() => router.push('/dashboard')}>← Back</button>
        </nav>

        <div className="content">
          {loading && (
            <div className="loading-wrap">
              <span style={{fontSize:'1.5rem', animation:'spin 1s linear infinite'}}>💌</span>
              <span>Loading letters...</span>
            </div>
          )}

          {!loading && letters.length === 0 && (
            <div className="empty">
              <div className="empty-icon">💌</div>
              <div className="empty-title">No letters yet</div>
              <div className="empty-desc">Generate your first love letter from the dashboard!</div>
              <button className="empty-btn" onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </button>
            </div>
          )}

          {!loading && letters.map(letter => (
            <div key={letter.id} className="letter-card">
              <button className="letter-header"
                onClick={() => setExpanded(expanded === letter.id ? null : letter.id)}>
                <div className="letter-meta">
                  <div className="letter-title">
                    Your Daily Love Letter 💌
                    {letter.was_edited && <span className="edited-badge">edited</span>}
                  </div>
                  <div className="letter-date">{formatDate(letter.created_at)}</div>
                </div>
                <div className="letter-actions" onClick={e => e.stopPropagation()}>
                  <span className="status-badge"
                    style={{ background: statusColor[letter.delivery_status] || '#666' }}>
                    {letter.delivery_status || 'pending'}
                  </span>
                  {letter.delivery_status === 'pending' && (
                    <>
                      <button className="action-btn btn-edit" onClick={() => startEdit(letter)}>✏️ Edit</button>
                      <button className={`action-btn btn-send ${sending === letter.id ? 'btn-disabled' : ''}`}
                        onClick={() => sendLetter(letter.id)} disabled={sending === letter.id}>
                        {sending === letter.id ? '...' : '📬 Send'}
                      </button>
                    </>
                  )}
                  <button className="action-btn btn-delete" onClick={() => deleteLetter(letter.id)}>🗑️</button>
                </div>
                <span className="chevron">{expanded === letter.id ? '▲' : '▼'}</span>
              </button>

              {expanded === letter.id && (
                <div className="letter-body">
                  {editingId === letter.id ? (
                    <>
                      <textarea className="edit-area"
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        rows={8} />
                      <div className="edit-actions">
                        <button className="save-btn" onClick={() => saveLetter(letter.id)} disabled={saving}>
                          {saving ? '💫 Saving...' : '💾 Save Changes'}
                        </button>
                        <button className="cancel-btn" onClick={cancelEdit}>✕ Cancel</button>
                      </div>
                    </>
                  ) : (
                    <p className="letter-text">
                      {letter.was_edited ? letter.edited_content : letter.content}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}