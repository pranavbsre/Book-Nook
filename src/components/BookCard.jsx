import { Link } from 'react-router-dom'
import styles from './BookCard.module.css'

const STATUS_CONFIG = {
  available: { label: 'Available', className: 'available' },
  sold: { label: 'Sold', className: 'sold' },
  reserved: { label: 'Reserved', className: 'reserved' },
}

export default function BookCard({ book }) {
  const status = STATUS_CONFIG[book.availability_status] || STATUS_CONFIG.available

  return (
    <Link to={`/book/${book.id}`} className={styles.card}>
      <div className={styles.coverWrap}>
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className={styles.cover}
            loading="lazy"
            onError={e => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div className={styles.coverFallback} style={{ display: book.cover_url ? 'none' : 'flex' }}>
          <span>📖</span>
        </div>
        <span className={`${styles.badge} ${styles[status.className]}`}>
          {status.label}
        </span>
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{book.title}</h3>
        <p className={styles.author}>{book.author}</p>
        {book.genre && <p className={styles.genre}>{book.genre}</p>}
      </div>
    </Link>
  )
}
