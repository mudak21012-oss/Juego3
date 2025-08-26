# 📦 INSTRUCCIONES PARA SUBIR JUEGO DEMO v2.5.0

## 🚀 Cómo subir a GitHub manualmente:

### OPCIÓN 1: Subir código fuente (recomendado)

1. **Ve a tu repositorio**: https://github.com/mudak21012-oss/Juego-Demo

2. **Subir archivos**:
   - Click en "Add file" → "Upload files"
   - Arrastra TODOS los archivos y carpetas EXCEPTO la carpeta `dist`
   - Commit message: "Juego Demo v2.5.0 - Código fuente completo"
   - Click "Commit changes"

3. **Activar GitHub Actions** (para build automático):
   - Ve a Settings → Pages
   - Source: "GitHub Actions"
   - Selecciona "Static HTML" o configura Node.js

### OPCIÓN 2: Subir solo archivos listos para jugar

1. **Ve a tu repositorio**: https://github.com/mudak21012-oss/Juego-Demo

2. **Subir solo los archivos de la carpeta `dist`**:
   - Click en "Add file" → "Upload files"
   - Arrastra SOLO los archivos que están dentro de la carpeta `dist/`
   - También sube el archivo `README.md`
   - Commit message: "Deploy Juego Demo v2.5.0"
   - Click "Commit changes"

3. **Activar GitHub Pages**:
   - Ve a Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: "main"
   - Folder: "/ (root)"
   - Save

## 🎮 Tu juego estará disponible en:
https://mudak21012-oss.github.io/Juego-Demo/

## 📁 Archivos incluidos:

### Código fuente:
- `src/` - Todo el código TypeScript del juego
- `assets/` - Sprites, fuentes y gráficos
- `typings/` - Definiciones de tipos
- `index.html` - Página principal
- `package.json` - Dependencias del proyecto
- `tsconfig.json` - Configuración TypeScript
- `README.md` - Documentación

### Build de producción (carpeta `dist/`):
- `index.html` - Página optimizada
- `main.81dc1b6b.js` - Código compilado y minificado
- Todos los assets optimizados

## ⚡ Recomendación:
Usa la OPCIÓN 1 si quieres que otros puedan ver y modificar el código.
Usa la OPCIÓN 2 si solo quieres que el juego funcione rápidamente.

¡Tu juego estará listo para testing público en pocos minutos!
