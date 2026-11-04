import { useState, useEffect } from 'react'
import { api } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'

const initialProductoForm = {
  nombre: '',
  codigo_barra: '',
  descripcion: '',
  precio: '',
  stock: 0,
  stock_minimo: 5,
  categoria_id: '',
  proveedor_id: '',
}

const initialCategoriaForm = {
  nombre: '',
  descripcion: '',
}

const initialProveedorForm = {
  nombre: '',
  cuit: '',
  email: '',
  telefono: '',
  direccion: '',
}

export default function Administracion() {
  const [activeTab, setActiveTab] = useState('productos') // 'productos' | 'categorias' | 'proveedores'
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])

  // Formularios
  const [productoForm, setProductoForm] = useState(initialProductoForm)
  const [productoErrors, setProductoErrors] = useState({})

  const [categoriaForm, setCategoriaForm] = useState(initialCategoriaForm)
  const [categoriaErrors, setCategoriaErrors] = useState({})

  const [proveedorForm, setProveedorForm] = useState(initialProveedorForm)
  const [proveedorErrors, setProveedorErrors] = useState({})

  // Estados de carga y feedback
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

  // --- Validación Producto ---
  const validateProducto = () => {
    const errors = {}

    if (!productoForm.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio.'
    } else if (productoForm.nombre.trim().length < 2) {
      errors.nombre = 'Debe contener al menos 2 caracteres.'
    } else if (productoForm.nombre.length > 150) {
      errors.nombre = 'Máximo 150 caracteres permitidos.'
    }

    if (!productoForm.codigo_barra.trim()) {
      errors.codigo_barra = 'El código SKU es obligatorio.'
    } else if (productoForm.codigo_barra.trim().length < 3) {
      errors.codigo_barra = 'Mínimo 3 caracteres requeridos.'
    }

    const precioNum = Number(productoForm.precio)
    if (!productoForm.precio || isNaN(precioNum) || precioNum <= 0) {
      errors.precio = 'Debe ingresar un precio numérico mayor a 0.'
    }

    const stockNum = Number(productoForm.stock)
    if (isNaN(stockNum) || stockNum < 0) {
      errors.stock = 'El stock no puede ser negativo.'
    }

    const stockMinNum = Number(productoForm.stock_minimo)
    if (isNaN(stockMinNum) || stockMinNum < 0) {
      errors.stock_minimo = 'El stock mínimo no puede ser negativo.'
    }

    if (!productoForm.categoria_id) {
      errors.categoria_id = 'Debe seleccionar una categoría.'
    }

    if (!productoForm.proveedor_id) {
      errors.proveedor_id = 'Debe seleccionar un proveedor.'
    }

    setProductoErrors(errors)
    return Object.keys(errors).length === 0
  }

  // --- Validación Categoría ---
  const validateCategoria = () => {
    const errors = {}

    if (!categoriaForm.nombre.trim()) {
      errors.nombre = 'El nombre de la categoría es obligatorio.'
    } else if (categoriaForm.nombre.trim().length < 2) {
      errors.nombre = 'Debe contener al menos 2 caracteres.'
    } else if (categoriaForm.nombre.length > 100) {
      errors.nombre = 'Máximo 100 caracteres permitidos.'
    }

    if (categoriaForm.descripcion && categoriaForm.descripcion.length > 255) {
      errors.descripcion = 'Máximo 255 caracteres permitidos.'
    }

    setCategoriaErrors(errors)
    return Object.keys(errors).length === 0
  }

  // --- Validación Proveedor ---
  const validateProveedor = () => {
    const errors = {}

    if (!proveedorForm.nombre.trim()) {
      errors.nombre = 'La razón social / nombre es obligatorio.'
    } else if (proveedorForm.nombre.trim().length < 2) {
      errors.nombre = 'Debe contener al menos 2 caracteres.'
    } else if (proveedorForm.nombre.length > 120) {
      errors.nombre = 'Máximo 120 caracteres permitidos.'
    }

    if (!proveedorForm.cuit.trim()) {
      errors.cuit = 'El CUIT es obligatorio.'
    } else if (proveedorForm.cuit.trim().length < 10) {
      errors.cuit = 'Mínimo 10 caracteres requeridos.'
    } else if (proveedorForm.cuit.trim().length > 15) {
      errors.cuit = 'Máximo 15 caracteres permitidos.'
    }

    if (proveedorForm.email && proveedorForm.email.length > 100) {
      errors.email = 'Máximo 100 caracteres permitidos.'
    }

    if (proveedorForm.telefono && proveedorForm.telefono.length > 30) {
      errors.telefono = 'Máximo 30 caracteres permitidos.'
    }

    if (proveedorForm.direccion && proveedorForm.direccion.length > 200) {
      errors.direccion = 'Máximo 200 caracteres permitidos.'
    }

    setProveedorErrors(errors)
    return Object.keys(errors).length === 0
  }

  // --- Handlers de Producto ---
  const handleProductoChange = (e) => {
    const { name, value } = e.target
    setProductoForm((prev) => ({ ...prev, [name]: value }))
    if (productoErrors[name]) {
      setProductoErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmitProducto = async (e) => {
    e.preventDefault()
    setSuccess(null)
    setError(null)

    if (!validateProducto()) return

    try {
      setSubmitting(true)
      const payload = {
        nombre: productoForm.nombre.trim(),
        codigo_barra: productoForm.codigo_barra.trim(),
        descripcion: productoForm.descripcion.trim() || null,
        precio: parseFloat(productoForm.precio),
        stock: parseInt(productoForm.stock, 10),
        stock_minimo: parseInt(productoForm.stock_minimo, 10),
        categoria_id: parseInt(productoForm.categoria_id, 10),
        proveedor_id: parseInt(productoForm.proveedor_id, 10),
      }

      const nuevoProducto = await api.createProducto(payload)
      setProductos((prev) => [nuevoProducto, ...prev])
      setProductoForm(initialProductoForm)
      setProductoErrors({})
      setSuccess(`¡Producto "${nuevoProducto.nombre}" registrado exitosamente con ID #${nuevoProducto.id}!`)
    } catch (err) {
      setError(`Error al registrar el producto: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProducto = async (id, nombre) => {
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

  // --- Handlers de Categoría ---
  const handleCategoriaChange = (e) => {
    const { name, value } = e.target
    setCategoriaForm((prev) => ({ ...prev, [name]: value }))
    if (categoriaErrors[name]) {
      setCategoriaErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmitCategoria = async (e) => {
    e.preventDefault()
    setSuccess(null)
    setError(null)

    if (!validateCategoria()) return

    try {
      setSubmitting(true)
      const payload = {
        nombre: categoriaForm.nombre.trim(),
        descripcion: categoriaForm.descripcion.trim() || null,
      }

      const nuevaCategoria = await api.createCategoria(payload)
      setCategorias((prev) => [...prev, nuevaCategoria])
      setCategoriaForm(initialCategoriaForm)
      setCategoriaErrors({})
      setSuccess(`¡Categoría "${nuevaCategoria.nombre}" creada con éxito (ID #${nuevaCategoria.id})!`)
    } catch (err) {
      setError(`Error al crear la categoría: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCategoria = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de que deseás eliminar la categoría "${nombre}" (ID #${id})? Se eliminarán también los productos asociados.`)) {
      return
    }

    try {
      setError(null)
      await api.deleteCategoria(id)
      setCategorias((prev) => prev.filter((c) => c.id !== id))
      setProductos((prev) => prev.filter((p) => p.categoria_id !== id))
      setSuccess(`La categoría #${id} ha sido eliminada correctamente.`)
    } catch (err) {
      setError(`No se pudo eliminar la categoría: ${err.message}`)
    }
  }

  // --- Handlers de Proveedor ---
  const handleProveedorChange = (e) => {
    const { name, value } = e.target
    setProveedorForm((prev) => ({ ...prev, [name]: value }))
    if (proveedorErrors[name]) {
      setProveedorErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmitProveedor = async (e) => {
    e.preventDefault()
    setSuccess(null)
    setError(null)

    if (!validateProveedor()) return

    try {
      setSubmitting(true)
      const payload = {
        nombre: proveedorForm.nombre.trim(),
        cuit: proveedorForm.cuit.trim(),
        email: proveedorForm.email.trim() || null,
        telefono: proveedorForm.telefono.trim() || null,
        direccion: proveedorForm.direccion.trim() || null,
      }

      const nuevoProveedor = await api.createProveedor(payload)
      setProveedores((prev) => [...prev, nuevoProveedor])
      setProveedorForm(initialProveedorForm)
      setProveedorErrors({})
      setSuccess(`¡Proveedor "${nuevoProveedor.nombre}" registrado con éxito (ID #${nuevoProveedor.id})!`)
    } catch (err) {
      setError(`Error al registrar el proveedor: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProveedor = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de que deseás eliminar el proveedor "${nombre}" (ID #${id})? Se eliminarán también los productos asociados.`)) {
      return
    }

    try {
      setError(null)
      await api.deleteProveedor(id)
      setProveedores((prev) => prev.filter((p) => p.id !== id))
      setProductos((prev) => prev.filter((p) => p.proveedor_id !== id))
      setSuccess(`El proveedor #${id} ha sido eliminado correctamente.`)
    } catch (err) {
      setError(`No se pudo eliminar el proveedor: ${err.message}`)
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
          Alta y gestión de productos, categorías y proveedores con validación de formularios y conexión directa a la API.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab('productos')
            setError(null)
            setSuccess(null)
          }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'productos'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>📦</span>
          <span>Productos ({productos.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('categorias')
            setError(null)
            setSuccess(null)
          }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'categorias'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>🏷️</span>
          <span>Categorías ({categorias.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('proveedores')
            setError(null)
            setSuccess(null)
          }}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'proveedores'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>🏭</span>
          <span>Proveedores ({proveedores.length})</span>
        </button>
      </div>

      <Alert type="error" message={error} onClose={() => setError(null)} />
      <Alert type="success" message={success} onClose={() => setSuccess(null)} />

      {/* --- VISTA PRODUCTOS --- */}
      {activeTab === 'productos' && (
        <div className="space-y-8">
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

            <form onSubmit={handleSubmitProducto} className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label htmlFor="nombre" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={productoForm.nombre}
                    onChange={handleProductoChange}
                    placeholder="Ej: Taladro Percutor Bosch 750W"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      productoErrors.nombre
                        ? 'border-red-300 focus:ring-red-500 bg-red-50/30'
                        : 'border-slate-200 focus:ring-blue-500 bg-white'
                    }`}
                  />
                  {productoErrors.nombre && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{productoErrors.nombre}</p>
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
                    value={productoForm.codigo_barra}
                    onChange={handleProductoChange}
                    placeholder="Ej: 7791234567890"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 ${
                      productoErrors.codigo_barra
                        ? 'border-red-300 focus:ring-red-500 bg-red-50/30'
                        : 'border-slate-200 focus:ring-blue-500 bg-white'
                    }`}
                  />
                  {productoErrors.codigo_barra && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{productoErrors.codigo_barra}</p>
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
                    value={productoForm.precio}
                    onChange={handleProductoChange}
                    placeholder="Ej: 89500.00"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      productoErrors.precio
                        ? 'border-red-300 focus:ring-red-500 bg-red-50/30'
                        : 'border-slate-200 focus:ring-blue-500 bg-white'
                    }`}
                  />
                  {productoErrors.precio && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{productoErrors.precio}</p>
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
                    value={productoForm.stock}
                    onChange={handleProductoChange}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      productoErrors.stock
                        ? 'border-red-300 focus:ring-red-500 bg-red-50/30'
                        : 'border-slate-200 focus:ring-blue-500 bg-white'
                    }`}
                  />
                  {productoErrors.stock && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{productoErrors.stock}</p>
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
                    value={productoForm.stock_minimo}
                    onChange={handleProductoChange}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      productoErrors.stock_minimo
                        ? 'border-red-300 focus:ring-red-500 bg-red-50/30'
                        : 'border-slate-200 focus:ring-blue-500 bg-white'
                    }`}
                  />
                  {productoErrors.stock_minimo && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{productoErrors.stock_minimo}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="categoria_id" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Categoría *
                  </label>
                  <select
                    id="categoria_id"
                    name="categoria_id"
                    value={productoForm.categoria_id}
                    onChange={handleProductoChange}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      productoErrors.categoria_id
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
                  {productoErrors.categoria_id && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{productoErrors.categoria_id}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="proveedor_id" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Proveedor *
                  </label>
                  <select
                    id="proveedor_id"
                    name="proveedor_id"
                    value={productoForm.proveedor_id}
                    onChange={handleProductoChange}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      productoErrors.proveedor_id
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
                  {productoErrors.proveedor_id && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{productoErrors.proveedor_id}</p>
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
                    value={productoForm.descripcion}
                    onChange={handleProductoChange}
                    placeholder="Detalles técnicos, especificaciones, voltaje, potencia..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  ></textarea>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setProductoForm(initialProductoForm)
                    setProductoErrors({})
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

          {/* Tabla de Productos */}
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
                          onClick={() => handleDeleteProducto(prod.id, prod.nombre)}
                          className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold rounded-lg border border-red-200 transition-colors"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {productos.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        No hay productos registrados en el sistema.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- VISTA CATEGORÍAS --- */}
      {activeTab === 'categorias' && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>➕</span>
                <span>Registrar Nueva Categoría</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Clasificá los productos por rubros o familias de artículos para organizar el inventario.
              </p>
            </div>

            <form onSubmit={handleSubmitCategoria} className="p-6 sm:p-8 space-y-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="catNombre" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Nombre de la Categoría *
                  </label>
                  <input
                    type="text"
                    id="catNombre"
                    name="nombre"
                    value={categoriaForm.nombre}
                    onChange={handleCategoriaChange}
                    placeholder="Ej: Herramientas Manuales, Pinturería, Fijaciones..."
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      categoriaErrors.nombre
                        ? 'border-red-300 focus:ring-red-500 bg-red-50/30'
                        : 'border-slate-200 focus:ring-blue-500 bg-white'
                    }`}
                  />
                  {categoriaErrors.nombre && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{categoriaErrors.nombre}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="catDescripcion" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="catDescripcion"
                    name="descripcion"
                    rows="3"
                    value={categoriaForm.descripcion}
                    onChange={handleCategoriaChange}
                    placeholder="Descripción breve del rubro o sector..."
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      categoriaErrors.descripcion
                        ? 'border-red-300 focus:ring-red-500 bg-red-50/30'
                        : 'border-slate-200 focus:ring-blue-500 bg-white'
                    }`}
                  ></textarea>
                  {categoriaErrors.descripcion && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{categoriaErrors.descripcion}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCategoriaForm(initialCategoriaForm)
                    setCategoriaErrors({})
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
                  {submitting ? 'Guardando...' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>

          {/* Tabla de Categorías */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Categorías Registradas ({categorias.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lista de rubros disponibles en la base de datos de la ferretería.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-6">ID</th>
                    <th className="py-3 px-6">Nombre</th>
                    <th className="py-3 px-6">Descripción</th>
                    <th className="py-3 px-6 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categorias.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-xs text-slate-400">
                        #{cat.id}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-800">
                        {cat.nombre}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 max-w-md truncate">
                        {cat.descripcion || <span className="text-slate-400 italic">Sin descripción</span>}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleDeleteCategoria(cat.id, cat.nombre)}
                          className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold rounded-lg border border-red-200 transition-colors"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {categorias.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400">
                        No hay categorías registradas en el sistema.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- VISTA PROVEEDORES --- */}
      {activeTab === 'proveedores' && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>➕</span>
                <span>Registrar Nuevo Proveedor</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Alta de fabricantes, distribuidores o proveedores mayoristas.
              </p>
            </div>

            <form onSubmit={handleSubmitProveedor} className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="provNombre" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Razón Social / Nombre *
                  </label>
                  <input
                    type="text"
                    id="provNombre"
                    name="nombre"
                    value={proveedorForm.nombre}
                    onChange={handleProveedorChange}
                    placeholder="Ej: Stanley Black & Decker S.A."
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      proveedorErrors.nombre
                        ? 'border-red-300 focus:ring-red-500 bg-red-50/30'
                        : 'border-slate-200 focus:ring-blue-500 bg-white'
                    }`}
                  />
                  {proveedorErrors.nombre && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{proveedorErrors.nombre}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="provCuit" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    CUIT *
                  </label>
                  <input
                    type="text"
                    id="provCuit"
                    name="cuit"
                    value={proveedorForm.cuit}
                    onChange={handleProveedorChange}
                    placeholder="Ej: 30-70123456-8"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 ${
                      proveedorErrors.cuit
                        ? 'border-red-300 focus:ring-red-500 bg-red-50/30'
                        : 'border-slate-200 focus:ring-blue-500 bg-white'
                    }`}
                  />
                  {proveedorErrors.cuit && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{proveedorErrors.cuit}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="provEmail" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="provEmail"
                    name="email"
                    value={proveedorForm.email}
                    onChange={handleProveedorChange}
                    placeholder="ventas@proveedor.com"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      proveedorErrors.email
                        ? 'border-red-300 focus:ring-red-500 bg-red-50/30'
                        : 'border-slate-200 focus:ring-blue-500 bg-white'
                    }`}
                  />
                  {proveedorErrors.email && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{proveedorErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="provTelefono" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    id="provTelefono"
                    name="telefono"
                    value={proveedorForm.telefono}
                    onChange={handleProveedorChange}
                    placeholder="+54 11 4000-0000"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      proveedorErrors.telefono
                        ? 'border-red-300 focus:ring-red-500 bg-red-50/30'
                        : 'border-slate-200 focus:ring-blue-500 bg-white'
                    }`}
                  />
                  {proveedorErrors.telefono && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{proveedorErrors.telefono}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="provDireccion" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    id="provDireccion"
                    name="direccion"
                    value={proveedorForm.direccion}
                    onChange={handleProveedorChange}
                    placeholder="Av. Industrial 1234, CABA"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      proveedorErrors.direccion
                        ? 'border-red-300 focus:ring-red-500 bg-red-50/30'
                        : 'border-slate-200 focus:ring-blue-500 bg-white'
                    }`}
                  />
                  {proveedorErrors.direccion && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{proveedorErrors.direccion}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setProveedorForm(initialProveedorForm)
                    setProveedorErrors({})
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
                  {submitting ? 'Guardando...' : 'Crear Proveedor'}
                </button>
              </div>
            </form>
          </div>

          {/* Tabla de Proveedores */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Proveedores Registrados ({proveedores.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lista de mayoristas y distribuidores vinculados.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-6">ID</th>
                    <th className="py-3 px-6">Razón Social</th>
                    <th className="py-3 px-6">CUIT</th>
                    <th className="py-3 px-6">Email</th>
                    <th className="py-3 px-6">Teléfono</th>
                    <th className="py-3 px-6">Dirección</th>
                    <th className="py-3 px-6 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proveedores.map((prov) => (
                    <tr key={prov.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-xs text-slate-400">
                        #{prov.id}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-800">
                        {prov.nombre}
                      </td>
                      <td className="py-3.5 px-6 font-mono text-xs text-slate-600">
                        {prov.cuit}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">
                        {prov.email || <span className="text-slate-400 italic">-</span>}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">
                        {prov.telefono || <span className="text-slate-400 italic">-</span>}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 max-w-xs truncate">
                        {prov.direccion || <span className="text-slate-400 italic">-</span>}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleDeleteProveedor(prov.id, prov.nombre)}
                          className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold rounded-lg border border-red-200 transition-colors"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {proveedores.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        No hay proveedores registrados en el sistema.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
