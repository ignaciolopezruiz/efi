/**
 * Controlador principal de la aplicación cliente (SPA).
 * Gestiona estados, eventos de navegación, llamadas al servicio API y reactividad.
 */

import { api } from './api.js';
import { UI } from './ui.js';

// Estado global de la aplicación
const AppState = {
  currentView: 'dashboard',
  productos: [],
  categorias: [],
  proveedores: [],
  filterProductos: '',
  filterCategorias: '',
  filterProveedores: '',
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  setupNavigation();
  setupApiUrlConfig();
  setupModalsAndForms();
  setupSearchFilters();

  // Comprobar API y cargar datos iniciales
  await checkApiAndLoadData();
}

/**
 * Configuración de navegación de vistas laterales
 */
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const viewSections = document.querySelectorAll('.view-section');
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');

  const titles = {
    dashboard: { title: 'Tablero Principal', subtitle: 'Resumen general del inventario y estado del sistema' },
    productos: { title: 'Catálogo de Productos', subtitle: 'Administración de stock, precios y artículos' },
    categorias: { title: 'Categorías', subtitle: 'Clasificación de rubros y departamentos' },
    proveedores: { title: 'Proveedores', subtitle: 'Registro de fabricantes y distribuidores mayoristas' },
  };

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      AppState.currentView = targetView;

      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      viewSections.forEach(sec => sec.classList.remove('active'));
      const activeSection = document.getElementById(`view${capitalize(targetView)}`);
      if (activeSection) activeSection.classList.add('active');

      if (titles[targetView]) {
        pageTitle.textContent = titles[targetView].title;
        pageSubtitle.textContent = titles[targetView].subtitle;
      }
    });
  });
}

/**
 * Conexión y verificación de API
 */
function setupApiUrlConfig() {
  const input = document.getElementById('apiUrlInput');
  const btnCheck = document.getElementById('btnCheckApi');

  btnCheck.addEventListener('click', async () => {
    const url = input.value.trim();
    if (!url) return;
    api.setBaseUrl(url);
    await checkApiAndLoadData();
  });
}

async function checkApiAndLoadData() {
  try {
    await api.checkHealth();
    UI.renderApiStatus(true, api.baseUrl);
    await refreshAllData();
  } catch (error) {
    UI.renderApiStatus(false, api.baseUrl);
    UI.showToast(`No se pudo conectar a la API en ${api.baseUrl}. Verificá que FastAPI esté corriendo.`, 'error');
  }
}

/**
 * Obtener todos los datos necesarios
 */
async function refreshAllData() {
  try {
    const [prodRes, catRes, provRes] = await Promise.all([
      api.getProductos(1, 100),
      api.getCategorias(1, 100),
      api.getProveedores(1, 100),
    ]);

    AppState.productos = prodRes.items || [];
    AppState.categorias = catRes.items || [];
    AppState.proveedores = provRes.items || [];

    // Actualizar selectores para productos
    UI.populateSelectOptions(AppState.categorias, AppState.proveedores);

    // Renderizar vistas
    renderCurrentState();
  } catch (err) {
    console.error('Error al actualizar datos:', err);
    UI.showToast(`Error al obtener datos: ${err.message}`, 'error');
  }
}

function renderCurrentState() {
  // 1. Dashboard
  const criticos = AppState.productos.filter(p => p.stock <= p.stock_minimo);
  UI.renderDashboardStats({
    totalProductos: AppState.productos.length,
    stockCritico: criticos.length,
    totalCategorias: AppState.categorias.length,
    totalProveedores: AppState.proveedores.length,
  });
  UI.renderLowStockTable(criticos);

  // 2. Productos
  applyProductosFilter();

  // 3. Categorías
  applyCategoriasFilter();

  // 4. Proveedores
  applyProveedoresFilter();
}

/**
 * Filtros de Búsqueda
 */
function setupSearchFilters() {
  const inputProd = document.getElementById('searchProductos');
  const inputCat = document.getElementById('searchCategorias');
  const inputProv = document.getElementById('searchProveedores');

  inputProd?.addEventListener('input', (e) => {
    AppState.filterProductos = e.target.value.toLowerCase();
    applyProductosFilter();
  });

  inputCat?.addEventListener('input', (e) => {
    AppState.filterCategorias = e.target.value.toLowerCase();
    applyCategoriasFilter();
  });

  inputProv?.addEventListener('input', (e) => {
    AppState.filterProveedores = e.target.value.toLowerCase();
    applyProveedoresFilter();
  });
}

function applyProductosFilter() {
  const q = AppState.filterProductos;
  const filtered = AppState.productos.filter(p =>
    p.nombre.toLowerCase().includes(q) ||
    p.codigo_barra.toLowerCase().includes(q)
  );

  UI.renderProductosTable(filtered, {
    onView: handleViewProducto,
    onEdit: handleEditProducto,
    onDelete: handleDeleteProducto,
  });
}

function applyCategoriasFilter() {
  const q = AppState.filterCategorias;
  const filtered = AppState.categorias.filter(c =>
    c.nombre.toLowerCase().includes(q) ||
    (c.descripcion && c.descripcion.toLowerCase().includes(q))
  );

  UI.renderCategoriasTable(filtered, {
    onEdit: handleEditCategoria,
    onDelete: handleDeleteCategoria,
  });
}

function applyProveedoresFilter() {
  const q = AppState.filterProveedores;
  const filtered = AppState.proveedores.filter(p =>
    p.nombre.toLowerCase().includes(q) ||
    p.cuit.toLowerCase().includes(q)
  );

  UI.renderProveedoresTable(filtered, {
    onEdit: handleEditProveedor,
    onDelete: handleDeleteProveedor,
  });
}

/**
 * Eventos y Modales (CRUD)
 */
function setupModalsAndForms() {
  // --- Modales de Cierre ---
  ['modalProducto', 'modalCategoria', 'modalProveedor', 'modalDetalleProducto'].forEach(id => {
    const modal = document.getElementById(id);
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) UI.closeModal(id);
    });
  });

  document.getElementById('btnCloseModalProducto')?.addEventListener('click', () => UI.closeModal('modalProducto'));
  document.getElementById('btnCancelModalProducto')?.addEventListener('click', () => UI.closeModal('modalProducto'));

  document.getElementById('btnCloseModalCategoria')?.addEventListener('click', () => UI.closeModal('modalCategoria'));
  document.getElementById('btnCancelModalCategoria')?.addEventListener('click', () => UI.closeModal('modalCategoria'));

  document.getElementById('btnCloseModalProveedor')?.addEventListener('click', () => UI.closeModal('modalProveedor'));
  document.getElementById('btnCancelModalProveedor')?.addEventListener('click', () => UI.closeModal('modalProveedor'));

  document.getElementById('btnCloseModalDetalle')?.addEventListener('click', () => UI.closeModal('modalDetalleProducto'));
  document.getElementById('btnCloseDetalleBtn')?.addEventListener('click', () => UI.closeModal('modalDetalleProducto'));

  // --- Botones de Apertura "Nuevo" ---
  document.getElementById('btnNuevoProducto')?.addEventListener('click', () => {
    document.getElementById('formProducto').reset();
    document.getElementById('prodId').value = '';
    document.getElementById('modalProductoTitle').textContent = 'Nuevo Producto';
    UI.openModal('modalProducto');
  });

  document.getElementById('btnNuevaCategoria')?.addEventListener('click', () => {
    document.getElementById('formCategoria').reset();
    document.getElementById('catId').value = '';
    document.getElementById('modalCategoriaTitle').textContent = 'Nueva Categoría';
    UI.openModal('modalCategoria');
  });

  document.getElementById('btnNuevoProveedor')?.addEventListener('click', () => {
    document.getElementById('formProveedor').reset();
    document.getElementById('provId').value = '';
    document.getElementById('modalProveedorTitle').textContent = 'Nuevo Proveedor';
    UI.openModal('modalProveedor');
  });

  // --- Submit de Formularios ---
  document.getElementById('formProducto')?.addEventListener('submit', onSubmitProducto);
  document.getElementById('formCategoria')?.addEventListener('submit', onSubmitCategoria);
  document.getElementById('formProveedor')?.addEventListener('submit', onSubmitProveedor);
}

// ----------------- CRUD PRODUCTOS -----------------
async function onSubmitProducto(e) {
  e.preventDefault();
  const id = document.getElementById('prodId').value;
  const payload = {
    nombre: document.getElementById('prodNombre').value.trim(),
    codigo_barra: document.getElementById('prodCodigo').value.trim(),
    precio: parseFloat(document.getElementById('prodPrecio').value),
    stock: parseInt(document.getElementById('prodStock').value, 10),
    stock_minimo: parseInt(document.getElementById('prodStockMin').value, 10),
    categoria_id: parseInt(document.getElementById('prodCategoria').value, 10),
    proveedor_id: parseInt(document.getElementById('prodProveedor').value, 10),
    descripcion: document.getElementById('prodDescripcion').value.trim() || null,
  };

  try {
    if (id) {
      await api.updateProducto(id, payload);
      UI.showToast('Producto actualizado correctamente.', 'success');
    } else {
      await api.createProducto(payload);
      UI.showToast('Producto creado con éxito.', 'success');
    }
    UI.closeModal('modalProducto');
    await refreshAllData();
  } catch (err) {
    UI.showToast(err.message, 'error');
  }
}

async function handleViewProducto(id) {
  try {
    const prod = await api.getProductoById(id);
    UI.renderProductoDetalle(prod);
    UI.openModal('modalDetalleProducto');
  } catch (err) {
    UI.showToast(`Error al consultar detalles: ${err.message}`, 'error');
  }
}

function handleEditProducto(prod) {
  document.getElementById('prodId').value = prod.id;
  document.getElementById('prodNombre').value = prod.nombre;
  document.getElementById('prodCodigo').value = prod.codigo_barra;
  document.getElementById('prodPrecio').value = prod.precio;
  document.getElementById('prodStock').value = prod.stock;
  document.getElementById('prodStockMin').value = prod.stock_minimo;
  document.getElementById('prodCategoria').value = prod.categoria_id;
  document.getElementById('prodProveedor').value = prod.proveedor_id;
  document.getElementById('prodDescripcion').value = prod.descripcion || '';

  document.getElementById('modalProductoTitle').textContent = `Editar Producto #${prod.id}`;
  UI.openModal('modalProducto');
}

async function handleDeleteProducto(id) {
  if (!confirm(`¿Estás seguro de que querés eliminar el producto ID #${id}?`)) return;
  try {
    await api.deleteProducto(id);
    UI.showToast(`Producto #${id} eliminado correctamente.`, 'success');
    await refreshAllData();
  } catch (err) {
    UI.showToast(`Error al eliminar: ${err.message}`, 'error');
  }
}

// ----------------- CRUD CATEGORÍAS -----------------
async function onSubmitCategoria(e) {
  e.preventDefault();
  const id = document.getElementById('catId').value;
  const payload = {
    nombre: document.getElementById('catNombre').value.trim(),
    descripcion: document.getElementById('catDescripcion').value.trim() || null,
  };

  try {
    if (id) {
      await api.updateCategoria(id, payload);
      UI.showToast('Categoría modificada.', 'success');
    } else {
      await api.createCategoria(payload);
      UI.showToast('Categoría creada exitosamente.', 'success');
    }
    UI.closeModal('modalCategoria');
    await refreshAllData();
  } catch (err) {
    UI.showToast(err.message, 'error');
  }
}

function handleEditCategoria(cat) {
  document.getElementById('catId').value = cat.id;
  document.getElementById('catNombre').value = cat.nombre;
  document.getElementById('catDescripcion').value = cat.descripcion || '';
  document.getElementById('modalCategoriaTitle').textContent = `Editar Categoría #${cat.id}`;
  UI.openModal('modalCategoria');
}

async function handleDeleteCategoria(id) {
  if (!confirm(`¿Eliminar la categoría ID #${id}? Asegurate de que no posea productos asociados.`)) return;
  try {
    await api.deleteCategoria(id);
    UI.showToast(`Categoría #${id} eliminada con éxito.`, 'success');
    await refreshAllData();
  } catch (err) {
    UI.showToast(`No se pudo eliminar: ${err.message}`, 'error');
  }
}

// ----------------- CRUD PROVEEDORES -----------------
async function onSubmitProveedor(e) {
  e.preventDefault();
  const id = document.getElementById('provId').value;
  const payload = {
    nombre: document.getElementById('provNombre').value.trim(),
    cuit: document.getElementById('provCuit').value.trim(),
    email: document.getElementById('provEmail').value.trim() || null,
    telefono: document.getElementById('provTelefono').value.trim() || null,
    direccion: document.getElementById('provDireccion').value.trim() || null,
  };

  try {
    if (id) {
      await api.updateProveedor(id, payload);
      UI.showToast('Proveedor modificado.', 'success');
    } else {
      await api.createProveedor(payload);
      UI.showToast('Proveedor registrado con éxito.', 'success');
    }
    UI.closeModal('modalProveedor');
    await refreshAllData();
  } catch (err) {
    UI.showToast(err.message, 'error');
  }
}

function handleEditProveedor(prov) {
  document.getElementById('provId').value = prov.id;
  document.getElementById('provNombre').value = prov.nombre;
  document.getElementById('provCuit').value = prov.cuit;
  document.getElementById('provEmail').value = prov.email || '';
  document.getElementById('provTelefono').value = prov.telefono || '';
  document.getElementById('provDireccion').value = prov.direccion || '';
  document.getElementById('modalProveedorTitle').textContent = `Editar Proveedor #${prov.id}`;
  UI.openModal('modalProveedor');
}

async function handleDeleteProveedor(id) {
  if (!confirm(`¿Eliminar el proveedor ID #${id}? Verificá que no suministre productos actualmente.`)) return;
  try {
    await api.deleteProveedor(id);
    UI.showToast(`Proveedor #${id} eliminado correctamente.`, 'success');
    await refreshAllData();
  } catch (err) {
    UI.showToast(`No se pudo eliminar: ${err.message}`, 'error');
  }
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
