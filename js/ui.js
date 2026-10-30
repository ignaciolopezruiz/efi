/**
 * Módulo de interfaz de usuario y renderizado de componentes DOM.
 */

export const UI = {
  // Toast notifications
  showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Modal helpers
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  },

  // Render Estado de la API
  renderApiStatus(isOnline, url) {
    const indicator = document.getElementById('apiStatusIndicator');
    const text = document.getElementById('apiStatusText');
    const endpoint = document.getElementById('apiEndpointUrl');

    if (endpoint) endpoint.textContent = url;

    if (isOnline) {
      if (indicator) {
        indicator.className = 'status-indicator online';
      }
      if (text) text.textContent = 'API Conectada';
    } else {
      if (indicator) {
        indicator.className = 'status-indicator offline';
      }
      if (text) text.textContent = 'API Desconectada';
    }
  },

  // Render Estadísticas del Dashboard
  renderDashboardStats({ totalProductos, stockCritico, totalCategorias, totalProveedores }) {
    const elProd = document.getElementById('statTotalProductos');
    const elCrit = document.getElementById('statStockCritico');
    const elCat = document.getElementById('statTotalCategorias');
    const elProv = document.getElementById('statTotalProveedores');
    const elBadge = document.getElementById('badgeStockBajo');

    if (elProd) elProd.textContent = totalProductos;
    if (elCrit) elCrit.textContent = stockCritico;
    if (elCat) elCat.textContent = totalCategorias;
    if (elProv) elProv.textContent = totalProveedores;
    if (elBadge) elBadge.textContent = `${stockCritico} alertas`;
  },

  // Render Tabla de Stock Bajo
  renderLowStockTable(productos) {
    const tbody = document.getElementById('lowStockTableBody');
    if (!tbody) return;

    if (productos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-state">✅ Todo el catálogo cuenta con stock suficiente.</td></tr>`;
      return;
    }

    tbody.innerHTML = productos.map(p => `
      <tr>
        <td><strong>${p.codigo_barra}</strong></td>
        <td>${p.nombre}</td>
        <td><strong style="color: var(--danger)">${p.stock}</strong></td>
        <td>${p.stock_minimo}</td>
        <td>
          <span class="badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}">
            ${p.stock === 0 ? 'Sin Stock' : 'Stock Crítico'}
          </span>
        </td>
      </tr>
    `).join('');
  },

  // Render Tabla de Productos
  renderProductosTable(productos, { onView, onEdit, onDelete }) {
    const tbody = document.getElementById('productosTableBody');
    if (!tbody) return;

    if (!productos || productos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No hay productos registrados o que coincidan con la búsqueda.</td></tr>`;
      return;
    }

    tbody.innerHTML = productos.map(p => `
      <tr data-id="${p.id}">
        <td>${p.id}</td>
        <td><code>${p.codigo_barra}</code></td>
        <td><strong>${p.nombre}</strong></td>
        <td>$${p.precio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td>
          <span class="badge ${p.stock <= p.stock_minimo ? 'badge-warning' : 'badge-success'}">
            ${p.stock} unid.
          </span>
        </td>
        <td>${p.stock_minimo}</td>
        <td>
          <div class="btn-group">
            <button class="btn btn-secondary btn-sm btn-view-prod" title="Ver detalles y relaciones">👁️</button>
            <button class="btn btn-secondary btn-sm btn-edit-prod" title="Editar">✏️</button>
            <button class="btn btn-danger btn-sm btn-delete-prod" title="Eliminar">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

    // Asignar listeners
    tbody.querySelectorAll('tr').forEach(row => {
      const id = parseInt(row.getAttribute('data-id'), 10);
      const prod = productos.find(item => item.id === id);

      row.querySelector('.btn-view-prod')?.addEventListener('click', () => onView(id));
      row.querySelector('.btn-edit-prod')?.addEventListener('click', () => onEdit(prod));
      row.querySelector('.btn-delete-prod')?.addEventListener('click', () => onDelete(id));
    });
  },

  // Render Modal Detalle de Producto (anidado)
  renderProductoDetalle(producto) {
    const body = document.getElementById('modalDetalleBody');
    if (!body) return;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <span class="badge badge-success">ID #${producto.id}</span>
          <h2 style="margin-top: 0.25rem;">${producto.nombre}</h2>
          <p style="color: var(--text-muted);">${producto.descripcion || 'Sin descripción técnica disponible.'}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; background: #f8fafc; padding: 1rem; border-radius: 8px;">
          <div><strong>Código de Barras:</strong> <code>${producto.codigo_barra}</code></div>
          <div><strong>Precio Unitario:</strong> $${producto.precio.toFixed(2)}</div>
          <div><strong>Stock Actual:</strong> ${producto.stock}</div>
          <div><strong>Stock Mínimo:</strong> ${producto.stock_minimo}</div>
        </div>

        <div style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
          <h4 style="margin-bottom: 0.5rem;">🏷️ Categoría Asociada</h4>
          ${producto.categoria ? `
            <p><strong>${producto.categoria.nombre}</strong></p>
            <small style="color: var(--text-muted);">${producto.categoria.descripcion || 'Sin descripción'}</small>
          ` : '<p style="color: var(--text-muted)">Categoría no disponible</p>'}
        </div>

        <div style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
          <h4 style="margin-bottom: 0.5rem;">🏭 Proveedor Suministrador</h4>
          ${producto.proveedor ? `
            <p><strong>${producto.proveedor.nombre}</strong> (CUIT: ${producto.proveedor.cuit})</p>
            <p style="font-size: 0.85rem; color: var(--text-muted);">
              📧 ${producto.proveedor.email || 'N/A'} | 📞 ${producto.proveedor.telefono || 'N/A'}<br>
              📍 ${producto.proveedor.direccion || 'N/A'}
            </p>
          ` : '<p style="color: var(--text-muted)">Proveedor no disponible</p>'}
        </div>
      </div>
    `;
  },

  // Render Categorías
  renderCategoriasTable(categorias, { onEdit, onDelete }) {
    const tbody = document.getElementById('categoriasTableBody');
    if (!tbody) return;

    if (!categorias || categorias.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty-state">No hay categorías registradas.</td></tr>`;
      return;
    }

    tbody.innerHTML = categorias.map(c => `
      <tr data-id="${c.id}">
        <td>${c.id}</td>
        <td><strong>${c.nombre}</strong></td>
        <td>${c.descripcion || '<em style="color: var(--text-muted)">Sin descripción</em>'}</td>
        <td>
          <div class="btn-group">
            <button class="btn btn-secondary btn-sm btn-edit-cat" title="Editar">✏️</button>
            <button class="btn btn-danger btn-sm btn-delete-cat" title="Eliminar">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('tr').forEach(row => {
      const id = parseInt(row.getAttribute('data-id'), 10);
      const cat = categorias.find(item => item.id === id);

      row.querySelector('.btn-edit-cat')?.addEventListener('click', () => onEdit(cat));
      row.querySelector('.btn-delete-cat')?.addEventListener('click', () => onDelete(id));
    });
  },

  // Render Proveedores
  renderProveedoresTable(proveedores, { onEdit, onDelete }) {
    const tbody = document.getElementById('proveedoresTableBody');
    if (!tbody) return;

    if (!proveedores || proveedores.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No hay proveedores registrados.</td></tr>`;
      return;
    }

    tbody.innerHTML = proveedores.map(p => `
      <tr data-id="${p.id}">
        <td>${p.id}</td>
        <td><strong>${p.nombre}</strong></td>
        <td><code>${p.cuit}</code></td>
        <td>${p.email || '-'}</td>
        <td>${p.telefono || '-'}</td>
        <td>${p.direccion || '-'}</td>
        <td>
          <div class="btn-group">
            <button class="btn btn-secondary btn-sm btn-edit-prov" title="Editar">✏️</button>
            <button class="btn btn-danger btn-sm btn-delete-prov" title="Eliminar">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('tr').forEach(row => {
      const id = parseInt(row.getAttribute('data-id'), 10);
      const prov = proveedores.find(item => item.id === id);

      row.querySelector('.btn-edit-prov')?.addEventListener('click', () => onEdit(prov));
      row.querySelector('.btn-delete-prov')?.addEventListener('click', () => onDelete(id));
    });
  },

  // Poblar Selectores de Formulario de Producto
  populateSelectOptions(categorias, proveedores) {
    const selCat = document.getElementById('prodCategoria');
    const selProv = document.getElementById('prodProveedor');

    if (selCat) {
      selCat.innerHTML = '<option value="">Seleccione una categoría</option>' +
        categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    }

    if (selProv) {
      selProv.innerHTML = '<option value="">Seleccione un proveedor</option>' +
        proveedores.map(p => `<option value="${p.id}">${p.nombre} (${p.cuit})</option>`).join('');
    }
  }
};
