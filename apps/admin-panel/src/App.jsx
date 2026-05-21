import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function fetchJson(url, options) {
  return fetch(url, options).then((res) => res.json());
}

function Dashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchJson(`${API_URL}/admin/metrics`).then(setMetrics);
  }, []);

  if (!metrics) return <main className="layout">Loading metrics…</main>;

  return (
    <main className="layout">
      <h1>Admin Panel</h1>
      <p>Overview of users, providers, bookings, and commission.</p>
      <div className="stats-grid">
        <div className="stat-card">
          <p>Users</p>
          <strong>{metrics.totalUsers}</strong>
        </div>
        <div className="stat-card">
          <p>Providers</p>
          <strong>{metrics.totalProviders}</strong>
        </div>
        <div className="stat-card">
          <p>Bookings</p>
          <strong>{metrics.totalBookings}</strong>
        </div>
        <div className="stat-card">
          <p>Commission</p>
          <strong>KW D {metrics.commission.toFixed(0)}</strong>
        </div>
      </div>
      <nav className="dashboard-nav">
        <Link to="/providers" className="button">Providers</Link>
        <Link to="/bookings" className="button secondary">Bookings</Link>
      </nav>
    </main>
  );
}

function Providers() {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    fetchJson(`${API_URL}/providers`).then(setProviders);
  }, []);

  const approve = async (id) => {
    await fetchJson(`${API_URL}/providers/${id}/approve`, { method: 'POST' });
    setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'approved' } : p)));
  };

  return (
    <main className="layout">
      <h1>Providers</h1>
      <p>Approve and manage provider registrations.</p>
      <div className="providers-grid">
        {providers.map((provider) => (
          <article key={provider.id} className="card">
            <h2>{provider.business_name}</h2>
            <p>{provider.category}</p>
            <p>Status: {provider.status}</p>
            <button className="button" disabled={provider.status === 'approved'} onClick={() => approve(provider.id)}>
              {provider.status === 'approved' ? 'Approved' : 'Approve'}
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}

function Bookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchJson(`${API_URL}/bookings`).then(setBookings);
  }, []);

  return (
    <main className="layout">
      <h1>Bookings Overview</h1>
      <p>Browse all confirmed and pending bookings on the platform.</p>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        bookings.map((booking) => (
          <article key={booking.id} className="booking-card">
            <p><strong>Booking ref:</strong> {booking.reference_number}</p>
            <p>Date: {booking.date}</p>
            <p>Time: {booking.time_slot}</p>
            <p>Status: {booking.status}</p>
            <p>Total: KW D {booking.total_price.toFixed(0)}</p>
          </article>
        ))
      )}
    </main>
  );
}

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/providers" element={<Providers />} />
        <Route path="/bookings" element={<Bookings />} />
      </Routes>
    </div>
  );
}

export default App;
