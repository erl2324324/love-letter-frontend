'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

const PLATFORMS = [
  { id: 'email',     label: 'Email',     emoji: '📧', placeholder: 'recipient@gmail.com' },
  { id: 'telegram',  label: 'Telegram',  emoji: '✈️', placeholder: 'Telegram Chat ID (e.g. 123456789)' },
  { id: 'sms',       label: 'SMS',       emoji: '💬', placeholder: '+63912345678' },
  { id: 'messenger', label: 'Messenger', emoji: '💙', placeholder: 'Facebook PSID (auto-filled when they message your page)' },
];

const TIMEZONES = [
  'Asia/Manila', 'UTC', 'America/New_York', 'America/Los_Angeles',
  'Europe/London', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney',
];

const MODES = [
  { id: 'romantic',      label: 'Romantic',      emoji: '💕' },
  { id: 'sweet',         label: 'Sweet',          emoji: '🍬' },
  { id: 'long-distance', label: 'Long Distance',  emoji: '✈️' },
  { id: 'good-morning',  label: 'Good Morning',   emoji: '🌅' },
  { id: 'good-night',    label: 'Good Night',     emoji: '🌙' },
  { id: 'anniversary',   label: 'Anniversary',    emoji: '🎂' },
  { id: 'appreciation',  label: 'Appreciation',   emoji: '🙏' },
  { id: 'apology',       label: 'Apology',        emoji: '🕊️' },
  { id: 'motivational',  label: 'Motivational',   emoji: '⚡' },
  { id: 'surprise',      label: 'Surprise',       emoji: '🎁' },
];

const DAYS = [
  {l:'Sun',v:0},{l:'Mon',v:1},{l:'Tue',v:2},{l:'Wed',v:3},
  {l:'Thu',v:4},{l:'Fri',v:5},{l:'Sat',v:6}
];

const SCHEDULE_TYPES = [
  { id: 'daily',   label: '📅 Every Day' },
  { id: 'weekly',  label: '📆 Specific Days' },
  { id: 'monthly', label: '🗓️ Monthly' },
  { id: 'once',    label: '🎯 One-Time' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    recipient_name: '',
    recipient_nickname: '',
    delivery_platform: 'email',
    delivery_address: '',
    schedule_time: '08:00',
    schedule_timezone: 'Asia/Manila',
    schedule_type: 'daily',
    days_of_week: [0,1,2,3,4,5,6],
    specific_date: '',
    monthly_day: 1,
    use_emojis: true,
    generation_mode: 'romantic',
    generation_type: 'A',
    personal_details: {
      memories: '', nicknames: '', inside_jokes: '', how_we_met: '', special_dates: ''
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchSettings(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/api/settings');
      const s = data.settings;
      setForm({
        recipient_name: s.recipient_name || '',
        recipient_nickname: s.recipient_nickname || '',
        delivery_platform: s.delivery_platform || 'email',
        delivery_address: s.delivery_address || '',
        schedule_time: s.schedule_time?.slice(0,5) || '08:00',
        schedule_timezone: s.schedule_timezone || 'Asia/Manila',
        schedule_type: s.schedule_type || 'daily',
        days_of_week: s.days_of_week || [0,1,2,3,4,5,6],
        specific_date: s.specific_date?.slice(0,10) || '',
        monthly_day: s.monthly_day || 1,
        use_emojis: s.use_emojis ?? true,
        generation_mode: s.generation_mode || 'romantic',
        generation_type: s.generation_type || 'A',
        personal_details: s.personal_details || {
          memories: '', nicknames: '', inside_jokes: '', how_we_met: '', special_dates: ''
        },
      });
    } catch {}
    finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/api/settings', form);
      showToast('✅ Settings saved!');
    } catch {
      showToast('Failed to save settings', 'error');
    } finally { setSaving(false); }
  };

  const testDelivery = async () => {
    setTesting(true);
    try {
      await api.post('/api/settings/test-delivery');
      showToast('💌 Test message sent! Check your ' + form.delivery_platform);
    } catch (err) {
      showToast(err.response?.data?.error || 'Test failed', 'error');
    } finally { setTesting(false); }
  };

  const toggleDay = (val) => {
    const days = form.days_of_week || [];
    setForm({
      ...form,
      days_of_week: days.includes(val)
        ? days.filter(x => x !== val)
        : [...days, val].sort()
    });
  };

  const currentPlatform = PLATFORMS.find(p => p.id === form.delivery_platform);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#1a0a0f', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontSize:'2rem' }}>💌</span>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        .settings-root {
          min-height: 100vh;
          background: #1a0a0f;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          padding-bottom: 5rem;
        }
        .nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(26,10,15,0.9);
          backdrop-filter: blur(16px);
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
        .back-btn {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          padding: 0.45rem 0.9rem; border-radius: 50px;
          font-size: 0.8rem; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
        }
        .back-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .content {
          max-width: 680px; margin: 0 auto;
          padding: 1.5rem 1rem;
          display: flex; flex-direction: column; gap: 1.25rem;
        }
        .section {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 1.25rem;
        }
        .section-title {
          font-size: 0.7rem; text-transform: uppercase;
          letter-spacing: 0.12em; color: rgba(244,143,177,0.7);
          font-weight: 600; margin-bottom: 1rem;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .field { margin-bottom: 1rem; }
        .field:last-child { margin-bottom: 0; }
        .field label {
          display: block; font-size: 0.72rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: rgba(244,143,177,0.7); margin-bottom: 0.5rem;
        }
        .field input, .field select, .field textarea {
          width: 100%; padding: 0.85rem 1rem;
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 12px; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
          transition: all 0.2s; outline: none;
          -webkit-appearance: none;
        }
        .field input::placeholder, .field textarea::placeholder { color: rgba(255,255,255,0.25); }
        .field input:focus, .field select:focus, .field textarea:focus {
          border-color: rgba(233,30,99,0.5);
          background: rgba(255,255,255,0.1);
          box-shadow: 0 0 0 3px rgba(233,30,99,0.12);
        }
        .field select option { background: #2d0a18; color: #fff; }
        .field textarea { resize: vertical; min-height: 80px; line-height: 1.6; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        @media (max-width: 400px) { .two-col { grid-template-columns: 1fr; } }
        .platform-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.6rem;
          margin-bottom: 1rem;
        }
        @media (min-width: 480px) { .platform-grid { grid-template-columns: repeat(4, 1fr); } }
        .platform-btn {
          display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
          padding: 0.75rem 0.5rem;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 12px; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          color: rgba(255,255,255,0.5);
          transition: all 0.2s;
        }
        .platform-btn.active {
          background: linear-gradient(135deg, rgba(136,14,79,0.5), rgba(233,30,99,0.3));
          border-color: rgba(233,30,99,0.6); color: #fff;
        }
        .platform-emoji { font-size: 1.3rem; }
        .platform-label { font-size: 0.72rem; font-weight: 500; }
        .schedule-type-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.6rem;
          margin-top: 0.5rem;
        }
        .schedule-type-btn {
          padding: 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 12px; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          color: rgba(255,255,255,0.5);
          font-size: 0.82rem; font-weight: 500;
          transition: all 0.2s; text-align: center;
        }
        .schedule-type-btn.active {
          background: linear-gradient(135deg, rgba(136,14,79,0.5), rgba(233,30,99,0.3));
          border-color: rgba(233,30,99,0.6); color: #fff;
        }
        .days-grid {
          display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;
        }
        .day-btn {
          width: 42px; height: 42px; border-radius: 50%;
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.4);
          font-size: 0.72rem; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .day-btn.active {
          background: linear-gradient(135deg,#c2185b,#e91e63);
          border-color: #e91e63; color: #fff;
        }
        .mode-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;
        }
        @media (min-width: 400px) { .mode-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 560px) { .mode-grid { grid-template-columns: repeat(5, 1fr); } }
        .mode-btn {
          display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
          padding: 0.65rem 0.4rem;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 12px; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          color: rgba(255,255,255,0.5); transition: all 0.2s;
        }
        .mode-btn.active {
          background: linear-gradient(135deg, rgba(136,14,79,0.5), rgba(233,30,99,0.3));
          border-color: rgba(233,30,99,0.6); color: #fff;
        }
        .mode-emoji { font-size: 1.1rem; }
        .mode-label { font-size: 0.68rem; font-weight: 500; text-align: center; }
        .toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.5rem 0;
        }
        .toggle-info span { font-size: 0.9rem; color: #fff; font-weight: 500; }
        .toggle-info p { font-size: 0.78rem; color: rgba(255,255,255,0.4); margin-top: 0.15rem; }
        .toggle {
          flex-shrink: 0; width: 48px; height: 26px;
          background: rgba(255,255,255,0.1);
          border-radius: 50px; cursor: pointer; border: none;
          position: relative; transition: background 0.3s;
        }
        .toggle.on { background: linear-gradient(135deg, #c2185b, #e91e63); }
        .toggle::after {
          content: ''; position: absolute; top: 3px; left: 3px;
          width: 20px; height: 20px; background: #fff; border-radius: 50%;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        .toggle.on::after { transform: translateX(22px); }
        .gen-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .gen-btn {
          padding: 0.9rem; background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 12px; cursor: pointer; text-align: left;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .gen-btn.active {
          background: linear-gradient(135deg, rgba(136,14,79,0.5), rgba(233,30,99,0.3));
          border-color: rgba(233,30,99,0.6);
        }
        .gen-emoji { font-size: 1.2rem; display: block; margin-bottom: 0.25rem; }
        .gen-title { font-size: 0.85rem; font-weight: 600; color: #fff; display: block; }
        .gen-desc { font-size: 0.72rem; color: rgba(255,255,255,0.4); display: block; margin-top: 0.15rem; }
        .save-btn {
          width: 100%; padding: 1rem;
          background: linear-gradient(135deg, #880e4f, #c2185b, #e91e63);
          border: none; border-radius: 14px; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 600;
          cursor: pointer; box-shadow: 0 6px 24px rgba(233,30,99,0.35);
          transition: all 0.2s;
        }
        .save-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .test-btn {
          width: 100%; padding: 0.9rem;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px; color: rgba(255,255,255,0.7);
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500;
          cursor: pointer; transition: all 0.2s; margin-top: 0.75rem;
        }
        .test-btn:hover:not(:disabled) { background: rgba(255,255,255,0.12); color: #fff; }
        .test-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .about-card {
          background: linear-gradient(135deg, rgba(136,14,79,0.2), rgba(194,24,91,0.1));
          border: 1px solid rgba(194,24,91,0.25);
          border-radius: 20px; padding: 1.5rem; text-align: center;
        }
        .about-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(244,143,177,0.6); font-weight: 600; }
        .about-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem; color: #f48fb1; font-style: italic; margin: 0.4rem 0;
        }
        .about-desc { font-size: 0.82rem; color: rgba(255,255,255,0.45); line-height: 1.7; }
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
        .date-input::-webkit-calendar-picker-indicator { filter: invert(1); }
      `}</style>

      <div className="settings-root">
        <nav className="nav">
          <div className="nav-title"><span>⚙️</span><span>Settings</span></div>
          <button className="back-btn" onClick={() => router.push('/dashboard')}>← Back</button>
        </nav>

        <div className="content">

          {/* Recipient */}
          <div className="section">
            <div className="section-title">💕 Recipient</div>
            <div className="two-col">
              <div className="field">
                <label>Their Name</label>
                <input type="text" placeholder="e.g. Angel Maven"
                  value={form.recipient_name}
                  onChange={e => setForm({...form, recipient_name: e.target.value})} />
              </div>
              <div className="field">
                <label>Nickname / Pet Name</label>
                <input type="text" placeholder="e.g. ybeb, babe"
                  value={form.recipient_nickname}
                  onChange={e => setForm({...form, recipient_nickname: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="section">
            <div className="section-title">📬 Delivery</div>
            <div className="platform-grid">
              {PLATFORMS.map(p => (
                <button key={p.id} className={`platform-btn ${form.delivery_platform === p.id ? 'active' : ''}`}
                  onClick={() => setForm({...form, delivery_platform: p.id})}>
                  <span className="platform-emoji">{p.emoji}</span>
                  <span className="platform-label">{p.label}</span>
                </button>
              ))}
            </div>
            <div className="field">
              <label>{currentPlatform?.label} Address</label>
              <input type="text" placeholder={currentPlatform?.placeholder || ''}
                value={form.delivery_address}
                onChange={e => setForm({...form, delivery_address: e.target.value})} />
            </div>
          </div>

          {/* Schedule */}
          <div className="section">
            <div className="section-title">⏰ Schedule</div>

            {/* Time & Timezone */}
            <div className="two-col" style={{marginBottom:'1rem'}}>
              <div className="field">
                <label>Send Time</label>
                <input type="time" value={form.schedule_time}
                  onChange={e => setForm({...form, schedule_time: e.target.value})} />
              </div>
              <div className="field">
                <label>Timezone</label>
                <select value={form.schedule_timezone}
                  onChange={e => setForm({...form, schedule_timezone: e.target.value})}>
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
            </div>

            {/* Schedule Type */}
            <div className="field">
              <label>Schedule Type</label>
              <div className="schedule-type-grid">
                {SCHEDULE_TYPES.map(t => (
                  <button key={t.id}
                    className={`schedule-type-btn ${form.schedule_type === t.id ? 'active' : ''}`}
                    onClick={() => setForm({...form, schedule_type: t.id})}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly - Days */}
            {form.schedule_type === 'weekly' && (
              <div className="field">
                <label>Days to Send</label>
                <div className="days-grid">
                  {DAYS.map(d => (
                    <button key={d.v}
                      className={`day-btn ${(form.days_of_week || []).includes(d.v) ? 'active' : ''}`}
                      onClick={() => toggleDay(d.v)}>
                      {d.l}
                    </button>
                  ))}
                </div>
                <p style={{fontSize:'0.75rem', color:'rgba(255,255,255,0.3)', marginTop:'0.5rem'}}>
                  {(form.days_of_week || []).length === 0 ? 'No days selected' :
                   DAYS.filter(d => (form.days_of_week || []).includes(d.v)).map(d => d.l).join(', ')}
                </p>
              </div>
            )}

            {/* Monthly */}
            {form.schedule_type === 'monthly' && (
              <div className="field">
                <label>Day of Month</label>
                <select value={form.monthly_day || 1}
                  onChange={e => setForm({...form, monthly_day: parseInt(e.target.value)})}>
                  {Array.from({length:28},(_,i)=>i+1).map(d => (
                    <option key={d} value={d} style={{background:'#2d0a18'}}>
                      Every {d}{d===1?'st':d===2?'nd':d===3?'rd':'th'} of the month
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Once */}
            {form.schedule_type === 'once' && (
              <div className="field">
                <label>Specific Date</label>
                <input type="date" className="date-input"
                  value={form.specific_date || ''}
                  min={new Date().toISOString().slice(0,10)}
                  onChange={e => setForm({...form, specific_date: e.target.value})} />
                {form.specific_date && (
                  <p style={{fontSize:'0.75rem', color:'#f48fb1', marginTop:'0.4rem'}}>
                    📅 Will send on {new Date(form.specific_date + 'T00:00:00').toLocaleDateString('en-PH', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Letter Preferences */}
          <div className="section">
            <div className="section-title">✍️ Letter Preferences</div>
            <div style={{marginBottom:'1rem'}}>
              <div style={{fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(244,143,177,0.7)', fontWeight:600, marginBottom:'0.75rem'}}>
                Default Mode
              </div>
              <div className="mode-grid">
                {MODES.map(m => (
                  <button key={m.id} className={`mode-btn ${form.generation_mode === m.id ? 'active' : ''}`}
                    onClick={() => setForm({...form, generation_mode: m.id})}>
                    <span className="mode-emoji">{m.emoji}</span>
                    <span className="mode-label">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="gen-grid" style={{marginBottom:'1rem'}}>
              <button className={`gen-btn ${form.generation_type === 'A' ? 'active' : ''}`}
                onClick={() => setForm({...form, generation_type: 'A'})}>
                <span className="gen-emoji">✨</span>
                <span className="gen-title">AI Original</span>
                <span className="gen-desc">Fresh creative letter</span>
              </button>
              <button className={`gen-btn ${form.generation_type === 'B' ? 'active' : ''}`}
                onClick={() => setForm({...form, generation_type: 'B'})}>
                <span className="gen-emoji">💝</span>
                <span className="gen-title">Personalized</span>
                <span className="gen-desc">Uses your details</span>
              </button>
            </div>
            <div className="toggle-row">
              <div className="toggle-info">
                <span>Use Emojis 💕</span>
                <p>Add emojis in generated letters</p>
              </div>
              <button className={`toggle ${form.use_emojis ? 'on' : ''}`}
                onClick={() => setForm({...form, use_emojis: !form.use_emojis})} />
            </div>
          </div>

          {/* Personal Details */}
          <div className="section">
            <div className="section-title">💌 Personal Details (for Personalized mode)</div>
            {[
              { key: 'memories',     label: 'Memories',     placeholder: 'Our first date at the park...' },
              { key: 'inside_jokes', label: 'Inside Jokes',  placeholder: 'That time we got lost looking for coffee...' },
              { key: 'how_we_met',   label: 'How We Met',    placeholder: 'We met at school in 2022...' },
              { key: 'special_dates',label: 'Special Dates', placeholder: 'Anniversary: June 14, her birthday: Dec 25...' },
            ].map(f => (
              <div className="field" key={f.key}>
                <label>{f.label}</label>
                <textarea placeholder={f.placeholder} rows={2}
                  value={form.personal_details?.[f.key] || ''}
                  onChange={e => setForm({
                    ...form,
                    personal_details: {...form.personal_details, [f.key]: e.target.value}
                  })} />
              </div>
            ))}
          </div>

          {/* Save & Test */}
          <div>
            <button className="save-btn" onClick={save} disabled={saving}>
              {saving ? '💫 Saving...' : '💾 Save Settings'}
            </button>
            <button className="test-btn" onClick={testDelivery} disabled={testing}>
              {testing ? '💫 Sending...' : `🧪 Send Test Message via ${form.delivery_platform}`}
            </button>
          </div>

          {/* About */}
          <div className="about-card">
            <p className="about-label">💌 Made with love by</p>
            <p className="about-name">Erl Lourence Sabulbero</p>
            <p className="about-desc">
              "I built this app for my girlfriend because I wanted her to wake up every single day
              knowing how deeply I love her — so I automated it, just for her." 🌹
            </p>
          </div>

        </div>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}