import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import fs from 'fs';
import path from 'path';

config();

const app = express();
app.use(cors());
app.use(express.json());

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const dbDir = path.join(__dirname, '../data');
const dbFile = path.join(dbDir, 'db.json');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const adapter = new JSONFile(dbFile);
const db = new Low(adapter, {
  users: [],
  providers: [],
  activities: [],
  bookings: []
});

async function createInitialData() {
  await db.read();
  db.data ||= {
    users: [],
    providers: [],
    activities: [],
    bookings: []
  };

  if (db.data.users.length === 0) {
    db.data.users.push({
      id: 'user-1',
      name: 'Laila Al-Sabah',
      phone: '+96512345678',
      email: 'laila@example.com',
      created_at: new Date().toISOString()
    });
  }

  if (db.data.providers.length === 0) {
    db.data.providers.push(
      {
        id: 'provider-1',
        business_name: 'Desert Pulse',
        contact_name: 'Khaled',
        phone: '+96598765432',
        email: 'khaled@desertpulse.kw',
        category: 'Adventure',
        status: 'approved',
        commission_rate: 0.15,
        created_at: new Date().toISOString()
      },
      {
        id: 'provider-2',
        business_name: 'Sea Breeze Tours',
        contact_name: 'Sara',
        phone: '+9655556677',
        email: 'sara@seabreeze.kw',
        category: 'Outdoor',
        status: 'pending',
        commission_rate: 0.15,
        created_at: new Date().toISOString()
      }
    );
  }

  if (db.data.activities.length === 0) {
    db.data.activities.push(
      {
        id: 'activity-1',
        provider_id: 'provider-1',
        name_ar: 'جولة سفاري الصحراء',
        name_en: 'Desert Safari Adventure',
        description_ar: 'استمتع برحلة سفاري مثيرة في الكثبان الرملية مع برنامج مليء بالمغامرة.',
        description_en: 'Enjoy an exciting desert safari through dunes with a full adventure program.',
        category: 'Outdoor',
        price_per_person: 45,
        max_capacity: 12,
        photos: [
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=800&q=80'
        ],
        location: JSON.stringify({ address: 'Al Jahra', lat: 29.3697, lng: 47.9783 }),
        availability: JSON.stringify([
          { date: '2026-05-22', slots: ['09:00', '13:00', '17:00'] },
          { date: '2026-05-23', slots: ['10:00', '14:00', '18:00'] }
        ]),
        status: 'active',
        rating: 4.8,
        created_at: new Date().toISOString()
      },
      {
        id: 'activity-2',
        provider_id: 'provider-1',
        name_ar: 'عضوية ممارسة التزلج على الماء',
        name_en: 'Water Ski Experience',
        description_ar: 'نشاط مائي ممتع في الخليج مع مدربين محترفين.',
        description_en: 'A fun water skiing experience in the Gulf with expert trainers.',
        category: 'Adventure',
        price_per_person: 55,
        max_capacity: 8,
        photos: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
        ],
        location: JSON.stringify({ address: 'Salmiya', lat: 29.3182, lng: 48.0611 }),
        availability: JSON.stringify([
          { date: '2026-05-22', slots: ['11:00', '15:00'] },
          { date: '2026-05-24', slots: ['12:00', '16:00'] }
        ]),
        status: 'active',
        rating: 4.7,
        created_at: new Date().toISOString()
      }
    );
  }

  await db.write();
}

function safeData(item) {
  if (!item) return null;
  return {
    ...item,
    availability: item.availability ? JSON.parse(item.availability) : [],
    location: item.location ? JSON.parse(item.location) : null
  };
}

function makeReference() {
  return `FF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

app.get('/health', async (req, res) => {
  await createInitialData();
  res.json({ status: 'ok', app: 'farfish-api' });
});

app.get('/activities', async (req, res) => {
  await createInitialData();
  const search = (req.query.q || '').toLowerCase();
  const category = (req.query.category || '').toLowerCase();
  let activities = db.data.activities.filter((item) => item.status === 'active');
  if (category) activities = activities.filter((item) => item.category.toLowerCase().includes(category));
  if (search) activities = activities.filter((item) => item.name_en.toLowerCase().includes(search) || item.name_ar.includes(search));
  res.json(activities.map(safeData));
});

app.get('/activities/:id', async (req, res) => {
  await createInitialData();
  const activity = db.data.activities.find((item) => item.id === req.params.id);
  if (!activity) return res.status(404).json({ error: 'Activity not found' });
  res.json(safeData(activity));
});

app.get('/providers', async (req, res) => {
  await createInitialData();
  const status = req.query.status;
  let providers = db.data.providers;
  if (status) providers = providers.filter((item) => item.status === status);
  res.json(providers);
});

app.post('/providers/:id/approve', async (req, res) => {
  await createInitialData();
  const provider = db.data.providers.find((item) => item.id === req.params.id);
  if (!provider) return res.status(404).json({ error: 'Provider not found' });
  provider.status = 'approved';
  await db.write();
  res.json(provider);
});

app.get('/providers/:id/activities', async (req, res) => {
  await createInitialData();
  const providerActivities = db.data.activities.filter((item) => item.provider_id === req.params.id);
  res.json(providerActivities.map(safeData));
});

app.post('/providers/:id/activities', async (req, res) => {
  await createInitialData();
  const provider = db.data.providers.find((item) => item.id === req.params.id);
  if (!provider) return res.status(404).json({ error: 'Provider not found' });
  const { name_ar, name_en, description_ar, description_en, category, price_per_person, max_capacity, photos, location, availability } = req.body;
  if (!name_en || !description_en || !category || !price_per_person) {
    return res.status(400).json({ error: 'Missing required activity fields' });
  }
  const newActivity = {
    id: `activity-${Date.now()}`,
    provider_id: provider.id,
    name_ar: name_ar || name_en,
    name_en,
    description_ar: description_ar || description_en,
    description_en,
    category,
    price_per_person: Number(price_per_person),
    max_capacity: Number(max_capacity) || 10,
    photos: photos || [],
    location: JSON.stringify(location || { address: 'Kuwait City' }),
    availability: JSON.stringify(availability || [{ date: new Date().toISOString().slice(0, 10), slots: ['10:00', '14:00'] }]),
    status: 'pending',
    rating: 0,
    created_at: new Date().toISOString()
  };
  db.data.activities.push(newActivity);
  await db.write();
  res.status(201).json(safeData(newActivity));
});

app.get('/bookings', async (req, res) => {
  await createInitialData();
  let bookings = db.data.bookings;
  if (req.query.user_id) bookings = bookings.filter((item) => item.user_id === req.query.user_id);
  if (req.query.provider_id) bookings = bookings.filter((item) => item.provider_id === req.query.provider_id);
  res.json(bookings);
});

app.post('/bookings', async (req, res) => {
  await createInitialData();
  const { user_id, activity_id, provider_id, date, time_slot, guests, total_price, reference_number } = req.body;
  if (!user_id || !activity_id || !provider_id || !date || !time_slot || !guests || !total_price) {
    return res.status(400).json({ error: 'Missing booking payload' });
  }
  const commission = Number(total_price) * 0.15;
  const net_payout = Number(total_price) - commission;
  const booking = {
    id: `booking-${Date.now()}`,
    user_id,
    activity_id,
    provider_id,
    date,
    time_slot,
    guests: Number(guests),
    total_price: Number(total_price),
    commission,
    net_payout,
    status: 'confirmed',
    payment_status: 'paid',
    reference_number: reference_number || makeReference(),
    created_at: new Date().toISOString()
  };
  db.data.bookings.push(booking);
  await db.write();
  res.status(201).json(booking);
});

app.post('/bookings/:id/cancel', async (req, res) => {
  await createInitialData();
  const booking = db.data.bookings.find((item) => item.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  booking.status = 'cancelled';
  booking.payment_status = 'refunded';
  await db.write();
  res.json(booking);
});

app.get('/admin/metrics', async (req, res) => {
  await createInitialData();
  const totalUsers = db.data.users.length;
  const totalProviders = db.data.providers.length;
  const totalBookings = db.data.bookings.length;
  const totalRevenue = db.data.bookings.reduce((sum, booking) => sum + booking.total_price, 0);
  const commission = db.data.bookings.reduce((sum, booking) => sum + booking.commission, 0);
  res.json({ totalUsers, totalProviders, totalBookings, totalRevenue, commission });
});

const port = process.env.PORT || 5001;
app.listen(port, async () => {
  await createInitialData();
  console.log(`Farfish API running on http://localhost:${port}`);
});
