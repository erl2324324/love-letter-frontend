'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

const PLATFORMS = ['email', 'telegram', 'sms', 'messenger'];
const TIMEZONES = ['UTC', 'Asia/Manila', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo', 'Asia/Singapore'];
const DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export default function SettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    recipient_name: '', recipient_nickname: '', delivery_platform: 'email',
    delivery_address: '', schedule_time: '08:00', schedule_timezone: 'Asia/Manila',
    use_emojis: true, generation_mode: 'romantic', generation_type: 'A',
    personal_details: { memories: '', nicknames: '', inside_jokes: '', how_we_met: '', special_dates: '' }
  });
  const [selectedDays, setSelectedDays] = useState([0,1,2,3,4,5,6]);
  const [scheduleType, setScheduleType] = useState('daily');
  const [specificDate, setSpecificDate] = useState('');
  const [monthlyDay, setMonthlyDay] = useState(1);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('ll_token');
    if (!token) { router.push('/login'); return; }
    api.get('/api/settings').then(r => {
      if (r.data.settings) {
        const s = r.data.settings;
        setForm(prev => ({...prev, ...s, personal_details: s.personal_details || prev.personal_details}));
      }
    }).catch(() => {});
    api.get('/api/automation/status').then(r => {
      if (r.data.days_of_week) setSelectedDays(r.data.days_of_week);
      if (r.data.schedule_type) setScheduleType(r.data.schedule_type);
      if (r.data.specific_date) setSpecificDate(r.data.specific_date.slice(0, 10));
      if (r.data.monthly_day) setMonthlyDay(r.data.monthly_day);
    }).catch(() => {});
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const toggleDay = (val) => {
    setSelectedDays(prev =>
      prev.includes(val) ? prev.filter(d => d !== val) : [...prev, val].sort()
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      const { id, user_id, created_at, updated_at, ...cleanForm } = form;
      await api.put('/api/settings', {
        ...cleanForm,
        schedule_time: cleanForm.schedule_time.slice(0, 5),
        days_of_week: selectedDays,
        schedule_type: scheduleType,
        specific_date: scheduleType === 'once' ? specificDate : null,
        monthly_day: scheduleType === 'monthly' ? monthlyDay : null,
      });
      showToast('✅ Settings saved!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  };

  const testDelivery = async () => {
    setTesting(true);
    try {
      await api.post('/api/settings/test-delivery');
      showToast('💌 Test message sent!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Test failed');
    } finally { setTesting(false); }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-pink-200 focus:outline-none focus:border-pink-400 text-sm bg-white";
  const labelClass = "block text-xs font-semibold mb-1.5 uppercase tracking-wide";

  return (
    <div className="min-h-screen" style={{background:'#fff8f0'}}>
      <header style={{background:'linear-gradient(135deg,#c2185b,#e91e63)'}} className="px-6 py-4 flex justify-between items-center shadow-md">
        <div className="text-white"><h1 className="text-xl font-bold">⚙️ Settings</h1></div>
        <button onClick={() => router.push('/dashboard')} className="text-white text-sm bg-white/20 px-3 py-1.5 rounded-lg">← Back</button>
      </header>

      <div className="max-w-2xl mx-auto p-6 space-y-5">

        {/* Recipient */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
          <h2 className="font-semibold mb-4" style={{color:'#c2185b'}}>💝 Recipient</h2>
          <div className="space-y-3">
            <div>
              <label className={labelClass} style={{color:'#c2185b'}}>Their Name</label>
              <input className={inputClass} placeholder="e.g. Maria" value={form.recipient_name}
                onChange={e => setForm({...form, recipient_name: e.target.value})} />
            </div>
            <div>
              <label className={labelClass} style={{color:'#c2185b'}}>Pet Name / Nickname</label>
              <input className={inputClass} placeholder="e.g. My love, Babe" value={form.recipient_nickname}
                onChange={e => setForm({...form, recipient_nickname: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
          <h2 className="font-semibold mb-4" style={{color:'#c2185b'}}>📬 Delivery</h2>
          <div className="space-y-3">
            <div>
              <label className={labelClass} style={{color:'#c2185b'}}>Platform</label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map(p => (
                  <button key={p} onClick={() => setForm({...form, delivery_platform: p})}
                    className="py-2 rounded-xl text-sm font-medium capitalize transition-all"
                    style={{
                      background: form.delivery_platform === p ? 'linear-gradient(135deg,#c2185b,#e91e63)' : '#fce4ec',
                      color: form.delivery_platform === p ? 'white' : '#c2185b'
                    }}>
                    {p === 'email' ? '📧' : p === 'telegram' ? '💬' : p === 'sms' ? '📱' : '📘'} {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass} style={{color:'#c2185b'}}>
                {form.delivery_platform === 'email' ? 'Email Address' :
                 form.delivery_platform === 'telegram' ? 'Telegram Chat ID' :
                 form.delivery_platform === 'sms' ? 'Phone Number (+63...)' : 'Messenger PSID'}
              </label>
              <input className={inputClass}
                placeholder={form.delivery_platform === 'email' ? 'love@example.com' :
                             form.delivery_platform === 'telegram' ? '123456789' :
                             form.delivery_platform === 'sms' ? '+639XXXXXXXXX' : 'PSID from Messenger'}
                value={form.delivery_address}
                onChange={e => setForm({...form, delivery_address: e.target.value})} />
            </div>
            <button onClick={testDelivery} disabled={testing}
              className="w-full py-2.5 rounded-xl text-sm font-semibold border-2 transition-opacity"
              style={{borderColor:'#e91e63', color:'#e91e63', opacity: testing ? 0.6 : 1}}>
              {testing ? 'Sending test...' : '🧪 Send Test Message'}
            </button>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
          <h2 className="font-semibold mb-4" style={{color:'#c2185b'}}>⏰ Schedule</h2>
          <div className="space-y-4">

            {/* Time & Timezone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} style={{color:'#c2185b'}}>Send Time</label>
                <input type="time" className={inputClass} value={form.schedule_time}
                  onChange={e => setForm({...form, schedule_time: e.target.value})} />
              </div>
              <div>
                <label className={labelClass} style={{color:'#c2185b'}}>Timezone</label>
                <select className={inputClass} value={form.schedule_timezone}
                  onChange={e => setForm({...form, schedule_timezone: e.target.value})}>
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
            </div>

            {/* Schedule Type */}
            <div>
              <label className={labelClass} style={{color:'#c2185b'}}>Schedule Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'daily', label: '📅 Every Day' },
                  { id: 'weekly', label: '📆 Specific Days' },
                  { id: 'monthly', label: '🗓️ Monthly' },
                  { id: 'once', label: '🎯 One-Time Date' },
                ].map(t => (
                  <button key={t.id} onClick={() => setScheduleType(t.id)}
                    className="py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: scheduleType === t.id ? 'linear-gradient(135deg,#c2185b,#e91e63)' : '#fce4ec',
                      color: scheduleType === t.id ? 'white' : '#c2185b'
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly - Days selector */}
            {scheduleType === 'weekly' && (
              <div>
                <label className={labelClass} style={{color:'#c2185b'}}>Days to Send</label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {DAYS.map(d => (
                    <button key={d.value} onClick={() => toggleDay(d.value)}
                      className="w-10 h-10 rounded-full text-xs font-semibold transition-all"
                      style={{
                        background: selectedDays.includes(d.value) ? 'linear-gradient(135deg,#c2185b,#e91e63)' : '#fce4ec',
                        color: selectedDays.includes(d.value) ? 'white' : '#c2185b'
                      }}>
                      {d.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {selectedDays.length === 0 ? 'No days selected' :
                   DAYS.filter(d => selectedDays.includes(d.value)).map(d => d.label).join(', ')}
                </p>
              </div>
            )}

            {/* Monthly - Day of month */}
            {scheduleType === 'monthly' && (
              <div>
                <label className={labelClass} style={{color:'#c2185b'}}>Day of Month</label>
                <select className={inputClass} value={monthlyDay}
                  onChange={e => setMonthlyDay(parseInt(e.target.value))}>
                  {Array.from({length: 28}, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>Every {d}{d===1?'st':d===2?'nd':d===3?'rd':'th'} of the month</option>
                  ))}
                </select>
              </div>
            )}

            {/* Once - Specific date */}
            {scheduleType === 'once' && (
              <div>
                <label className={labelClass} style={{color:'#c2185b'}}>Specific Date</label>
                <input type="date" className={inputClass} value={specificDate}
                  min={new Date().toISOString().slice(0,10)}
                  onChange={e => setSpecificDate(e.target.value)} />
                {specificDate && (
                  <p className="text-xs text-pink-500 mt-1">
                    📅 Will send on {new Date(specificDate + 'T00:00:00').toLocaleDateString('en-PH', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}
                  </p>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
          <h2 className="font-semibold mb-1" style={{color:'#c2185b'}}>💌 Personal Details</h2>
          <p className="text-xs text-gray-400 mb-4">Used for Personalized (Type B) letters</p>
          <div className="space-y-3">
            {[
              { key: 'memories', label: 'Shared Memories', placeholder: 'Our first date at the park...' },
              { key: 'inside_jokes', label: 'Inside Jokes', placeholder: 'The coffee incident...' },
              { key: 'how_we_met', label: 'How We Met', placeholder: 'We met at...' },
              { key: 'special_dates', label: 'Special Dates', placeholder: 'Anniversary: June 1...' },
            ].map(f => (
              <div key={f.key}>
                <label className={labelClass} style={{color:'#c2185b'}}>{f.label}</label>
                <textarea rows={2} className={inputClass} placeholder={f.placeholder}
                  value={form.personal_details[f.key] || ''}
                  onChange={e => setForm({...form, personal_details: {...form.personal_details, [f.key]: e.target.value}})} />
              </div>
            ))}
          </div>
        </div>

        {/* Emoji Toggle */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100 flex justify-between items-center">
          <div>
            <h2 className="font-semibold" style={{color:'#c2185b'}}>Use Emojis</h2>
            <p className="text-xs text-gray-400">Add emojis to letters</p>
          </div>
          <button onClick={() => setForm({...form, use_emojis: !form.use_emojis})}
            className="relative w-14 h-7 rounded-full transition-colors"
            style={{background: form.use_emojis ? '#e91e63' : '#ddd'}}>
            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${form.use_emojis ? 'translate-x-7' : 'translate-x-0.5'}`}/>
          </button>
        </div>

        <button onClick={save} disabled={saving}
          className="w-full py-4 rounded-2xl text-white font-semibold text-lg shadow-lg"
          style={{background:'linear-gradient(135deg,#c2185b,#e91e63)', opacity: saving ? 0.7 : 1}}>
          {saving ? 'Saving...' : '💾 Save Settings'}
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-white text-sm shadow-lg" style={{background:'#333'}}>
          {toast}
        </div>
      )}
    </div>
  );
}