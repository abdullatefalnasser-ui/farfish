import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const PROVIDER_ID = 'provider-1';

function fetchJson(url, options) {
  return fetch(url, options).then((res) => res.json());
}

function DashboardHome() {
  const [bookings, setBookings] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchJson(`${API_URL}/bookings?provider_id=${PROVIDER_ID}`).then(setBookings);
    fetchJson(`${API_URL}/providers/${PROVIDER_ID}/activities`).then(setActivities);
  }, []);

  return (
    <main className="layout">
      <h1>Provider Dashboard</h1>
      <p>Manage your activities, bookings, and provider performance.</p>
      <div className="stats-grid">
        <div className="stat-card">
          <p>Total bookings</p>
          <strong>{bookings.length}</strong>
        </div>
        <div className="stat-card">
          <p>Active listings</p>
          <strong>{activities.length}</strong>
        </div>
      </div>
      <nav className="dashboard-nav">
        <Link to="/listings" className="button">My Listings</Link>
        <Link to="/bookings" className="button secondary">Bookings</Link>
      </nav>
    </main>
  );
}

function Listings() {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({ name_en: '', description_en: '', category: 'Adventure', price_per_person: 50, max_capacity: 10 });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchJson(`${API_URL}/providers/${PROVIDER_ID}/activities`).then(setActivities);
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      photos: ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80'],
      availability: [{ date: new Date().toISOString().slice(0, 10), slots: ['10:00', '14:00'] }]
    };
    const result = await fetchJson(`${API_URL}/providers/${PROVIDER_ID}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setActivities((prev) => [result, ...prev]);
    setMessage('Listing added and pending approval.');
    setForm({ name_en: '', description_en: '', category: 'Adventure', price_per_person: 50, max_capacity: 10 });
  };

  return (
    <main className="layout">
      <h1>My Listings</h1>
      <p>View your provider activities and add new ones.</p>
      {message && <div className="alert">{message}</div>}
      <form className="provider-form" onSubmit={submit}>
        <label>
          Activity name
          <input type="text" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} required />
        </label>
        <label>
          Description
          <input type="text" value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} required />
        </label>
        <label>
          Category
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option>Adventure</option>
            <option>Outdoor</option>
            <option>Family</option>
            <option>Experiences</option>
            <option>Indoor</option>
          </select>
        </label>
        <label>
          Price per person
          <input type="number" value={form.price_per_person} onChange={(e) => setForm({ ...form, price_per_person: Number(e.target.value) })} required />
        </label>
        <label>
          Max capacity
          <input type="number" value={form.max_capacity} onChange={(e) => setForm({ ...form, max_capacity: Number(e.target.value) })} required />
        </label>
        <button className="button" type="submit">Add Listing</button>
      </form>
      <div className="listings-grid">
        {activities.map((item) => (
          <article key={item.id} className="card">
            <h2>{item.name_en}</h2>
            <p>{item.status === 'active' ? 'Live' : 'Pending approval'}</p>
            <p>KW D {item.price_per_person.toFixed(0)}</p>
          </article>
        ))}
      </div>
    </main>
  );
}

function Bookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchJson(`${API_URL}/bookings?provider_id=${PROVIDER_ID}`).then(setBookings);
  }, []);

  return (
    <main className="layout">
      <h1>Bookings</h1>
      <p>See incoming bookings for your provider.</p>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        bookings.map((booking) => (
          <article key={booking.id} className="booking-card">
            <p><strong>Booking ref:</strong> {booking.reference_number}</p>
            <p>{booking.date} • {booking.time_slot}</p>
            <p>Guests: {booking.guests}</p>
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
        <Route path="/" element={<DashboardHome />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/bookings" element={<Bookings />} />
      </Routes>
    </div>
  );
}

export default App;
