import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import BookCard from '../components/BookCard'
import styles from './Catalog.module.css'

const GENRES = ['All', 'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Fantasy', 'Science', 'History', 'Biography', 'Poetry', 'Other']
const STATUS_FILTERS = [
  { value: 'all', label: 'All Books' },
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sold', label: 'Sold' },
]

export default function Catalog() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [genreFilter, setGenreFilter] = useState('All')

  useEffect(() => {
    async function loadBooks() {
      setLoading(true)
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error) setBooks(data || [])
      setLoading(false)
    }
    loadBooks()
  }, [])

  const filtered = useMemo(() => {
    return books.filter(book => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        book.title?.toLowerCase().includes(q) ||
        book.author?.toLowerCase().includes(q) ||
        book.genre?.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || book.availability_status === statusFilter
      const matchGenre = genreFilter === 'All' || book.genre === genreFilter
      return matchSearch && matchStatus && matchGenre
    })
  }, [books, search, statusFilter, genreFilter])

  const recentBooks = books.slice(0, 4)
  const showRecent = !search && statusFilter === 'all' && genreFilter === 'All'

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>— hand-picked with love —</p>
        <h1 className={styles.heroTitle}>A little shop full of stories</h1>
        <p className={styles.heroSub}>Browse our curated collection of second-hand books. Each one waiting for its next reader.</p>

        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search by title, author, or genre…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      <main className={styles.main}>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`${styles.filterBtn} ${statusFilter === f.value ? styles.active : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={genreFilter}
            onChange={e => setGenreFilter(e.target.value)}
            className={styles.genreSelect}
          >
            {GENRES.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>

        {loading ? (
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔦</span>
            <h2 className={styles.emptyTitle}>Nothing here yet…</h2>
            <p className={styles.emptySub}>
              {search
                ? `No books match "${search}". Try a different title or author.`
                : 'No books match those filters. Try broadening your search.'}
            </p>
          </div>
        ) : (
          <>
            {showRecent && recentBooks.length > 0 && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Just arrived</h2>
                  <span className={styles.sectionLine} />
                </div>
                <div className={styles.grid}>
                  {recentBooks.map(book => <BookCard key={book.id} book={book} />)}
                </div>
              </section>
            )}

            <section className={styles.section}>
              {showRecent && recentBooks.length > 0 && (
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Full catalog</h2>
                  <span className={styles.sectionLine} />
                </div>
              )}
              <p className={styles.resultCount}>
                {filtered.length} {filtered.length === 1 ? 'book' : 'books'} found
              </p>
              <div className={styles.grid}>
                {filtered.map((book, i) => (
                  <div key={book.id} className={styles.cardWrap} style={{ animationDelay: `${i * 0.04}s` }}>
                    <BookCard book={book} />
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <footer className={styles.footer}>
        <p>The Paper Nook — find us on Instagram & WhatsApp</p>
        <p className={styles.footerSub}>Books sold as described. All sales final.</p>
      </footer>
    </div>
  )
}
