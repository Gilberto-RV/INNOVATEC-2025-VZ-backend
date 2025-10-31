# 🗄️ Configuración de MongoDB Atlas - Pasos Detallados

## 📋 Información que necesito de ti

Para configurar MongoDB Atlas, necesito la siguiente información:

1. **Connection String completo**
2. **Nombre de usuario de la base de datos**
3. **Contraseña (la compartirás de forma segura)**

---

## 🚀 Pasos para Configurar MongoDB Atlas

### Paso 1: Crear un Cluster (si aún no lo tienes)

1. Ve a https://cloud.mongodb.com/ y entra con tu cuenta
2. Si no tienes un cluster:
   - Click en **"Create"** → **"Cluster"**
   - Selecciona **"M0 Sandbox"** (gratis)
   - Elige la región más cercana a Venezuela (ej: **N. Virginia (us-east-1)** o **Sao Paulo**)
   - Click en **"Create Cluster"**

### Paso 2: Configurar Acceso de Red

1. En el menú lateral izquierdo, click en **"Network Access"**
2. Click en **"Add IP Address"**
3. Para desarrollo local, puedes usar:
   - **"Add Current IP Address"** (recomendado)
   - O **"Allow Access from Anywhere"** (`0.0.0.0/0`) - solo para desarrollo
高达4. Click en **"Confirm"**

⚠️ **Nota de Seguridad**: En producción, usa IPs específicas, nunca `0.0.0.0/0`

### Paso 3: Crear Usuario de Base de Datos

1. En el menú lateral, click en **"Database Access"**
2. Click en **"Add New Database User"**
3. Configura:
   - **Authentication Method**: Password
   - **Username**: (ejemplo: `innovatec_user` o el que prefieras)
   - **Password**: Crea una contraseña segura
   - **Database User Privileges**: `Read and write to any database`
4. Click en **"Add User"**
5. **GUARDA EL USERNAME Y PASSWORD** - los necesitarás

### Paso 4: Obtener el Connection String

1. En el menú lateral, click en **"Database"** o **"Clusters"**
2. Click en el botón **"Connect"** de tu cluster
3. Selecciona **"Connect your application"**
4. Selecciona:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
5. Copia el **Connection String** que aparece

   Debería verse algo así:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Paso 5: Personalizar el Connection String

Reemplaza `<username>` y `<password>` con tus credenciales del Paso 3.

**Ejemplo:**
```
mongodb+srv://innovatec_user:TuPassword123@cluster0.xxxxx.mongodb.net/innovatec?retryWrites=true&w=majority
```

Nota: Agregué `/innovatec` antes del `?` para especificar el nombre de la base de datos.

---

## 📝 Información que debes compartir

Por favor, comparte esta información (puedes hacerlo de forma privada):

### Opción 1: Compartir el Connection String completo
```
MONGO_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/innovatec?retryWrites=true&w=majority
```

### Opción 2: Compartir los componentes por separado
```
Username: [tu_usuario]
Password: [tu_contraseña]
Cluster URL: cluster0.xxxxx.mongodb.net
Database Name: innovatec
```

---

## ⚙️ Configuración en el Backend

Una vez que tengas el connection string, sigue estos pasos:

1. **Crea o edita el archivo `.env` en la carpeta `backend/`**:
   ```env
   MONGO_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/innovatec?retryWrites=true&w=majority
   ENABLE_BATCH_PROCESSING=true
   PORT=5000
   ```

2. **Instala las dependencias** (si aún no lo has hecho):
   ```bash
   cd backend
   npm install
   ```

3. **Prueba la conexión**:
   ```bash
   npm run dev
   ```

   Deberías ver:
   ```
   🟢 MongoDB Connected: cluster0.xxxxx.mongodb.net
   🚀 Server running on http://localhost:5000
   ```

---

## ✅ Verificación

Para verificar que todo funciona:

1. Ejecuta el servidor: `npm run dev`
2. Si ves el mensaje `🟢 MongoDB Connected`, ¡está funcionando!
3. Las colecciones de Big Data se crearán automáticamente cuando se registren los primeros datos

---

## 🔒 Seguridad

- ⚠️ **NUNCA** subas el archivo `.env` a GitHub
- ⚠️ El `.env` ya está en `.gitignore`, pero verifícalo
- ⚠️ En producción, usa variables de entorno del servidor, no archivos `.env`
- ⚠️ Rota las contraseñas periódicamente

---

## 🆘 Problemas Comunes

### Error: "MongoServerError: bad auth"
- Verifica que el username y password sean correctos
- Asegúrate de haber reemplazado `<username>` y `<password>` en el connection string

### Error: "MongoServerError: IP not whitelisted"
- Ve a Origine Access" en MongoDB Atlas
- Agrega tu IP actual

### Error: "Connection timeout"
- Verifica tu conexión a internet
- Verifica que el cluster esté activo en MongoDB Atlas

---

## 📞 Siguiente Paso

Una vez que tengas el connection string, compártelo conmigo y yo lo configuraré en el proyecto. O si prefieres, puedes agregarlo directamente al archivo `.env` en `backend/` y probarlo ejecutando `npm run dev`.

