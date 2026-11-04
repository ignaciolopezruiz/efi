# Ferretería Industrial — Cliente Web React 🛠️
### Evaluación Final Integradora (EFI) — Práctica Profesionalizante 1 (PP1 - JavaScript)
**Instituto Tecnológico (ITEC)**

---

## Integrantes del Equipo
* **Ignacio López Ruiz**
* [Nombre y Apellido Integrante 2]
* [Nombre y Apellido Integrante 3]
* [Nombre y Apellido Integrante 4]

---

## Descripción del Proyecto
Aplicación Single Page Application (SPA) desarrollada en **React** con **Vite** y estilos en **Tailwind CSS** para la gestión comercial y catálogo de una **Ferretería Industrial**. 

La aplicación consume de forma asíncrona la API RESTful desarrollada con **FastAPI** (desplegada en FastAPI Cloud y ejecutable localmente), implementando enrutamiento con múltiples vistas (`react-router-dom`), rutas dinámicas y anidadas, gestión de estado local con `useState` y `useEffect`, y gestión de estado global mediante `Context API`.

---

## Requisitos Técnicos Implementados

### R1: Enrutamiento y Navegación (`react-router-dom`)
* **Rutas Base:**
  * `/`: Tablero principal con indicadores clave de inventario (KPIs) y tabla de alertas de stock crítico.
  * `/productos`: Catálogo general con buscador reactivo en tiempo real.
  * `/favoritos`: Listado de herramientas y productos guardados en favoritos.
  * `/administracion`: Panel de gestión para registrar nuevos artículos y dar de baja productos.
* **Ruta Dinámica:**
  * `/productos/:id`: Vista de detalle técnico que recibe el ID por parámetro, consulta la API y muestra datos anidados de categoría y proveedor oficial.
* **Ruta Anidada:**
  * `/productos/categoria/:catId`: Subruta anidada implementada con `<Outlet />` dentro del catálogo para filtrar productos por rubro seleccionado.

### R2: Consumo de API y Manejo de Estado (`useState` y `useEffect`)
* **Operaciones CRUD Asíncronas:** Peticiones mediante `fetch` para leer (`GET`), crear (`POST`) y eliminar (`DELETE`) productos.
* **Manejo de Estado Obligatorio:** Uso de `useState` para almacenar datos, indicadores de carga (`loading`) y captura de errores de red o servidor (`error`).
* **Efectos Secundarios:** Uso de `useEffect` para disparar consultas a la API en la carga inicial y ante cambios en los parámetros de ruta o filtros.
* **Validación de Formularios:** Formulario controlado para alta de productos con validaciones de campos requeridos, longitud mínima/máxima y tipos numéricos positivos.

### R3: Gestión de Estado Global (`Context API`)
* Implementación de `FavoritesContext` mediante `createContext` y `useContext`.
* Permite agregar, consultar y remover artículos de la lista de favoritos en tiempo real desde cualquier vista de la aplicación, con persistencia en `localStorage` y contador reactivo en la barra de navegación.

### R4: Hosting y Variables de Entorno
* Configuración de la variable de entorno `VITE_API_URL` para alternar entre el backend local y el backend en producción.
* Archivo `vercel.json` configurado con reescritura de rutas para despliegue directo en **Vercel**.

---

## Pasos para Ejecutar la Aplicación de Forma Local

### 1. Ingresar a la carpeta del frontend
```bash
cd front
```

### 2. Instalar las dependencias
```bash
npm install
```

### 3. Configurar variables de entorno (Opcional)
Crear un archivo `.env` basado en `.env.example`:
```bash
VITE_API_URL=https://efi-e74ebfa4.fastapicloud.dev
```
*(O `http://127.0.0.1:8000` si se desea utilizar la API local)*

### 4. Iniciar el servidor de desarrollo
```bash
npm run dev
```

La aplicación quedará disponible en: `http://localhost:5173`

### 5. Compilar para producción (Build)
```bash
npm run build
```
