import { useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function fetchJson(url, options) {
  return fetch(url, options).then((r) => r.json());
}

/* ── Icons ── */
const IcGrid    = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IcUsers   = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const IcList    = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>;
const IcActivity= () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IcCheck   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;

/* ── Sidebar ── */
function Sidebar() {
  const { pathname } = useLocation();
  const links = [
    { to: '/',           label: 'Overview',   icon: <IcGrid /> },
    { to: '/providers',  label: 'Providers',  icon: <IcUsers /> },
    { to: '/activities', label: 'Activities', icon: <IcActivity /> },
    { to: '/bookings',   label: 'Bookings',   icon: <IcList /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="brand">فرفش</div>
        <div className="sub">Admin Panel</div>
      </div>
      <nav className="sidebar-nav">
        {links.map(({ to, label, icon }) => (
          <Link key={to} to={to} className={`nav-link ${pathname === to ? 'active' : ''}`}>
            {icon}<span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="admin-chip">
          <div className="admin-avatar">A</div>
          <div className="admin-info">
            <div className="name">Admin</div>
            <div className="role">Platform Owner</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ── Overview ── */
function Overview() {
  const [metrics, setMetrics] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchJson(`${API_URL}/admin/metrics`).then(setMetrics);
    fetchJson(`${API_URL}/bookings`).then((b) => setBookings(b.slice(-6).reverse()));
  }, []);

  if (!metrics) return <div className="page-content"><div className="spinner" /></div>;

  return (
    <div className="page-content">
      <div className="stats-row">
        <div className="stat-box amber">
          <span className="s-label">Commission</span>
          <span className="s-value">KWD {metrics.commission?.toFixed(0)}</span>
        </div>
        <div className="stat-box blue">
          <span className="s-label">Total bookings</span>
          <span className="s-value">{metrics.totalBookings}</span>
        </div>
        <div className="stat-box green">
          <span className="s-label">Providers</span>
          <span className="s-value">{metrics.totalProviders}</span>
        </div>
        <div className="stat-box dark">
          <span className="s-label">Users</span>
          <span className="s-value">{metrics.totalUsers}</span>
        </div>
      </div>

      <div className="section-head"><h2>Recent Bookings</h2></div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Reference</th><th>Activity</th><th>Date</th><th>Guests</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td style={{ fontWeight: 700 }}>{b.reference_number}</td>
                <td style={{ color: 'var(--text2)' }}>{b.activity_id}</td>
                <td>{b.date}</td>
                <td>{b.guests}</td>
                <td style={{ color: 'var(--amber)', fontWeight: 700 }}>KWD {b.total_price?.toFixed(0)}</td>
                <td><span className={`status-pill ${b.status}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Providers ── */
function Providers() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson(`${API_URL}/providers`).then((p) => { setProviders(p); setLoading(false); });
  }, []);

  const approve = async (id) => {
    await fetchJson(`${API_URL}/providers/${id}/approve`, { method: 'POST' });
    setProviders((prev) => prev.map((p) => p.id === id ? { ...p, status: 'approved' } : p));
  };

  if (loading) return <div className="page-content"><div className="spinner" /></div>;

  const pending  = providers.filter((p) => p.status === 'pending');
  const approved = providers.filter((p) => p.status === 'approved');

  return (
    <div className="page-content">
      {pending.length > 0 && (
        <>
          <div className="section-head">
            <h2>Pending Approval ({pending.length})</h2>
          </div>
          <div className="providers-grid" style={{ marginBottom: '2rem' }}>
            {pending.map((p) => (
              <article key={p.id} className="provider-card">
                <div className="provider-card-head">
                  <div className="provider-icon" style={{ background: 'var(--amber)', color: '#000' }}>
                    {p.business_name[0]}
                  </div>
                  <div>
                    <h3>{p.business_name}</h3>
                    <div className="cat">{p.category}</div>
                  </div>
                </div>
                <p className="contact">{p.contact_name} · {p.email}</p>
                <div className="provider-card-footer">
                  <span className="status-pill pending">Pending</span>
                  <button className="btn green sm" onClick={() => approve(p.id)}>
                    <IcCheck /> &nbsp;Approve
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <div className="section-head"><h2>Approved Providers ({approved.length})</h2></div>
      <div className="providers-grid">
        {approved.map((p) => (
          <article key={p.id} className="provider-card">
            <div className="provider-card-head">
              <div className="provider-icon">{p.business_name[0]}</div>
              <div>
                <h3>{p.business_name}</h3>
                <div className="cat">{p.category}</div>
              </div>
            </div>
            <p className="contact">{p.contact_name} · {p.email}</p>
            <div className="provider-card-footer">
              <span className="status-pill approved">Approved</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{(p.commission_rate * 100).toFixed(0)}% commission</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ── Activities ── */
function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson(`${API_URL}/activities`).then((a) => { setActivities(a); setLoading(false); });
  }, []);

  if (loading) return <div className="page-content"><div className="spinner" /></div>;

  return (
    <div className="page-content">
      <div className="section-head"><h2>All Activities ({activities.length})</h2></div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Category</th><th>Provider</th><th>Price</th><th>Capacity</th><th>Rating</th><th>Status</th></tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.id}>
                <td style={{ fontWeight: 700 }}>{a.name_en}</td>
                <td style={{ color: 'var(--text2)' }}>{a.category}</td>
                <td style={{ color: 'var(--text2)' }}>{a.provider_id}</td>
                <td style={{ color: 'var(--amber)', fontWeight: 700 }}>KWD {a.price_per_person?.toFixed(0)}</td>
                <td>{a.max_capacity}</td>
                <td>⭐ {a.rating || '—'}</td>
                <td><span className={`status-pill ${a.status}`}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Bookings ── */
function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson(`${API_URL}/bookings`).then((b) => { setBookings(b); setLoading(false); });
  }, []);

  if (loading) return <div className="page-content"><div className="spinner" /></div>;

  const totalRev = bookings.reduce((s, b) => s + (b.total_price || 0), 0);
  const totalComm = bookings.reduce((s, b) => s + (b.commission || 0), 0);

  return (
    <div className="page-content">
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: '1.5rem' }}>
        <div className="stat-box amber">
          <span className="s-label">Total revenue</span>
          <span className="s-value">KWD {totalRev.toFixed(0)}</span>
        </div>
        <div className="stat-box blue">
          <span className="s-label">Commission earned</span>
          <span className="s-value">KWD {totalComm.toFixed(0)}</span>
        </div>
        <div className="stat-box dark">
          <span className="s-label">Total bookings</span>
          <span className="s-value">{bookings.length}</span>
        </div>
      </div>

      <div className="section-head"><h2>All Bookings</h2></div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Reference</th><th>User</th><th>Activity</th><th>Date</th><th>Guests</th><th>Total</th><th>Commission</th><th>Status</th></tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td style={{ fontWeight: 700 }}>{b.reference_number}</td>
                <td style={{ color: 'var(--text2)' }}>{b.user_id}</td>
                <td style={{ color: 'var(--text2)' }}>{b.activity_id}</td>
                <td>{b.date} {b.time_slot}</td>
                <td>{b.guests}</td>
                <td style={{ color: 'var(--amber)', fontWeight: 700 }}>KWD {b.total_price?.toFixed(0)}</td>
                <td style={{ color: 'var(--green)', fontWeight: 700 }}>KWD {b.commission?.toFixed(2)}</td>
                <td><span className={`status-pill ${b.status}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── App ── */
export default function App() {
  const location = useLocation();
  const titles = { '/': 'Overview', '/providers': 'Providers', '/activities': 'Activities', '/bookings': 'All Bookings' };

  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <header className="topbar">
          <div>
            <h1>{titles[location.pathname] || 'Admin'}</h1>
            <div className="sub">Farfish Platform · Admin Control</div>
          </div>
        </header>
        <Routes>
          <Route path="/"           element={<Overview />} />
          <Route path="/providers"  element={<Providers />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/bookings"   element={<Bookings />} />
        </Routes>
      </div>
    </div>
  );
}
