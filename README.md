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
├── components   # Componentes reutilizables
├── redux        # Slices y store de Redux
├── styles       # Archivos CSS
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
