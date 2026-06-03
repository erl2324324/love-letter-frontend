'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import useAppStore from '../../store/useAppStore';
import { useRouter } from 'next/navigation';

const HEARTS = ['💕','💖','💗','💓','💝','💌','🌹','✨','💫','🌸'];

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setUser, setToken } = useAppStore();
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const { data } = await api.post(endpoint, form);
      setToken(data.token);
      setUser(data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: #1a0a0f;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Animated background */
        .bg-glow {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .bg-glow::before {
          content: '';
          position: absolute;
          top: -20%;
          left: -20%;
          width: 70%;
          height: 70%;
          background: radial-gradient(circle, rgba(194,24,91,0.3) 0%, transparent 70%);
          animation: drift1 8s ease-in-out infinite alternate;
        }
        .bg-glow::after {
          content: '';
          position: absolute;
          bottom: -20%;
          right: -20%;
          width: 60%;
          height: 60%;
          background: radial-gradient(circle, rgba(136,14,79,0.25) 0%, transparent 70%);
          animation: drift2 10s ease-in-out infinite alternate;
        }
        @keyframes drift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(5%,5%) scale(1.1); } }
        @keyframes drift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-5%,-5%) scale(1.15); } }

        /* Floating hearts */
        .heart-float {
          position: fixed;
          pointer-events: none;
          z-index: 0;
          animation: floatUp linear infinite;
          opacity: 0;
        }
        @keyframes floatUp {
          0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-10vh) scale(1); opacity: 0; }
        }

        /* Card */
        .card {
          width: 100%;
          max-width: 480px;
          position: relative;
          z-index: 10;
          animation: cardIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .card-inner {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(194,24,91,0.15) inset;
        }

        /* Header */
        .card-header {
          padding: 2.5rem 2rem 2rem;
          text-align: center;
          background: linear-gradient(160deg, rgba(194,24,91,0.4) 0%, rgba(136,14,79,0.2) 100%);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          position: relative;
        }
        .envelope {
          font-size: clamp(3rem, 10vw, 5rem);
          display: block;
          animation: envelopePulse 3s ease-in-out infinite;
          filter: drop-shadow(0 0 20px rgba(233,30,99,0.6));
        }
        @keyframes envelopePulse {
          0%, 100% { transform: scale(1) rotate(-3deg); }
          50% { transform: scale(1.08) rotate(3deg); }
        }
        .card-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.6rem, 5vw, 2.2rem);
          color: #fff;
          margin-top: 0.75rem;
          font-style: italic;
          text-shadow: 0 2px 20px rgba(233,30,99,0.4);
        }
        .card-subtitle {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.55);
          margin-top: 0.4rem;
          letter-spacing: 0.05em;
        }

        /* Form area */
        .card-body {
          padding: 2rem 2rem 1.5rem;
        }

        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.2rem, 4vw, 1.5rem);
          color: #f48fb1;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .error-box {
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          font-size: 0.85rem;
          color: #fca5a5;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .field {
          margin-bottom: 1.1rem;
        }
        .field label {
          display: block;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(244,143,177,0.8);
          margin-bottom: 0.5rem;
        }
        .field input {
          width: 100%;
          padding: 0.9rem 1.1rem;
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          transition: all 0.2s;
          outline: none;
          -webkit-appearance: none;
        }
        .field input::placeholder { color: rgba(255,255,255,0.3); }
        .field input:focus {
          border-color: rgba(233,30,99,0.6);
          background: rgba(255,255,255,0.1);
          box-shadow: 0 0 0 3px rgba(233,30,99,0.15);
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          border: none;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(135deg, #880e4f, #c2185b, #e91e63);
          box-shadow: 0 4px 20px rgba(233,30,99,0.4);
          transition: all 0.2s;
          letter-spacing: 0.02em;
          margin-top: 0.5rem;
          -webkit-tap-highlight-color: transparent;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(233,30,99,0.5);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .submit-btn:disabled {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.3);
          cursor: not-allowed;
          box-shadow: none;
        }

        .toggle-text {
          text-align: center;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.4);
          margin-top: 1.25rem;
        }
        .toggle-btn {
          background: none;
          border: none;
          color: #f48fb1;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          padding: 0;
          -webkit-tap-highlight-color: transparent;
        }
        .toggle-btn:hover { color: #fff; }

        /* About footer */
        .card-footer {
          margin: 0 2rem 2rem;
          padding: 1.25rem;
          background: rgba(194,24,91,0.12);
          border: 1px solid rgba(194,24,91,0.2);
          border-radius: 16px;
          text-align: center;
        }
        .footer-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(244,143,177,0.6);
          font-weight: 600;
          margin-bottom: 0.3rem;
        }
        .footer-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem;
          color: #f48fb1;
          font-style: italic;
        }
        .footer-desc {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.4);
          line-height: 1.6;
          margin-top: 0.5rem;
        }

        .tagline {
          margin-top: 1.5rem;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.2);
          text-align: center;
          letter-spacing: 0.08em;
          position: relative;
          z-index: 10;
        }

        /* Responsive */
        @media (max-width: 400px) {
          .card-body { padding: 1.5rem 1.25rem 1rem; }
          .card-header { padding: 2rem 1.25rem 1.5rem; }
          .card-footer { margin: 0 1.25rem 1.5rem; }
        }
        @media (min-width: 768px) {
          .card { max-width: 520px; }
          .card-body { padding: 2.5rem 2.5rem 1.5rem; }
          .card-header { padding: 3rem 2.5rem 2.5rem; }
          .card-footer { margin: 0 2.5rem 2.5rem; }
        }
      `}</style>

      <div className="login-root">
        {/* Animated background */}
        <div className="bg-glow" />

        {/* Floating hearts */}
        {mounted && HEARTS.map((h, i) => (
          <span key={i} className="heart-float" style={{
            left: `${5 + i * 9}%`,
            fontSize: `${0.8 + (i % 4) * 0.4}rem`,
            animationDuration: `${8 + i * 1.5}s`,
            animationDelay: `${i * 0.8}s`,
          }}>{h}</span>
        ))}

        {/* Card */}
        <div className="card">
          <div className="card-inner">
            {/* Header */}
            <div className="card-header">
              <span className="envelope">💌</span>
              <h1 className="card-title">Daily Love Letter</h1>
              <p className="card-subtitle">Send love, every single day</p>
            </div>

            {/* Form */}
            <div className="card-body">
              <h2 className="form-title">
                {isRegister ? '✨ Create Account' : '💖 Welcome Back'}
              </h2>

              {error && (
                <div className="error-box">
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handle}>
                {isRegister && (
                  <div className="field">
                    <label>Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Juan dela Cruz"
                      required
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      autoComplete="name"
                    />
                  </div>
                )}
                <div className="field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    autoComplete="email"
                  />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                  />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? '💫 Please wait...' : isRegister ? '✨ Create Account' : '💖 Sign In'}
                </button>
              </form>

              <p className="toggle-text">
                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                <button className="toggle-btn" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                  {isRegister ? 'Sign In' : 'Register Now'}
                </button>
              </p>
            </div>

            {/* About footer */}
            <div className="card-footer">
              <p className="footer-label">💌 Made with love by</p>
              <p className="footer-name">Erl Lourence Sabulbero</p>
              <p className="footer-desc">
                "I built this app for my girlfriend because I wanted her to wake up every single day
                knowing how deeply I love her — so I automated it, just for her." 🌹
              </p>
            </div>
          </div>
        </div>

        <p className="tagline">💕 Spreading love, one letter at a time</p>
      </div>
    </>
  );
}
