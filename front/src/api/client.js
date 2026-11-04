const API_URL = (import.meta.env.VITE_API_URL || 'https://efi-e74ebfa4.fastapicloud.dev').replace(/\/$/, '')

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'Error en la petición'
    try {
      const errData = await response.json()
      if (errData && errData.detail) {
        errorDetail = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail)
      }
    } catch {
      errorDetail = response.statusText || errorDetail
    }
    throw new Error(errorDetail)
  }
  return response.json()
}

export const api = {
  baseUrl: API_URL,

  async checkHealth() {
    const res = await fetch(`${API_URL}/`)
    return handleResponse(res)
  },

  async getProductos(page = 1, size = 100) {
    const res = await fetch(`${API_URL}/productos/?page=${page}&size=${size}`)
    return handleResponse(res)
  },

  async getProductoById(id) {
    const res = await fetch(`${API_URL}/productos/${id}`)
    return handleResponse(res)
  },

  async createProducto(productoData) {
    const res = await fetch(`${API_URL}/productos/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productoData),
    })
    return handleResponse(res)
  },

  async deleteProducto(id) {
    const res = await fetch(`${API_URL}/productos/${id}`, {
      method: 'DELETE',
    })
    return handleResponse(res)
  },

  async getCategorias(page = 1, size = 100) {
    const res = await fetch(`${API_URL}/categorias/?page=${page}&size=${size}`)
    return handleResponse(res)
  },

  async createCategoria(categoriaData) {
    const res = await fetch(`${API_URL}/categorias/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoriaData),
    })
    return handleResponse(res)
  },

  async deleteCategoria(id) {
    const res = await fetch(`${API_URL}/categorias/${id}`, {
      method: 'DELETE',
    })
    return handleResponse(res)
  },

  async getProveedores(page = 1, size = 100) {
    const res = await fetch(`${API_URL}/proveedores/?page=${page}&size=${size}`)
    return handleResponse(res)
  },

  async createProveedor(proveedorData) {
    const res = await fetch(`${API_URL}/proveedores/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proveedorData),
    })
    return handleResponse(res)
  },

  async deleteProveedor(id) {
    const res = await fetch(`${API_URL}/proveedores/${id}`, {
      method: 'DELETE',
    })
    return handleResponse(res)
  },
}
