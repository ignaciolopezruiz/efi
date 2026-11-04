import { createContext, useContext, useState, useEffect } from 'react'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('ferreteria_favoritos')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('ferreteria_favoritos', JSON.stringify(favorites))
    } catch (e) {
      console.error(e)
    }
  }, [favorites])

  const addFavorite = (producto) => {
    setFavorites((prev) => {
      if (prev.some((p) => p.id === producto.id)) return prev
      return [...prev, producto]
    })
  }

  const removeFavorite = (id) => {
    setFavorites((prev) => prev.filter((p) => p.id !== id))
  }

  const toggleFavorite = (producto) => {
    if (isFavorite(producto.id)) {
      removeFavorite(producto.id)
    } else {
      addFavorite(producto)
    }
  }

  const isFavorite = (id) => {
    return favorites.some((p) => p.id === id)
  }

  const clearFavorites = () => {
    setFavorites([])
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        clearFavorites,
        count: favorites.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites debe ser utilizado dentro de un FavoritesProvider')
  }
  return context
}
