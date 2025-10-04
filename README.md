# Prueba técnica de Jose Imbaquinga  
📞 Teléfono: 0999819224  

## 🌐 Demo en línea
Puedes ver la aplicación desplegada en Vercel:  
[https://prueba-tecnica-txsz.vercel.app](https://prueba-tecnica-txsz.vercel.app)

## 📌 Descripción
Este repositorio contiene el desarrollo de una **prueba técnica** realizada por **Jose Imbaquinga**, enfocada en demostrar habilidades en desarrollo de software, principalmente con **React (Vite)**, **Redux**, consumo de APIs y buenas prácticas de programación.

El proyecto se centra en la creación de un **sistema de inventario** con funcionalidades como:

- Gestión de productos
- Creación, edición y eliminación de registros
- Búsqueda y filtrado dinámico
- Integración con Redux para manejo global del estado
- Interfaz responsiva y moderna con CSS y animaciones
- Despliegue en **Vercel**

## 🚀 Tecnologías utilizadas
- **Frontend**: React + Vite  
- **Estado global**: Redux Toolkit  
- **Estilos**: CSS responsivo con media queries y animaciones  
- **Interacciones**: SweetAlert2 para modales  
- **Despliegue**: Vercel
- **Testing**: Vitest + React Testing Library

---

## ⚙️ Funcionalidades principales
1. **Gestión de productos (CRUD)**
   - Agregar un nuevo producto
   - Editar datos de productos existentes
   - Eliminar productos de forma controlada (con confirmación)

2. **Búsqueda en tiempo real**
   - Filtrado por nombre o categoría
   - Mensaje dinámico cuando no se encuentran resultados

3. **Interfaz de usuario**
   - Diseño moderno, responsivo y adaptable a móviles y tablets
   - Animaciones suaves al mostrar/ocultar elementos
   - Sección de productos relacionados y otros productos destacados

4. **Autenticación básica (con token)**
   - Inicio de sesión con validación
   - Token guardado en `localStorage`
   - Cierre de sesión con limpieza de datos

---

## 📂 Estructura del proyecto
```text
src/
├── assets       # Imágenes
├── components   # Componentes reutilizables
├── pages        # Páginas principales
├── redux        # Slices y store de Redux
├── styles       # Archivos CSS       
├── test         # Pruebas unitarias e integración
├── App.jsx      # Componente principal
└── main.jsx     # Punto de entrada con Vite

public/          # Recursos estáticos
package.json     # Dependencias del proyecto
vite.config.js   # Configuración de Vite
```

## ▶️ Cómo ejecutar el proyecto  

### 1. Clonar el repositorio  

git clone 
```text
git clone https://github.com/jrimbaquingaguana/Prueba_Tecnica.git
```

### 2.- Instalar dependencias
```text
npm install
```

### 3.- Ejecutar en modo desarrollo
```text
npm run dev
```

🧪 Pruebas / Testing

Se implementaron pruebas unitarias y de integración para asegurar el correcto funcionamiento del sistema:

Redux (productSlice.js)

Test de reducers (addLocalProduct, removeProduct, updateLocalProduct, setSearch, setSort, setPage, clearError)

Test de thunks (fetchProducts, fetchProduct, createProduct, updateProduct) usando mock de fetch y mock de dispatch

Verificación de que los productos se guardan correctamente en localStorage

Componentes React (CrearProducto)

Apertura y cierre del modal

Validación de campos requeridos (ej: categoría obligatoria)

Simulación de creación de producto y verificación de llamadas a dispatch y Swal.fire

### 1.- Ejecutar los test
```text
npm run test
```
```
