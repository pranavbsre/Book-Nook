import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import styles from './BookDetail.module.css'

const STATUS_CONFIG = {
  available: { label: 'Available', color: 'var(--sage)' },
  sold: { label: 'Sold', color: 'var(--rust)' },
  reserved: { label: 'Reserved', color: '#B08030' },
}

// Replace with your actual handles
const INSTAGRAM_HANDLE = import.meta.env.VITE_INSTAGRAM_HANDLE || 'yourshop'
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '919999999999'

export default function BookDetail() {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('books').select('*').eq('id', id).single()
      setBook(data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.loadingWrap}>
        <p className={styles.loadingText}>Finding your book…</p>
      </div>
    </div>
  )

  if (!book) return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.notFound}>
        <span>📭</span>
        <h2>Book not found</h2>
        <Link to="/" className={styles.backLink}>← Back to catalog</Link>
      </div>
    </div>
  )

  const status = STATUS_CONFIG[book.availability_status] || STATUS_CONFIG.available
  const igMessage = encodeURIComponent(`Hi! I'm interested in "${book.title}" by ${book.author} (ISBN: ${book.isbn})`)
  const waMessage = encodeURIComponent(`Hi! I'm interested in buying "${book.title}" by ${book.author} (ISBN: ${book.isbn})`)

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <Link to="/" className={styles.back}>← Back to catalog</Link>

        <div className={styles.content}>
          <div className={styles.coverSide}>
            <div className={styles.coverWrap}>
              {book.cover_url && !imgError ? (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className={styles.cover}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className={styles.coverFallback}>📖</div>
              )}
            </div>
            <span className={styles.badge} style={{ color: status.color }}>
              ● {status.label}
            </span>
          </div>

          <div className={styles.infoSide}>
            {book.genre && <p className={styles.genre}>{book.genre}</p>}
            <h1 className={styles.title}>{book.title}</h1>
            <p className={styles.author}>by {book.author}</p>

            {book.description && (
              <div className={styles.description}>
                <p>{book.description}</p>
              </div>
            )}

            <div className={styles.meta}>
              {book.isbn && <span>ISBN: {book.isbn}</span>}
              {book.created_at && (
                <span>Added {new Date(book.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}</span>
              )}
            </div>

            <div className={styles.actions}>
              <p className={styles.actionsLabel}>Interested? Get in touch:</p>
              <div className={styles.contactBtns}>
                <a
                  href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.contactBtn} ${styles.igBtn}`}
                >
                  <span>📷</span> Instagram DM
                </a>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.contactBtn} ${styles.waBtn}`}
                >
                  <span>💬</span> WhatsApp
                </a>
              </div>
              {book.availability_status === 'sold' && (
                <p className={styles.soldNote}>This book has been sold, but feel free to ask if we have something similar!</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
