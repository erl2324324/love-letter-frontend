'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import useAppStore from '../../store/useAppStore';

const MODES = [
  { id: 'romantic',      label: 'Romantic',     emoji: '💕' },
  { id: 'sweet',         label: 'Sweet',        emoji: '🍬' },
  { id: 'long-distance', label: 'Long Distance',emoji: '✈️' },
  { id: 'good-morning',  label: 'Good Morning', emoji: '🌅' },
  { id: 'good-night',    label: 'Good Night',   emoji: '🌙' },
  { id: 'anniversary',   label: 'Anniversary',  emoji: '🎂' },
  { id: 'appreciation',  label: 'Appreciation', emoji: '🙏' },
  { id: 'apology',       label: 'Apology',      emoji: '🕊️' },
  { id: 'motivational',  label: 'Motivational', emoji: '⚡' },
  { id: 'surprise',      label: 'Surprise',     emoji: '🎁' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout } = useAppStore();
  const [mode, setMode] = useState('romantic');
  const [genType, setGenType] = useState('A');
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [automation, setAutomation] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    fetchAutomationStatus();
  }, [token]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAutomationStatus = async () => {
    try {
      const { data } = await api.get('/api/automation/status');
      setAutomation(data.enabled);
    } catch {}
  };

  const toggleAutomation = async () => {
    try {
      const endpoint = automation ? '/api/automation/disable' : '/api/automation/enable';
      await api.post(endpoint);
      setAutomation(!automation);
      showToast(automation ? 'Automation paused 💤' : 'Automation enabled! 💌 Letters will be sent daily.');
    } catch {
      showToast('Failed to update automation', 'error');
    }
  };

  const generate = async () => {
    setLoading(true);
    setLetter(null);
    try {
      const { data } = await api.post('/api/letters/generate', {
        mode,
        generation_type: genType,
      });
      setLetter(data.letter);
      setEditContent(data.letter.content);
      setEditing(false);
    } catch {
      showToast('Failed to generate letter. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendLetter = async () => {
    if (!letter) return;
    setSending(true);
    try {
      if (editing) {
        await api.put(`/api/letters/${letter.id}/edit`, { content: editContent });
      }
      await api.post(`/api/letters/${letter.id}/send`);
      showToast('💌 Letter sent with love!');
      setLetter(prev => ({ ...prev, was_sent: true }));
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to send letter', 'error');
    } finally {
      setSending(false);
    }
  };

  const copyLetter = async () => {
    const content = editing ? editContent : letter?.content;
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied to clipboard! 📋');
  };

  const displayContent = editing ? editContent : letter?.content;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }

        .dash-root {
          min-height: 100vh;
          min-height: 100dvh;
          background: #1a0a0f;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
        }

        /* Nav */
        .nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(26,10,15,0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(194,24,91,0.2);
          padding: 0 1rem;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: 'Playfair Display', serif;
          font-size: clamp(1rem, 3vw, 1.2rem);
          color: #f48fb1;
          font-style: italic;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .nav-btn {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          padding: 0.45rem 0.9rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
        }
        .nav-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }

        /* Content */
        .content {
          max-width: 720px;
          margin: 0 auto;
          padding: 1.5rem 1rem 4rem;
        }

        /* Greeting */
        .greeting {
          text-align: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: rgba(194,24,91,0.1);
          border: 1px solid rgba(194,24,91,0.2);
          border-radius: 20px;
        }
        .greeting-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.3rem, 4vw, 1.8rem);
          color: #f48fb1;
          font-style: italic;
        }
        .greeting-sub {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.4);
          margin-top: 0.3rem;
        }

        /* Section */
        .section {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 1.25rem;
          margin-bottom: 1.25rem;
        }
        .section-title {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(244,143,177,0.7);
          font-weight: 600;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Automation toggle */
        .auto-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .auto-info h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
        }
        .auto-info p {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.4);
          margin-top: 0.2rem;
        }
        .toggle {
          flex-shrink: 0;
          width: 52px;
          height: 28px;
          background: rgba(255,255,255,0.1);
          border-radius: 50px;
          cursor: pointer;
          border: none;
          position: relative;
          transition: background 0.3s;
          -webkit-tap-highlight-color: transparent;
        }
        .toggle.on { background: linear-gradient(135deg, #c2185b, #e91e63); }
        .toggle::after {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          width: 22px;
          height: 22px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        .toggle.on::after { transform: translateX(24px); }

        /* Mode grid */
        .mode-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.6rem;
        }
        @media (min-width: 480px) {
          .mode-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 600px) {
          .mode-grid { grid-template-columns: repeat(5, 1fr); }
        }
        .mode-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          padding: 0.75rem 0.5rem;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          color: rgba(255,255,255,0.6);
          -webkit-tap-highlight-color: transparent;
        }
        .mode-btn:hover { background: rgba(194,24,91,0.15); border-color: rgba(194,24,91,0.3); }
        .mode-btn.active {
          background: linear-gradient(135deg, rgba(136,14,79,0.5), rgba(233,30,99,0.3));
          border-color: rgba(233,30,99,0.6);
          color: #fff;
          box-shadow: 0 4px 16px rgba(233,30,99,0.2);
        }
        .mode-emoji { font-size: 1.3rem; }
        .mode-label { font-size: 0.72rem; font-weight: 500; text-align: center; }

        /* Gen type */
        .gen-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .gen-btn {
          padding: 1rem;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          cursor: pointer;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .gen-btn.active {
          background: linear-gradient(135deg, rgba(136,14,79,0.5), rgba(233,30,99,0.3));
          border-color: rgba(233,30,99,0.6);
          box-shadow: 0 4px 16px rgba(233,30,99,0.2);
        }
        .gen-btn-emoji { font-size: 1.4rem; display: block; margin-bottom: 0.3rem; }
        .gen-btn-title { font-size: 0.9rem; font-weight: 600; color: #fff; display: block; }
        .gen-btn-desc { font-size: 0.75rem; color: rgba(255,255,255,0.4); display: block; margin-top: 0.2rem; }

        /* Generate button */
        .generate-btn {
          width: 100%;
          padding: 1.1rem;
          background: linear-gradient(135deg, #880e4f, #c2185b, #e91e63);
          border: none;
          border-radius: 16px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 6px 24px rgba(233,30,99,0.4);
          transition: all 0.2s;
          margin-bottom: 1.25rem;
          letter-spacing: 0.02em;
          -webkit-tap-highlight-color: transparent;
        }
        .generate-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(233,30,99,0.5); }
        .generate-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Letter output */
        .letter-box {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(194,24,91,0.25);
          border-radius: 20px;
          overflow: hidden;
          animation: fadeIn 0.4s ease both;
        }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .letter-header {
          padding: 1rem 1.25rem;
          background: linear-gradient(135deg, rgba(136,14,79,0.4), rgba(194,24,91,0.2));
          border-bottom: 1px solid rgba(194,24,91,0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .letter-meta { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .letter-title {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          color: #f48fb1;
          font-style: italic;
        }
        .badge {
          padding: 0.2rem 0.6rem;
          border-radius: 50px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .badge-mode { background: rgba(233,30,99,0.2); color: #f48fb1; border: 1px solid rgba(233,30,99,0.3); }
        .badge-sent { background: rgba(34,197,94,0.2); color: #86efac; border: 1px solid rgba(34,197,94,0.3); }
        .letter-actions { display: flex; gap: 0.5rem; }
        .icon-btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          font-size: 0.85rem;
          padding: 0.4rem 0.7rem;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .icon-btn:hover { background: rgba(255,255,255,0.14); color: #fff; }
        .icon-btn.active { background: rgba(233,30,99,0.2); color: #f48fb1; border-color: rgba(233,30,99,0.3); }

        .letter-content {
          padding: 1.5rem 1.25rem;
          font-family: 'Playfair Display', serif;
          font-size: clamp(0.9rem, 2.5vw, 1rem);
          line-height: 1.85;
          color: rgba(255,255,255,0.85);
          white-space: pre-wrap;
          min-height: 120px;
        }
        .letter-textarea {
          width: 100%;
          padding: 1.5rem 1.25rem;
          background: transparent;
          border: none;
          outline: none;
          font-family: 'Playfair Display', serif;
          font-size: clamp(0.9rem, 2.5vw, 1rem);
          line-height: 1.85;
          color: rgba(255,255,255,0.85);
          resize: vertical;
          min-height: 200px;
        }

        .letter-footer {
          padding: 1rem 1.25rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .send-btn {
          flex: 1;
          min-width: 140px;
          padding: 0.85rem 1.25rem;
          background: linear-gradient(135deg, #880e4f, #e91e63);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .send-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(233,30,99,0.4); }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .regen-btn {
          padding: 0.85rem 1.25rem;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          color: rgba(255,255,255,0.7);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .regen-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }

        /* Loading */
        .loading-box {
          padding: 3rem 1.5rem;
          text-align: center;
          color: rgba(255,255,255,0.5);
        }
        .loading-heart {
          font-size: 2.5rem;
          animation: heartbeat 0.8s ease-in-out infinite;
          display: block;
          margin-bottom: 0.75rem;
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        /* Toast */
        .toast {
          position: fixed;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 999;
          padding: 0.75rem 1.25rem;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
          animation: toastIn 0.3s ease both;
          max-width: 90vw;
          text-align: center;
        }
        .toast.success { background: rgba(34,197,94,0.2); border: 1px solid rgba(34,197,94,0.4); color: #86efac; backdrop-filter: blur(10px); }
        .toast.error { background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; backdrop-filter: blur(10px); }
        @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
      `}</style>

      <div className="dash-root">
        {/* Nav */}
        <nav className="nav">
          <div className="nav-brand">
            <span>💌</span>
            <span>Love Letter</span>
          </div>
          <div className="nav-actions">
            <button className="nav-btn" onClick={() => router.push('/history')}>📜 History</button>
            <button className="nav-btn" onClick={() => router.push('/settings')}>⚙️ Settings</button>
            <button className="nav-btn" onClick={() => { logout(); router.push('/login'); }}>Exit</button>
          </div>
        </nav>

        <div className="content">
          {/* Greeting */}
          <div className="greeting">
            <h1 className="greeting-title">Good day, {user?.name || 'Sweetheart'} 💕</h1>
            <p className="greeting-sub">Ready to send some love today?</p>
          </div>

          {/* Automation */}
          <div className="section">
            <div className="auto-row">
              <div className="auto-info">
                <h3>⏰ Daily Automation</h3>
                <p>{automation ? 'Letters will be sent automatically every day' : 'Enable to auto-send letters daily'}</p>
              </div>
              <button className={`toggle ${automation ? 'on' : ''}`} onClick={toggleAutomation} aria-label="Toggle automation" />
            </div>
          </div>

          {/* Mode */}
          <div className="section">
            <div className="section-title">✦ Letter Mode</div>
            <div className="mode-grid">
              {MODES.map(m => (
                <button key={m.id} className={`mode-btn ${mode === m.id ? 'active' : ''}`} onClick={() => setMode(m.id)}>
                  <span className="mode-emoji">{m.emoji}</span>
                  <span className="mode-label">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generation style */}
          <div className="section">
            <div className="section-title">✦ Generation Style</div>
            <div className="gen-grid">
              <button className={`gen-btn ${genType === 'A' ? 'active' : ''}`} onClick={() => setGenType('A')}>
                <span className="gen-btn-emoji">✨</span>
                <span className="gen-btn-title">AI Original</span>
                <span className="gen-btn-desc">Fresh creative letter</span>
              </button>
              <button className={`gen-btn ${genType === 'B' ? 'active' : ''}`} onClick={() => setGenType('B')}>
                <span className="gen-btn-emoji">💝</span>
                <span className="gen-btn-title">Personalized</span>
                <span className="gen-btn-desc">Uses your details</span>
              </button>
            </div>
          </div>

          {/* Generate */}
          <button className="generate-btn" onClick={generate} disabled={loading}>
            {loading ? '💫 Crafting your letter...' : '💌 Generate Letter'}
          </button>

          {/* Letter output */}
          {loading && (
            <div className="letter-box">
              <div className="loading-box">
                <span className="loading-heart">💌</span>
                <p>Writing something beautiful for you...</p>
              </div>
            </div>
          )}

          {letter && !loading && (
            <div className="letter-box">
              <div className="letter-header">
                <div className="letter-meta">
                  <span className="letter-title">Your Letter 💌</span>
                  <span className={`badge badge-mode`}>{letter.mode}</span>
                  {letter.was_sent && <span className="badge badge-sent">✓ Sent</span>}
                </div>
                <div className="letter-actions">
                  <button className={`icon-btn ${editing ? 'active' : ''}`} onClick={() => setEditing(!editing)}>
                    {editing ? '👁 View' : '✏️ Edit'}
                  </button>
                  <button className="icon-btn" onClick={copyLetter}>
                    {copied ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
              </div>

              {editing ? (
                <textarea
                  className="letter-textarea"
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                />
              ) : (
                <div className="letter-content">{displayContent}</div>
              )}

              <div className="letter-footer">
                <button className="send-btn" onClick={sendLetter} disabled={sending || letter.was_sent}>
                  {sending ? '💫 Sending...' : letter.was_sent ? '✓ Already Sent' : '📤 Send Now'}
                </button>
                <button className="regen-btn" onClick={generate}>🔄 Regenerate</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
