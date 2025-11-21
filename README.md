# API Backend - INNOVATEC-2025-VZ

La API principal del proyecto maneja usuarios, autenticación, edificios, eventos, big data y la integración con el servicio de Machine Learning.

## Requisitos

- Node.js 18 o superior
- npm (v10+ recomendada)
- MongoDB (Atlas o local) accesible desde la API
- Variables de entorno definidas en `backend/.env`

## Configuración rápida

1. Copia o crea `backend/.env` con al menos:
   ```dotenv
   MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/innovatec
   PORT=5000
   ENABLE_BATCH_PROCESSING=true
   JWT_SECRET=tu_secret_jwt_aqui
   ML_SERVICE_URL=http://localhost:8000
   ```
2. Instala dependencias:
   ```bash
   cd backend
   npm install
   ```
3. Inicia el servidor en caliente:
   ```bash
   npm run dev
   ```
4. Si necesitas servir la API en producción, usa `npm start`.

## Scripts útiles (`package.json`)

- `npm run generate-fake-data [--days=30] [--clear]` → llena las colecciones de Big Data usando datos reales disponibles y sintéticos (pruebas unicamente).

- `npm run generate-events` → crea eventos de muestra alineados con lo que usan las analíticas (pruebas unicamente).

- `npm run load-buildings` → importa el GeoJSON de `project/assets/geo/caminos.json` y sincroniza la colección de edificios.

- `npm run create-admin` → crea o actualiza el usuario `test@gmail.com` como administrador.

- `npm run verify-consistency` → comprueba relaciones entre eventos, edificios y los datos de analíticas/gráficas.

Cada script imprime un resumen y cierra la conexión a MongoDB cuando termina.

## Carpeta `scripts/`

- `createAdminUser.js` → consolida el usuario administrador.

- `generateFakeBigData.js` → genera logs, métricas y analíticas para eventos, edificios y usuarios (puede usar `--clear` para reiniciar).

- `generateSampleEvents.js` → crea eventos temporales si la base carece de ellos.

- `loadBuildingsFromGeoJSON.js` → sincroniza edificios desde el GeoJSON incluido en la app móvil.

- `verifyDataConsistency.js` → revisa consistencia entre colecciones clave.

## Integración con el ML Service

El backend se conecta a `http://localhost:8000` por defecto. Si cambias el servicio, actualiza `ML_SERVICE_URL` y asegúrate de que `backend/ml-service/README_ML_COMPLETO.md` esté al día. Para levantar rápidamente todo el ecosistema usa el script raíz `start-all-services.ps1` y valida con `test-integridad.ps1`.

## Scripts de inicio del ML Service (Windows)

En `backend/ml-service/` hay varios ayudantes:

- `start_ml_service.bat` y `iniciar-ml-service.ps1` son los más completos: comprueban venv, `.env`, entrenan modelos periódicamente si faltan y arrancan `main.py`.

- `iniciar.bat` y `start-ml.ps1` replican la funcionalidad si ya tienes entornos preparados, pero omiten la copia automática de `.env` y algunas advertencias; se conservan por compatibilidad, pero para evitar confusión recomiendo usar los primeros dos.

## Otros recursos

- El README completo del ML Service está en `backend/ml-service/README_ML_COMPLETO.md`.
- La documentación del panel y la app móvil se actualiza desde los READMEs dentro de cada subproyect
