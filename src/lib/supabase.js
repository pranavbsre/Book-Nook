import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com'

// Open Library API helper
export async function fetchBookByISBN(isbn) {
  const cleanISBN = isbn.replace(/[-\s]/g, '')
  
  try {
    // Try Open Library first
    const olRes = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanISBN}&format=json&jscmd=data`)
    const olData = await olRes.json()
    const key = `ISBN:${cleanISBN}`
    
    if (olData[key]) {
      const book = olData[key]
      const coverId = book.cover?.large || book.cover?.medium || book.cover?.small || null
      return {
        isbn: cleanISBN,
        title: book.title || '',
        author: book.authors?.map(a => a.name).join(', ') || '',
        cover_url: coverId || `https://covers.openlibrary.org/b/isbn/${cleanISBN}-L.jpg`,
        description: book.notes?.value || book.notes || book.excerpts?.[0]?.text || '',
        genre: book.subjects?.[0]?.name || book.subjects?.[0] || '',
        source: 'openlibrary'
      }
    }
  } catch (e) {
    console.warn('Open Library fetch failed:', e)
  }

  try {
    // Fallback: Google Books
    const gbRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`)
    const gbData = await gbRes.json()
    
    if (gbData.items?.length > 0) {
      const vol = gbData.items[0].volumeInfo
      return {
        isbn: cleanISBN,
        title: vol.title || '',
        author: vol.authors?.join(', ') || '',
        cover_url: vol.imageLinks?.thumbnail?.replace('http:', 'https:') || vol.imageLinks?.smallThumbnail?.replace('http:', 'https:') || '',
        description: vol.description || '',
        genre: vol.categories?.[0] || '',
        source: 'google'
      }
    }
  } catch (e) {
    console.warn('Google Books fetch failed:', e)
  }

  throw new Error('Book not found. Please check the ISBN and try again.')
}
