/**
 * Módulo de comunicación HTTP con la API de FastAPI (Ferretería Industrial).
 * Maneja peticiones asíncronas con fetch, headers JSON y parseo de errores.
 */

export class ApiService {
  constructor(baseUrl = 'http://127.0.0.1:8000') {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  setBaseUrl(url) {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Si la respuesta no es 2xx, obtener detalle del error de FastAPI
      if (!response.ok) {
        let errorDetail = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorJson = await response.json();
          if (errorJson.detail) {
            if (Array.isArray(errorJson.detail)) {
              // Validaciones de Pydantic
              errorDetail = errorJson.detail.map(d => `${d.loc.slice(1).join('.')}: ${d.msg}`).join(', ');
            } else {
              errorDetail = errorJson.detail;
            }
          }
        } catch (_) {
          // No es JSON, mantener statusText
        }
        throw new Error(errorDetail);
      }

      // Si no hay contenido (ej 204 No Content)
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (err) {
      console.error(`[API Request Error] ${options.method || 'GET'} ${url}:`, err);
      throw err;
    }
  }

  // Comprobar estado de salud
  async checkHealth() {
    return await this.request('/');
  }

  // --- PRODUCTOS ---
  async getProductos(page = 1, size = 50) {
    return await this.request(`/productos/?page=${page}&size=${size}`);
  }

  async getProductoById(id) {
    return await this.request(`/productos/${id}`);
  }

  async createProducto(data) {
    return await this.request('/productos/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProducto(id, data) {
    return await this.request(`/productos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProducto(id) {
    return await this.request(`/productos/${id}`, {
      method: 'DELETE',
    });
  }

  // --- CATEGORÍAS ---
  async getCategorias(page = 1, size = 100) {
    return await this.request(`/categorias/?page=${page}&size=${size}`);
  }

  async getCategoriaById(id) {
    return await this.request(`/categorias/${id}`);
  }

  async createCategoria(data) {
    return await this.request('/categorias/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategoria(id, data) {
    return await this.request(`/categorias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCategoria(id) {
    return await this.request(`/categorias/${id}`, {
      method: 'DELETE',
    });
  }

  // --- PROVEEDORES ---
  async getProveedores(page = 1, size = 100) {
    return await this.request(`/proveedores/?page=${page}&size=${size}`);
  }

  async getProveedorById(id) {
    return await this.request(`/proveedores/${id}`);
  }

  async createProveedor(data) {
    return await this.request('/proveedores/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProveedor(id, data) {
    return await this.request(`/proveedores/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProveedor(id) {
    return await this.request(`/proveedores/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
