import { useState, useEffect } from 'react'
import { supabase, fetchBookByISBN } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import styles from './AdminPanel.module.css'

const AVAILABILITY_OPTIONS = ['available', 'reserved', 'sold']
const STATUS_LABELS = { available: 'Available', reserved: 'Reserved', sold: 'Sold' }

function ISBNForm({ onBookAdded }) {
  const [isbn, setIsbn] = useState('')
  const [preview, setPreview] = useState(null)
  const [fetchError, setFetchError] = useState('')
  const [fetching, setFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editFields, setEditFields] = useState({})

  const handleFetch = async (e) => {
    e.preventDefault()
    setFetchError('')
    setPreview(null)
    setFetching(true)
    try {
      const data = await fetchBookByISBN(isbn)
      setPreview(data)
      setEditFields(data)
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('books').insert([{
      isbn: editFields.isbn,
      title: editFields.title,
      author: editFields.author,
      cover_url: editFields.cover_url,
      description: editFields.description,
      genre: editFields.genre,
      availability_status: 'available',
    }])
    setSaving(false)
    if (error) {
      setFetchError('Could not save book: ' + error.message)
    } else {
      setPreview(null)
      setEditFields({})
      setIsbn('')
      onBookAdded()
    }
  }

  return (
    <div className={styles.isbnSection}>
      <h2 className={styles.subheading}>Add a book by ISBN</h2>
      <form onSubmit={handleFetch} className={styles.isbnForm}>
        <input
          type="text"
          value={isbn}
          onChange={e => setIsbn(e.target.value)}
          placeholder="Enter ISBN (e.g. 9780385333481)"
          className={styles.input}
          required
        />
        <button type="submit" className={styles.fetchBtn} disabled={fetching}>
          {fetching ? 'Looking up…' : 'Look up'}
        </button>
      </form>

      {fetchError && <p className={styles.error}>{fetchError}</p>}

      {preview && (
        <div className={styles.preview}>
          <div className={styles.previewLeft}>
            {editFields.cover_url ? (
              <img src={editFields.cover_url} alt="cover" className={styles.previewCover} />
            ) : (
              <div className={styles.coverPlaceholder}>📚</div>
            )}
          </div>
          <div className={styles.previewRight}>
            <p className={styles.previewTag}>Review & confirm before saving</p>
            <div className={styles.editGrid}>
              <EditField label="Title" value={editFields.title} onChange={v => setEditFields(f => ({...f, title: v}))} />
              <EditField label="Author" value={editFields.author} onChange={v => setEditFields(f => ({...f, author: v}))} />
              <EditField label="Genre" value={editFields.genre} onChange={v => setEditFields(f => ({...f, genre: v}))} />
              <EditField label="Cover URL" value={editFields.cover_url} onChange={v => setEditFields(f => ({...f, cover_url: v}))} />
            </div>
            <div className={styles.descField}>
              <label className={styles.fieldLabel}>Description</label>
              <textarea
                value={editFields.description || ''}
                onChange={e => setEditFields(f => ({...f, description: e.target.value}))}
                className={styles.textarea}
                rows={3}
              />
            </div>
            <div className={styles.previewActions}>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : '✓ Save book'}
              </button>
              <button className={styles.cancelBtn} onClick={() => { setPreview(null); setEditFields({}) }}>
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EditField({ label, value, onChange }) {
  return (
    <div className={styles.editFieldWrap}>
      <label className={styles.fieldLabel}>{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className={styles.input}
      />
    </div>
  )
}

function BookRow({ book, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [fields, setFields] = useState(book)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('books').update({
      title: fields.title,
      author: fields.author,
      cover_url: fields.cover_url,
      description: fields.description,
      genre: fields.genre,
      availability_status: fields.availability_status,
    }).eq('id', book.id)
    setSaving(false)
    if (!error) {
      setEditing(false)
      onUpdate()
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${book.title}"? This can't be undone.`)) return
    await supabase.from('books').delete().eq('id', book.id)
    onDelete()
  }

  const cycleStatus = async () => {
    const next = { available: 'reserved', reserved: 'sold', sold: 'available' }
    const newStatus = next[book.availability_status] || 'available'
    await supabase.from('books').update({ availability_status: newStatus }).eq('id', book.id)
    onUpdate()
  }

  return (
    <div className={`${styles.bookRow} ${editing ? styles.bookRowEditing : ''}`}>
      <div className={styles.bookRowMain}>
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} className={styles.rowCover}
            onError={e => e.target.style.display = 'none'}
          />
        ) : (
          <div className={styles.rowCoverFallback}>📖</div>
        )}
        <div className={styles.rowInfo}>
          <p className={styles.rowTitle}>{book.title}</p>
          <p className={styles.rowAuthor}>{book.author}</p>
          {book.genre && <p className={styles.rowGenre}>{book.genre}</p>}
        </div>
        <div className={styles.rowActions}>
          <button
            onClick={cycleStatus}
            className={`${styles.statusBtn} ${styles[book.availability_status]}`}
            title="Click to cycle status"
          >
            {STATUS_LABELS[book.availability_status] || 'Available'}
          </button>
          <button onClick={() => setEditing(!editing)} className={styles.editBtn}>
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button onClick={handleDelete} className={styles.deleteBtn}>Delete</button>
        </div>
      </div>

      {editing && (
        <div className={styles.editForm}>
          <div className={styles.editGrid}>
            <EditField label="Title" value={fields.title} onChange={v => setFields(f => ({...f, title: v}))} />
            <EditField label="Author" value={fields.author} onChange={v => setFields(f => ({...f, author: v}))} />
            <EditField label="Genre" value={fields.genre} onChange={v => setFields(f => ({...f, genre: v}))} />
            <EditField label="Cover URL" value={fields.cover_url} onChange={v => setFields(f => ({...f, cover_url: v}))} />
          </div>
          <div className={styles.descField}>
            <label className={styles.fieldLabel}>Description</label>
            <textarea
              value={fields.description || ''}
              onChange={e => setFields(f => ({...f, description: e.target.value}))}
              className={styles.textarea}
              rows={3}
            />
          </div>
          <div className={styles.editFormActions}>
            <label className={styles.fieldLabel}>Status</label>
            <select
              value={fields.availability_status}
              onChange={e => setFields(f => ({...f, availability_status: e.target.value}))}
              className={`${styles.input} ${styles.statusSelect}`}
            >
              {AVAILABILITY_OPTIONS.map(o => <option key={o} value={o}>{STATUS_LABELS[o]}</option>)}
            </select>
            <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminPanel() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { user } = useAuth()

  const loadBooks = async () => {
    const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false })
    setBooks(data || [])
    setLoading(false)
  }

  useEffect(() => { loadBooks() }, [])

  const filtered = books.filter(b => {
    const q = search.toLowerCase()
    return !q || b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q)
  })

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Admin Panel</h1>
            <p className={styles.pageUser}>Logged in as {user?.email}</p>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{books.filter(b => b.availability_status === 'available').length}</span>
              <span className={styles.statLabel}>Available</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>{books.filter(b => b.availability_status === 'reserved').length}</span>
              <span className={styles.statLabel}>Reserved</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>{books.filter(b => b.availability_status === 'sold').length}</span>
              <span className={styles.statLabel}>Sold</span>
            </div>
          </div>
        </div>

        <ISBNForm onBookAdded={loadBooks} />

        <div className={styles.listSection}>
          <div className={styles.listHeader}>
            <h2 className={styles.subheading}>Your catalog ({books.length})</h2>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter books…"
              className={`${styles.input} ${styles.listSearch}`}
            />
          </div>

          {loading ? (
            <p className={styles.loadingText}>Loading your books…</p>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyList}>
              <span>📦</span>
              <p>{search ? 'No books match that search.' : 'No books yet. Add your first one above!'}</p>
            </div>
          ) : (
            <div className={styles.list}>
              {filtered.map(book => (
                <BookRow key={book.id} book={book} onUpdate={loadBooks} onDelete={loadBooks} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
