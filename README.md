# 📚 The Paper Nook — Bookstore Catalog

A cozy, warm online catalog for a small Instagram-based bookstore. Visitors browse freely; the owner manages books through a private admin panel.

---

## ✨ Features

**Public catalog**
- Browse all books in a warm, paper-toned grid
- Search by title, author, or genre
- Filter by availability (Available / Reserved / Sold)
- Filter by genre
- View full book details with cover, description, and contact buttons
- Contact via Instagram DM or WhatsApp in one tap

**Admin panel** (password-protected)
- Add books by ISBN — metadata auto-fetched from Open Library / Google Books
- Edit any field before saving
- Inline edit books after adding
- Click-to-cycle availability status
- Delete books
- Dashboard stats (available / reserved / sold counts)

---

## 🚀 Quick start

### 1. Clone & install

```bash
git clone https://github.com/you/paper-nook.git
cd paper-nook
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase_setup.sql`
3. Go to **Authentication → Users → Invite user** and invite your admin email
4. Set a password for that user (via the invite email, or directly in Auth settings)

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |
| `VITE_INSTAGRAM_HANDLE` | Your Instagram username (without @) |
| `VITE_WHATSAPP_NUMBER` | Your number in international format e.g. `919876543210` |
| `VITE_ADMIN_EMAIL` | The email you invited in step 2 |

### 4. Run locally

```bash
npm run dev
```

Visit `http://localhost:5173` — the catalog is live.  
Visit `http://localhost:5173/admin` to manage books.

---

## 🌐 Deploy to Vercel

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add all `VITE_*` variables in **Project → Settings → Environment Variables**
4. Deploy — done!

---

## 🗄️ Database schema

```sql
books (
  id                   UUID PRIMARY KEY
  isbn                 TEXT
  title                TEXT NOT NULL
  author               TEXT
  cover_url            TEXT
  description          TEXT
  genre                TEXT
  availability_status  TEXT  -- 'available' | 'reserved' | 'sold'
  created_at           TIMESTAMPTZ
  updated_at           TIMESTAMPTZ
)
```

**Row Level Security rules:**
- Anyone → SELECT (read-only public catalog)
- Authenticated users only → INSERT / UPDATE / DELETE

---

## 🎨 Design tokens

| Token | Value | Use |
|---|---|---|
| `--cream` | `#F7F3EC` | Page background |
| `--brown-deep` | `#3D2B1F` | Headings |
| `--brown` | `#6B4226` | Primary actions |
| `--sage` | `#7A8C6E` | Available badge, secondary buttons |
| `--rust` | `#B05C3A` | Sold badge, errors |
| Serif | Playfair Display | Titles, headings |
| Sans | Inter | Body, UI |

---

## 📁 Project structure

```
src/
  components/
    Navbar.jsx / .module.css
    BookCard.jsx / .module.css
    ProtectedRoute.jsx
  hooks/
    useAuth.jsx
  lib/
    supabase.js          ← Supabase client + ISBN fetch logic
  pages/
    Catalog.jsx          ← Public homepage
    BookDetail.jsx       ← Individual book page
    AdminLogin.jsx       ← Login form
    AdminPanel.jsx       ← Full admin interface
  App.jsx
  main.jsx
  index.css              ← CSS variables & global styles
supabase_setup.sql       ← Run once in Supabase SQL editor
.env.example             ← Copy to .env.local and fill in
```

---

## 🔒 Security notes

- Supabase RLS ensures public users genuinely cannot write to the database, even if someone inspects network requests.
- The admin email is the only account in Supabase Auth — there's no sign-up flow.
- The anon key is public (this is by design in Supabase) — RLS policies enforce access control.

---

## 📦 Tech stack

- **Frontend**: React 18 + Vite
- **Database + Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Book metadata**: Open Library API (fallback: Google Books API)
- **Hosting**: Vercel
- **Fonts**: Playfair Display + Inter (Google Fonts)
- **Styling**: CSS Modules (no external UI library)
