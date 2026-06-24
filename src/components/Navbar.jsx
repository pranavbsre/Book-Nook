import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandIcon}>📚</span>
          <div>
            <span className={styles.brandName}>The Paper Nook</span>
            <span className={styles.brandTagline}>Curated second-hand books</span>
          </div>
        </Link>

        <nav className={styles.nav}>
          {user && user.email === import.meta.env.VITE_ADMIN_EMAIL && (
            <>
              <Link to="/admin" className={styles.navLink}>Admin Panel</Link>
              <button onClick={handleSignOut} className={styles.signOutBtn}>Sign out</button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
