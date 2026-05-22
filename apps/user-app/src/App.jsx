import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const USER_ID = 'user-1';

function fetchJson(url, options) {
  return fetch(url, options).then((res) => res.json());
}

function onImgLoad(e) {
  e.currentTarget.classList.add('loaded');
}

/* ── Icons ── */

function IcHome({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function IcBookmark({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
    </svg>
  );
}

function IcUser({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IcSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function IcBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function IcChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function IcCheck() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IcPlus() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IcMinus() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  );
}

function IcCompass() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

/* ── Bottom nav ── */

function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${path === '/' ? 'active' : ''}`}>
        <IcHome filled={path === '/'} />
        <span className="nav-label">Discover</span>
      </Link>
      <Link to="/bookings" className={`nav-item ${path === '/bookings' ? 'active' : ''}`}>
        <IcBookmark filled={path === '/bookings'} />
        <span className="nav-label">Bookings</span>
      </Link>
      <Link to="/" className="nav-fab">
        <IcCompass />
      </Link>
      <Link to="/profile" className={`nav-item ${path === '/profile' ? 'active' : ''}`}>
        <IcUser filled={path === '/profile'} />
        <span className="nav-label">Profile</span>
      </Link>
    </nav>
  );
}

/* ── Home ── */

const CATEGORIES = ['All', 'Indoor', 'Outdoor', 'Experiences', 'Family', 'Adventure'];

const FEATURED = {
  eyebrow: 'Top pick in Kuwait',
  title: 'Kuwait City',
  stats: ['Sea views', 'Year-round', 'Family friendly'],
  emoji: '🌊',
};

const PRICE_COLORS = ['yellow', 'magenta', 'purple', 'lime'];

function Home() {
  const [activities, setActivities] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const query = new URLSearchParams();
    if (category && category !== 'All') query.set('category', category);
    if (search) query.set('q', search);
    fetchJson(`${API_URL}/activities?${query.toString()}`).then(setActivities).catch(() => {});
  }, [category, search]);

  return (
    <main className="page">
      {/* Top bar */}
      <header className="top-bar">
        <div className="top-bar-greeting">
          <h1>Welcome, <span>Laila.</span></h1>
        </div>
        <div className="top-bar-actions">
          <button className="icon-btn">
            <IcBell />
            <span className="badge" />
          </button>
          <div className="avatar-btn">L</div>
        </div>
      </header>

      {/* Search */}
      <div className="search-wrap">
        <div className="search-input-row">
          <IcSearch />
          <input
            type="search"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="categories-wrap">
        <div className="categories-scroll">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              className={`pill ${(category === item || (item === 'All' && !category)) ? 'active' : ''}`}
              onClick={() => setCategory(item === 'All' ? '' : item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Featured card */}
      <div className="featured-card">
        <div className="featured-card-icon">{FEATURED.emoji}</div>
        <p className="featured-card-eyebrow">{FEATURED.eyebrow}</p>
        <h2>{FEATURED.title}</h2>
        <div className="featured-card-meta">
          {FEATURED.stats.map((s) => <span key={s}>{s}</span>)}
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-cards-row">
        <div className="stat-card yellow">
          <span className="stat-num">50+</span>
          <span className="stat-label">Activities</span>
        </div>
        <div className="stat-card purple">
          <span className="stat-num light">12</span>
          <span className="stat-label light">Categories</span>
        </div>
        <div className="stat-card lime">
          <span className="stat-num">KWD 5</span>
          <span className="stat-label">Starts from</span>
        </div>
      </div>

      {/* Activities feed */}
      <div className="section-header">
        <h2>{category || 'All activities'}</h2>
        <span style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{activities.length} found</span>
      </div>

      {activities.length === 0 ? (
        <div className="loading-page">
          <div className="spinner" />
          <span>Loading experiences...</span>
        </div>
      ) : (
        <div className="cards-stack">
          {activities.map((activity, i) => {
            const priceColor = PRICE_COLORS[i % PRICE_COLORS.length];
            return (
              <Link to={`/activity/${activity.id}`} key={activity.id} style={{ textDecoration: 'none' }}>
                <article className="activity-card">
                  <div className="activity-card-photo">
                    <img src={activity.photos?.[0]} alt={activity.name_en} onLoad={onImgLoad} loading="lazy" />
                    <div className="activity-card-photo-overlay" />
                    <span className="activity-card-photo-badge">{activity.category}</span>
                    <span className={`activity-card-photo-price ${priceColor}`}>
                      KWD {activity.price_per_person?.toFixed(0)}
                    </span>
                  </div>
                  <div className="activity-card-body">
                    <h3>{activity.name_en}</h3>
                    <p>{activity.description_en}</p>
                    <div className="activity-card-footer">
                      <div>
                        <div className="price-label">
                          KWD {activity.price_per_person?.toFixed(0)} <span>/ person</span>
                        </div>
                        {activity.rating && <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginTop: 2 }}>⭐ {activity.rating} rating</div>}
                      </div>
                      <div style={{
                        background: 'var(--yellow)',
                        color: '#000',
                        borderRadius: '999px',
                        padding: '0.45rem 1.1rem',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                      }}>
                        Book
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

/* ── Activity detail ── */

function ActivityDetail() {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    fetchJson(`${API_URL}/activities/${id}`).then(setActivity).catch(() => {});
  }, [id]);

  if (!activity) return (
    <main className="page">
      <div className="loading-page"><div className="spinner" /></div>
    </main>
  );

  return (
    <main className="page">
      {/* Hero image */}
      <div className="detail-hero">
        <img src={activity.photos?.[0]} alt={activity.name_en} onLoad={onImgLoad} />
        <div className="detail-hero-overlay" />
        <Link to="/" className="detail-hero-back"><IcChevronLeft /></Link>
      </div>

      <div className="detail-body">
        <span className="detail-tag">{activity.category}</span>
        <h1>{activity.name_en}</h1>
        <p className="desc">{activity.description_en}</p>

        {/* Price row */}
        <div className="detail-price-row">
          <div>
            <div className="price-big">KWD {activity.price_per_person?.toFixed(0)}</div>
            <div className="per-person">per person</div>
          </div>
          <Link to={`/book/${activity.id}`} className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.75rem' }}>
            Book now
          </Link>
        </div>

        {/* Availability */}
        {activity.availability?.length > 0 && (
          <div className="slots-section">
            <h2>Available slots</h2>
            {activity.availability.map((item) => (
              <div key={item.date} className="slot-group">
                <h3>{item.date}</h3>
                <div className="slot-chips">
                  {item.slots.map((slot) => (
                    <span key={`${item.date}-${slot}`} className="slot-chip">{slot}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* ── Booking flow ── */

function BookingFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState('Laila Al-Sabah');
  const [phone, setPhone] = useState('+96512345678');
  const [email, setEmail] = useState('laila@example.com');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJson(`${API_URL}/activities/${id}`).then((data) => {
      setActivity(data);
      if (data.availability?.length > 0) {
        setDate(data.availability[0].date);
        setTimeSlot(data.availability[0].slots[0]);
      }
    }).catch(() => {});
  }, [id]);

  const total = activity ? activity.price_per_person * guests : 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const booking = await fetchJson(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: USER_ID,
        activity_id: id,
        provider_id: activity.provider_id,
        date,
        time_slot: timeSlot,
        guests,
        total_price: total,
        reference_number: `FF-${Date.now().toString().slice(-6)}`,
      }),
    });
    setSaving(false);
    navigate(`/booking-confirmation?ref=${booking.reference_number}`);
  };

  if (!activity) return (
    <main className="page">
      <div className="loading-page"><div className="spinner" /></div>
    </main>
  );

  return (
    <main className="page">
      <div className="page-top">
        <Link to={`/activity/${id}`} className="back-btn"><IcChevronLeft /></Link>
        <h1>Book activity</h1>
      </div>

      <form className="booking-page" onSubmit={handleSubmit}>
        <h1>{activity.name_en}</h1>

        <div className="form-field">
          <label>Date</label>
          <select value={date} onChange={(e) => setDate(e.target.value)}>
            {activity.availability?.map((item) => (
              <option key={item.date} value={item.date}>{item.date}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Time slot</label>
          <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
            {(activity.availability?.find((item) => item.date === date)?.slots || []).map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Guests</label>
          <div className="guest-counter">
            <button type="button" className="counter-btn" onClick={() => setGuests(Math.max(1, guests - 1))} disabled={guests <= 1}>
              <IcMinus />
            </button>
            <span className="counter-value">{guests}</span>
            <button type="button" className="counter-btn" onClick={() => setGuests(guests + 1)}>
              <IcPlus />
            </button>
          </div>
        </div>

        <div className="divider" />

        <div className="form-field">
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-field">
          <label>Phone</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="form-field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        {/* Summary */}
        <div className="summary-box">
          <div className="summary-row">
            <span className="label">Activity</span>
            <span className="value">{activity.name_en}</span>
          </div>
          <div className="summary-row">
            <span className="label">Date</span>
            <span className="value">{date}</span>
          </div>
          <div className="summary-row">
            <span className="label">Time</span>
            <span className="value">{timeSlot}</span>
          </div>
          <div className="summary-row">
            <span className="label">Guests</span>
            <span className="value">{guests} × KWD {activity.price_per_person?.toFixed(0)}</span>
          </div>
          <div className="summary-row total-row">
            <span className="label" style={{ fontWeight: 700, color: 'var(--text)' }}>Total</span>
            <span className="value">KWD {total.toFixed(0)}</span>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Confirming…' : 'Confirm Booking'}
        </button>
      </form>
    </main>
  );
}

/* ── Booking confirmation ── */

function BookingConfirmation() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  return (
    <main className="page">
      <div className="confirm-page">
        <div className="confirm-icon" style={{ color: 'var(--yellow)', background: 'var(--yellow)', border: 'none' }}>
          <IcCheck />
        </div>
        <h1>You're booked!</h1>
        <p>Your booking is confirmed. Get ready for an amazing experience in Kuwait.</p>
        <div className="ref-badge">{ref}</div>
        <p style={{ marginTop: '0.5rem' }}>Save this reference number</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginTop: '1rem' }}>
          <Link to="/bookings" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
            View My Bookings
          </Link>
          <Link to="/" className="btn-ghost" style={{ display: 'block', textAlign: 'center' }}>
            Discover more
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ── My bookings ── */

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchJson(`${API_URL}/bookings?user_id=${USER_ID}`).then(setBookings).catch(() => {});
    fetchJson(`${API_URL}/activities`).then(setActivities).catch(() => {});
  }, []);

  const activityMap = useMemo(
    () => Object.fromEntries(activities.map((item) => [item.id, item])),
    [activities],
  );

  return (
    <main className="page">
      <header className="top-bar">
        <div className="top-bar-greeting">
          <h1>My <span>Bookings</span></h1>
        </div>
      </header>

      <div className="bookings-page">
        {bookings.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: '3rem' }}>🗓️</span>
            <h2>No bookings yet</h2>
            <p>Browse activities and book your first experience in Kuwait.</p>
            <Link to="/" className="btn-primary" style={{ marginTop: '0.5rem' }}>Discover activities</Link>
          </div>
        ) : (
          bookings.map((booking) => {
            const act = activityMap[booking.activity_id];
            return (
              <article key={booking.id} className="booking-item">
                {act?.photos?.[0] && (
                  <div className="booking-item-photo">
                    <img src={act.photos[0]} alt={act.name_en} onLoad={onImgLoad} loading="lazy" />
                  </div>
                )}
                <div className="booking-item-body">
                  <h2>{act?.name_en || 'Activity'}</h2>
                  <div className="meta">
                    <span>{booking.date}</span>
                    <span>·</span>
                    <span>{booking.time_slot}</span>
                    <span>·</span>
                    <span>{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
                  </div>
                  <span className={`status-chip ${booking.status === 'confirmed' ? 'confirmed' : 'pending'}`}>
                    {booking.status}
                  </span>
                  <div className="booking-item-total">KWD {booking.total_price?.toFixed(0)}</div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}

/* ── Profile ── */

function Profile() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchJson(`${API_URL}/bookings?user_id=${USER_ID}`).then(setBookings).catch(() => {});
  }, []);

  const totalSpent = bookings.reduce((s, b) => s + (b.total_price || 0), 0);

  return (
    <main className="page">
      <header className="top-bar">
        <div className="top-bar-greeting"><h1>My <span>Profile</span></h1></div>
      </header>

      <div style={{ padding: '0 1.25rem 2rem' }}>
        {/* Avatar card */}
        <div style={{ background: 'var(--yellow)', borderRadius: 28, padding: '2rem', marginBottom: '1rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(0,0,0,0.08)' }} />
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: '#000', marginBottom: '0.75rem' }}>L</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#000' }}>Laila Al-Sabah</div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.5)', fontWeight: 600, marginTop: 4 }}>laila@example.com · +96512345678</div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--blue)', borderRadius: 20, padding: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Bookings</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff' }}>{bookings.length}</div>
          </div>
          <div style={{ background: 'var(--green)', borderRadius: 20, padding: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Spent</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#000' }}>KWD {totalSpent.toFixed(0)}</div>
          </div>
        </div>

        {/* Settings list */}
        {[
          { label: 'My Bookings', sub: `${bookings.length} trips booked`, to: '/bookings', color: 'var(--amber)' },
          { label: 'Notifications', sub: 'Manage alerts', color: 'var(--blue)' },
          { label: 'Language', sub: 'English / العربية', color: 'var(--surface2)' },
          { label: 'Help & Support', sub: 'Contact us', color: 'var(--surface2)' },
        ].map(({ label, sub, to, color }) => (
          <Link key={label} to={to || '#'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1rem 1.25rem', marginBottom: '0.65rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{label}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text2)', marginTop: 2 }}>{sub}</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
          </Link>
        ))}
      </div>
    </main>
  );
}

/* ── App ── */

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/activity/:id" element={<ActivityDetail />} />
        <Route path="/book/:id" element={<BookingFlow />} />
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
