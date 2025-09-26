# Chatbot Frontend

Interfaz web construida con Vue 3, Vite y Tailwind para conversar con el backend del chatbot.

## Requisitos

- Node.js 20.19+ (recomendado por Vite)
- npm 9+

## Configuración

```bash
cp .env.example .env
```

Edita `.env` y apunta `VITE_API_BASE_URL` al backend (por ejemplo: `http://localhost:8000/api/v1`).

## Scripts comunes

```bash
npm install      # Instala dependencias
npm run dev      # Levanta Vite en modo desarrollo
npm run build    # Compila la app para producción
npm run preview  # Sirve el build generado
```

Al ejecutar `npm run dev`, la app queda disponible en `http://localhost:5173`.
