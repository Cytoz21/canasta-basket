# 🚀 Guía de Configuración de Supabase

## Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Click en **Start your project** o **Sign In**
3. Crea una cuenta o inicia sesión (puedes usar GitHub)
4. Click en **New Project**
5. Completa los datos:
   - **Name**: payment-manager (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (¡guárdala!)
   - **Region**: Selecciona la más cercana a ti
   - **Pricing Plan**: Free (es suficiente para este proyecto)
6. Click en **Create new project**
7. Espera 1-2 minutos mientras se crea el proyecto

## Paso 2: Obtener las Credenciales

Una vez creado el proyecto:

1. En el dashboard, busca el menú lateral izquierdo
2. Click en el ícono de **Settings** (⚙️)
3. Click en **API**
4. Verás dos secciones importantes:

### Configuration
```
Project URL: https://xxxxxxxxxxxxx.supabase.co
```
👆 **Copia esta URL completa**

### Project API keys
```
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...
```
👆 **Copia esta clave (es muy larga, asegúrate de copiarla completa)**

## Paso 3: Ejecutar el SQL

1. En el menú lateral, click en **SQL Editor**
2. Click en **New query**
3. Abre el archivo `supabase/schema.sql` de este proyecto
4. Copia TODO el contenido del archivo
5. Pégalo en el SQL Editor de Supabase
6. Click en **Run** (o presiona Ctrl+Enter)
7. Deberías ver: "Success. No rows returned"

## Paso 4: Configurar el archivo .env.local

1. Abre el archivo `.env.local` en este proyecto
2. Reemplaza con tus credenciales reales:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id-real.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tu-key-completa-aqui
```

## Paso 5: Verificar que funciona

1. En Supabase, ve a **Table Editor** en el menú lateral
2. Deberías ver la tabla `pagos` con datos de ejemplo
3. Si ves la tabla, ¡todo está listo! ✅

## ⚠️ Errores Comunes

### Error 404 NOT_FOUND
- **Causa**: La URL del proyecto no es correcta
- **Solución**: Verifica que copiaste la URL completa desde Settings → API

### Error "Invalid API key"
- **Causa**: La anon key no es correcta o está incompleta
- **Solución**: Asegúrate de copiar la clave completa (es muy larga)

### Error "relation pagos does not exist"
- **Causa**: No ejecutaste el SQL
- **Solución**: Ve a SQL Editor y ejecuta el contenido de `schema.sql`

## 📞 ¿Necesitas Ayuda?

Si sigues teniendo problemas:
1. Verifica que el proyecto de Supabase esté activo (no pausado)
2. Asegúrate de estar usando las credenciales del proyecto correcto
3. Revisa que el SQL se haya ejecutado sin errores

---

**Una vez configurado correctamente, podrás ejecutar:**
```bash
npm install
npm run dev
```

Y la aplicación funcionará en `http://localhost:3000` 🎉
