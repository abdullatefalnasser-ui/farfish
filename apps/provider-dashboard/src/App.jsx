import { useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const PROVIDER_ID = 'provider-1';

function fetchJson(url, options) {
  return fetch(url, options).then((r) => r.json());
}

function onImgLoad(e) { e.currentTarget.classList.add('loaded'); }

/* ── Icons ── */
const IcGrid = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IcList = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>;
const IcPlus = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>;
const IcX    = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>;

/* ── Sidebar ── */
function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="brand">فرفش</div>
        <div className="sub">Provider Portal</div>
      </div>
      <nav className="sidebar-nav">
        <Link to="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
          <IcGrid /><span>Overview</span>
        </Link>
        <Link to="/listings" className={`nav-link ${pathname === '/listings' ? 'active' : ''}`}>
          <IcGrid /><span>Listings</span>
        </Link>
        <Link to="/bookings" className={`nav-link ${pathname === '/bookings' ? 'active' : ''}`}>
          <IcList /><span>Bookings</span>
        </Link>
      </nav>
      <div className="sidebar-footer">
        <div className="provider-chip">
          <div className="provider-avatar">D</div>
          <div className="provider-info">
            <div className="name">Desert Pulse</div>
            <div className="role">Provider</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ── Overview ── */
function Overview() {
  const [bookings, setBookings] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchJson(`${API_URL}/bookings?provider_id=${PROVIDER_ID}`),
      fetchJson(`${API_URL}/providers/${PROVIDER_ID}/activities`),
    ]).then(([b, a]) => { setBookings(b); setActivities(a); setLoading(false); });
  }, []);

  const revenue = bookings.reduce((s, b) => s + (b.total_price || 0), 0);
  const active  = activities.filter((a) => a.status === 'active').length;
  const recent  = bookings.slice(-5).reverse();

  if (loading) return <div className="page-content"><div className="spinner" /></div>;

  return (
    <div className="page-content">
      <div className="stats-row">
        <div className="stat-box amber">
          <span className="s-label">Revenue</span>
          <span className="s-value">KWD {revenue.toFixed(0)}</span>
        </div>
        <div className="stat-box blue">
          <span className="s-label">Bookings</span>
          <span className="s-value">{bookings.length}</span>
        </div>
        <div className="stat-box green">
          <span className="s-label">Live listings</span>
          <span className="s-value">{active}</span>
        </div>
        <div className="stat-box dark">
          <span className="s-label">Total listings</span>
          <span className="s-value">{activities.length}</span>
        </div>
      </div>

      <div className="section-head"><h2>Recent Bookings</h2></div>
      {recent.length === 0 ? (
        <div className="empty"><h3>No bookings yet</h3><p>Bookings will appear here once customers start reserving your activities.</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Reference</th><th>Date</th><th>Time</th><th>Guests</th><th>Total</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 700 }}>{b.reference_number}</td>
                  <td>{b.date}</td>
                  <td>{b.time_slot}</td>
                  <td>{b.guests}</td>
                  <td style={{ color: 'var(--amber)', fontWeight: 700 }}>KWD {b.total_price?.toFixed(0)}</td>
                  <td><span className={`status-pill ${b.status}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Listings ── */
const CATEGORIES = ['Adventure', 'Outdoor', 'Family', 'Experiences', 'Indoor'];

function Listings() {
  const [activities, setActivities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState('');
  const [form, setForm] = useState({
    name_en: '', name_ar: '', description_en: '', description_ar: '',
    category: 'Adventure', price_per_person: 50, max_capacity: 10,
    photo_url: '',
  });

  useEffect(() => {
    fetchJson(`${API_URL}/providers/${PROVIDER_ID}/activities`).then(setActivities);
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name_en: form.name_en, name_ar: form.name_ar || form.name_en,
      description_en: form.description_en, description_ar: form.description_ar || form.description_en,
      category: form.category,
      price_per_person: Number(form.price_per_person),
      max_capacity: Number(form.max_capacity),
      photos: [form.photo_url || 'https://images.unsplash.com/photo-1607556671927-78a6605e290b?auto=format&fit=crop&w=800&q=80'],
      availability: [
        { date: new Date().toISOString().slice(0, 10), slots: ['10:00', '14:00', '17:00'] },
      ],
    };
    const result = await fetchJson(`${API_URL}/providers/${PROVIDER_ID}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setActivities((prev) => [result, ...prev]);
    setAlert('Listing submitted — pending admin approval.');
    setShowForm(false);
    setSaving(false);
    setForm({ name_en: '', name_ar: '', description_en: '', description_ar: '', category: 'Adventure', price_per_person: 50, max_capacity: 10, photo_url: '' });
    setTimeout(() => setAlert(''), 4000);
  };

  return (
    <div className="page-content">
      {alert && <div className="alert">{alert}</div>}
      <div className="section-head">
        <h2>My Listings ({activities.length})</h2>
        <button className="btn amber" onClick={() => setShowForm(true)}><IcPlus /> &nbsp;Add Listing</button>
      </div>

      {activities.length === 0 ? (
        <div className="empty"><h3>No listings yet</h3><p>Add your first activity to start receiving bookings.</p></div>
      ) : (
        <div className="listings-grid">
          {activities.map((a) => (
            <article key={a.id} className="listing-card">
              <div className="listing-card-photo">
                {a.photos?.[0] && <img src={a.photos[0]} alt={a.name_en} onLoad={onImgLoad} loading="lazy" />}
              </div>
              <div className="listing-card-body">
                <h3>{a.name_en}</h3>
                <p className="meta">{a.category} · KWD {a.price_per_person?.toFixed(0)} / person · {a.max_capacity} max</p>
                <div className="listing-card-footer">
                  <span className={`status-pill ${a.status}`}>{a.status}</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>⭐ {a.rating || '—'}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>New Listing</h2>
              <button className="btn ghost sm" onClick={() => setShowForm(false)}><IcX /></button>
            </div>
            <form onSubmit={submit}>
              <div className="field">
                <label>Activity name (English)</label>
                <input required value={form.name_en} onChange={(e) => set('name_en', e.target.value)} placeholder="e.g. Sunset Kayaking" />
              </div>
              <div className="field">
                <label>Activity name (Arabic)</label>
                <input value={form.name_ar} onChange={(e) => set('name_ar', e.target.value)} placeholder="اختياري" />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea required value={form.description_en} onChange={(e) => set('description_en', e.target.value)} placeholder="Describe the experience..." />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => set('category', e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Price / person (KWD)</label>
                  <input type="number" min="1" required value={form.price_per_person} onChange={(e) => set('price_per_person', e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>Max capacity</label>
                <input type="number" min="1" required value={form.max_capacity} onChange={(e) => set('max_capacity', e.target.value)} />
              </div>
              <div className="field">
                <label>Photo URL (optional)</label>
                <input type="url" value={form.photo_url} onChange={(e) => set('photo_url', e.target.value)} placeholder="https://..." />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn amber" disabled={saving}>{saving ? 'Submitting…' : 'Submit for approval'}</button>
                <button type="button" className="btn ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Bookings ── */
function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson(`${API_URL}/bookings?provider_id=${PROVIDER_ID}`)
      .then((b) => { setBookings(b); setLoading(false); });
  }, []);

  if (loading) return <div className="page-content"><div className="spinner" /></div>;

  return (
    <div className="page-content">
      <div className="section-head">
        <h2>All Bookings ({bookings.length})</h2>
      </div>

      {bookings.length === 0 ? (
        <div className="empty"><h3>No bookings yet</h3><p>When customers book your activities, they'll appear here.</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Reference</th><th>Activity</th><th>Date</th><th>Time</th><th>Guests</th><th>Total</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 700 }}>{b.reference_number}</td>
                  <td style={{ color: 'var(--text2)' }}>{b.activity_id}</td>
                  <td>{b.date}</td>
                  <td>{b.time_slot}</td>
                  <td>{b.guests}</td>
                  <td style={{ color: 'var(--amber)', fontWeight: 700 }}>KWD {b.total_price?.toFixed(0)}</td>
                  <td><span className={`status-pill ${b.status}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── App ── */
export default function App() {
  const location = useLocation();
  const titles = { '/': 'Overview', '/listings': 'My Listings', '/bookings': 'Bookings' };

  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <header className="topbar">
          <div>
            <h1>{titles[location.pathname] || 'Provider Portal'}</h1>
            <div className="sub">Desert Pulse · Kuwait Wave Riders</div>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/bookings" element={<Bookings />} />
        </Routes>
      </div>
    </div>
  );
}
