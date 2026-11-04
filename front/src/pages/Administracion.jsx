import { useState, useEffect } from 'react'
import { api } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'

const initialForm = {
  nombre: '',
  codigo_barra: '',
  descripcion: '',
  precio: '',
  stock: 0,
  stock_minimo: 5,
  categoria_id: '',
  proveedor_id: '',
}

export default function Administracion() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [formData, setFormData] = useState(initialForm)
  const [formErrors, setFormErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadAdminData() {
      try {
        setLoading(true)
        setError(null)
        const [prodRes, catRes, provRes] = await Promise.all([
          api.getProductos(1, 100),
          api.getCategorias(1, 100),
          api.getProveedores(1, 100),
        ])

        if (!isMounted) return

        setProductos(prodRes.items || [])
        setCategorias(catRes.items || [])
        setProveedores(provRes.items || [])
      } catch (err) {
        if (isMounted) {
          setError(`Error al consultar inventario: ${err.message}`)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadAdminData()

    return () => {
      isMounted = false
    }
  }, [])

  const validate = () => {
    const errors = {}

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio.'
    } else if (formData.nombre.trim().length < 2) {
      errors.nombre = 'Debe contener al menos 2 caracteres.'
    } else if (formData.nombre.length > 150) {
      errors.nombre = 'Máximo 150 caracteres permitidos.'
    }

    if (!formData.codigo_barra.trim()) {
      errors.codigo_barra = 'El código SKU es obligatorio.'
    } else if (formData.codigo_barra.trim().length < 3) {
      errors.codigo_barra = 'Mínimo 3 caracteres requeridos.'
    }

    const precioNum = Number(formData.precio)
    if (!formData.precio || isNaN(precioNum) || precioNum <= 0) {
      errors.precio = 'Debe ingresar un precio numérico mayor a 0.'
    }

    const stockNum = Number(formData.stock)
    if (isNaN(stockNum) || stockNum < 0) {
      errors.stock = 'El stock no puede ser negativo.'
    }

    const stockMinNum = Number(formData.stock_minimo)
    if (isNaN(stockMinNum) || stockMinNum < 0) {
      errors.stock_minimo = 'El stock mínimo no puede ser negativo.'
    }

    if (!formData.categoria_id) {
      errors.categoria_id = 'Debe seleccionar una categoría.'
    }

    if (!formData.proveedor_id) {
      errors.proveedor_id = 'Debe seleccionar un proveedor.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess(null)
    setError(null)

    if (!validate()) return

    try {
      setSubmitting(true)
      const payload = {
        nombre: formData.nombre.trim(),
        codigo_barra: formData.codigo_barra.trim(),
        descripcion: formData.descripcion.trim() || null,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock, 10),
        stock_minimo: parseInt(formData.stock_minimo, 10),
        categoria_id: parseInt(formData.categoria_id, 10),
        proveedor_id: parseInt(formData.proveedor_id, 10),
      }

      const nuevoProducto = await api.createProducto(payload)
      setProductos((prev) => [nuevoProducto, ...prev])
      setFormData(initialForm)
      setFormErrors({})
      setSuccess(`¡Producto "${nuevoProducto.nombre}" registrado exitosamente con ID #${nuevoProducto.id}!`)
    } catch (err) {
      setError(`Error al registrar el producto: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de que deseás eliminar el producto "${nombre}" (ID #${id})?`)) {
      return
    }

    try {
      setError(null)
      await api.deleteProducto(id)
      setProductos((prev) => prev.filter((p) => p.id !== id))
      setSuccess(`El producto #${id} ha sido eliminado del catálogo.`)
    } catch (err) {
      setError(`No se pudo eliminar el producto: ${err.message}`)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Cargando panel de administración..." />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Administración de Inventario
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Alta de nuevos artículos con validación de formularios y eliminación de registros (CRUD API).
        </p>
      </div>

      <Alert type="error" message={error} onClose={() => setError(null)} />
      <Alert type="success" message={success} onClose={() => setSuccess(null)} />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>➕</span>
            <span>Registrar Nuevo Producto</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Completá todos los campos obligatorios para dar de alta un producto en la API.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label htmlFor="nombre" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Taladro Percutor Bosch 750W"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                  formErrors.nombre
                    ? 'border-red-300 focus:ring-red-500 bg-red-50/30'
                    : 'border-slate-200 focus:ring-blue-500 bg-white'
                }`}
              />
              {formErrors.nombre && (
                <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.nombre}</p>
              )}
            </div>

            <div>
              <label htmlFor="codigo_barra" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Código de Barras / SKU *
              </label>
              <input
                type="text"
                id="codigo_barra"
                name="codigo_barra"
                value={formData.codigo_barra}
                onChange={handleChange}
                placeholder="Ej: 7891009852011"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 ${
                  formErrors.codigo_barra
                    ? 'border-red-300 focus:ring-red-500 bg-red-50/30'
                    : 'border-slate-200 focus:ring-blue-500 bg-white'
                }`}
              />
              {formErrors.codigo_barra && (
                <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.codigo_barra}</p>
              )}
            </div>

            <div>
              <label htmlFor="precio" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Precio Unitario ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                id="precio"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                placeholder="Ej: 89500.00"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                  formErrors.precio
                    ? 'border-red-300 focus:ring-red-500 bg-red-50/30'
                    : 'border-slate-200 focus:ring-blue-500 bg-white'
                }`}
              />
              {formErrors.precio && (
                <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.precio}</p>
              )}
            </div>

            <div>
              <label htmlFor="stock" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Stock Inicial *
              </label>
              <input
                type="number"
                min="0"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                  formErrors.stock
                    ? 'border-red-300 focus:ring-red-500 bg-red-50/30'
                    : 'border-slate-200 focus:ring-blue-500 bg-white'
                }`}
              />
              {formErrors.stock && (
                <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.stock}</p>
              )}
            </div>

            <div>
              <label htmlFor="stock_minimo" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Stock Mínimo (Punto de Reorden) *
              </label>
              <input
                type="number"
                min="0"
                id="stock_minimo"
                name="stock_minimo"
                value={formData.stock_minimo}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                  formErrors.stock_minimo
                    ? 'border-red-300 focus:ring-red-500 bg-red-50/30'
                    : 'border-slate-200 focus:ring-blue-500 bg-white'
                }`}
              />
              {formErrors.stock_minimo && (
                <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.stock_minimo}</p>
              )}
            </div>

            <div>
              <label htmlFor="categoria_id" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Categoría *
              </label>
              <select
                id="categoria_id"
                name="categoria_id"
                value={formData.categoria_id}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                  formErrors.categoria_id
                    ? 'border-red-300 focus:ring-red-500 bg-red-50/30'
                    : 'border-slate-200 focus:ring-blue-500 bg-white'
                }`}
              >
                <option value="">-- Seleccione una categoría --</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              {formErrors.categoria_id && (
                <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.categoria_id}</p>
              )}
            </div>

            <div>
              <label htmlFor="proveedor_id" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Proveedor *
              </label>
              <select
                id="proveedor_id"
                name="proveedor_id"
                value={formData.proveedor_id}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                  formErrors.proveedor_id
                    ? 'border-red-300 focus:ring-red-500 bg-red-50/30'
                    : 'border-slate-200 focus:ring-blue-500 bg-white'
                }`}
              >
                <option value="">-- Seleccione un proveedor --</option>
                {proveedores.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre}
                  </option>
                ))}
              </select>
              {formErrors.proveedor_id && (
                <p className="text-xs text-red-600 mt-1 font-medium">{formErrors.proveedor_id}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="descripcion" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Descripción Técnica
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows="3"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Detalles técnicos, especificaciones, voltaje, potencia..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              ></textarea>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setFormData(initialForm)
                setFormErrors({})
              }}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Limpiar Formulario
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Inventario Registrado ({productos.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestión directa de eliminación de productos en la base de datos.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">Código</th>
                <th className="py-3 px-6">Nombre</th>
                <th className="py-3 px-6">Precio</th>
                <th className="py-3 px-6">Stock</th>
                <th className="py-3 px-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productos.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-6 font-mono text-xs text-slate-400">
                    #{prod.id}
                  </td>
                  <td className="py-3.5 px-6 font-mono text-xs text-slate-600">
                    {prod.codigo_barra}
                  </td>
                  <td className="py-3.5 px-6 font-medium text-slate-800">
                    {prod.nombre}
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-slate-900">
                    ${Number(prod.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-6 text-slate-700">
                    {prod.stock} un.
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => handleDelete(prod.id, prod.nombre)}
                      className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold rounded-lg border border-red-200 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
