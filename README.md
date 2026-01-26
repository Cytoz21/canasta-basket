# 💰 Payment Manager - Gestor de Pagos

Una aplicación web moderna para gestionar pagos de servicios, construida con Next.js 14 y almacenamiento local JSON.

![Payment Manager](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## ✨ Características

- 📊 **Dashboard Interactivo** - Visualiza estadísticas y gráficos en tiempo real
- 💳 **Gestión de Pagos** - Crea, edita y elimina registros de pagos
- 📈 **Gráficos Dinámicos** - Visualiza deudas por persona, servicios y tendencias mensuales
- 🎨 **Diseño Moderno** - Interfaz elegante con modo oscuro y animaciones suaves
- 💾 **Almacenamiento Local** - Sin necesidad de configurar bases de datos externas
- 🚀 **Rápido y Simple** - Funciona de inmediato sin configuración adicional

## 🚀 Inicio Rápido

### Instalación

```bash
# Clonar el repositorio (o descargar el proyecto)
cd payment-manager

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
payment-manager/
├── app/                    # Páginas de Next.js 14 (App Router)
│   ├── layout.jsx         # Layout principal
│   ├── page.jsx           # Página principal (dashboard)
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   ├── PaymentTable.jsx   # Tabla de pagos
│   ├── PaymentForm.jsx    # Formulario para crear/editar
│   └── Charts.jsx         # Gráficos y estadísticas
├── data/                  # Almacenamiento de datos
│   └── payments.json      # Base de datos JSON local
├── lib/                   # Utilidades y funciones
│   └── payments.js        # Funciones CRUD para pagos
└── package.json           # Dependencias del proyecto
```

## 💾 Sistema de Almacenamiento

Esta aplicación usa un archivo JSON local (`data/payments.json`) para almacenar los datos. No requiere configuración de base de datos externa.

### Estructura de Datos

Cada pago tiene la siguiente estructura:

```json
{
  "id": 1,
  "persona": "Juan Pérez",
  "servicio": "Internet",
  "monto": 50000,
  "monto_pagado": 0,
  "estado": "Pendiente",
  "mes": "Enero",
  "año": 2026,
  "fecha": "2026-01-15",
  "notas": "Pago mensual de internet"
}
```

### Estados de Pago

- **Pendiente** - No se ha realizado ningún pago
- **Semi-pagado** - Se ha pagado parcialmente
- **Pagado** - Pago completado

## 🛠️ Tecnologías Utilizadas

- **[Next.js 14](https://nextjs.org/)** - Framework de React con App Router
- **[React 18](https://react.dev/)** - Biblioteca de UI
- **[Recharts](https://recharts.org/)** - Gráficos interactivos
- **[Lucide React](https://lucide.dev/)** - Iconos modernos
- **[date-fns](https://date-fns.org/)** - Manipulación de fechas

## 📊 Funcionalidades

### Dashboard Principal

- Resumen de totales (Pendiente, Pagado, Semi-pagado)
- Gráfico de deuda por persona
- Gráfico de pagos por servicio
- Tendencias mensuales

### Gestión de Pagos

- ➕ Crear nuevos pagos
- ✏️ Editar pagos existentes
- 🗑️ Eliminar pagos
- 🔍 Filtrar y ordenar por fecha

## 🎨 Características de Diseño

- ✨ Interfaz moderna con glassmorphism
- 🌙 Modo oscuro elegante
- 📱 Diseño responsive
- 🎭 Animaciones suaves
- 🎨 Paleta de colores vibrante

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start

# Linting
npm run lint
```

## 🔧 Configuración

No se requiere configuración adicional. La aplicación funciona de inmediato después de instalar las dependencias.

Si deseas personalizar:

1. **Datos iniciales**: Edita `data/payments.json`
2. **Estilos**: Modifica `app/globals.css`
3. **Componentes**: Personaliza los archivos en `components/`

## 🚀 Despliegue

### Vercel (Recomendado)

1. Sube tu código a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Despliega con un clic

### Otros Servicios

La aplicación puede desplegarse en cualquier servicio que soporte Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 📄 Licencia

MIT License - Siéntete libre de usar este proyecto para tus propios fines.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si encuentras un bug o tienes una sugerencia:

1. Abre un issue
2. Haz un fork del proyecto
3. Crea una rama para tu feature
4. Envía un pull request

## 📞 Soporte

Si tienes preguntas o necesitas ayuda, abre un issue en el repositorio.

---

**¡Hecho con ❤️ usando Next.js!**
