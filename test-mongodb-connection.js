import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configurar timeout más largo para conexiones a internet
mongoose.set('serverSelectionTimeoutMS', 10000);

const testConnection = async () => {
  console.log('🔍 Verificando conexión a MongoDB Atlas...\n');
  
  // Mostrar la URI (sin la contraseña por seguridad)
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ ERROR: MONGO_URI no está definido en el archivo .env');
    console.log('\n📝 Crea un archivo .env en la carpeta backend/ con:');
    console.log('   MONGO_URI=mongodb+srv://innovatec_user:TU_PASSWORD@cluster0.nctkhhn.mongodb.net/innovatec?retryWrites=true&w=majority');
    process.exit(1);
  }

  // Mostrar URI parcial (sin password)
  const uriDisplay = mongoUri.replace(/:(.+?)@/, ':****@');
  console.log(`📡 Connection String: ${uriDisplay}\n`);

  try {
    console.log('⏳ Intentando conectar...\n');
    
    // Conectar a MongoDB
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos
    });

    console.log('✅ ¡CONEXIÓN EXITOSA!\n');
    console.log(`🟢 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Estado: ${conn.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`);
    
    // Listar colecciones disponibles
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`\n📚 Colecciones encontradas (${collections.length}):`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    // Verificar algunas colecciones importantes
    const importantCollections = ['users', 'buildings', 'events'];
    console.log('\n🔍 Verificando colecciones importantes:');
    for (const colName of importantCollections) {
      const exists = collections.some(c => c.name === colName);
      console.log(`   ${exists ? '✅' : '⚠️ '} ${colName}${exists ? '' : ' (no encontrada)'}`);
    }

    console.log('\n✨ ¡La conexión a MongoDB Atlas está funcionando correctamente!');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERROR DE CONEXIÓN:\n');
    console.error(`   ${error.message}\n`);
    
    // Mensajes de ayuda según el tipo de error
    if (error.message.includes('authentication failed')) {
      console.log('💡 Posibles soluciones:');
      console.log('   1. Verifica que el usuario y contraseña sean correctos');
      console.log('   2. Asegúrate de que el usuario tenga permisos en MongoDB Atlas');
      console.log('   3. Revisa que no haya caracteres especiales que necesiten ser codificados (ej: @ → %40)');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('💡 Posibles soluciones:');
      console.log('   1. Verifica tu conexión a Internet');
      console.log('   2. Verifica que la URL del cluster sea correcta: cluster0.nctkhhn.mongodb.net');
      console.log('   3. Asegúrate de que el cluster esté activo en MongoDB Atlas');
    } else if (error.message.includes('IP')) {
      console.log('💡 Posibles soluciones:');
      console.log('   1. Agrega tu IP actual a la lista de IPs permitidas en MongoDB Atlas');
      console.log('   2. O agrega 0.0.0.0/0 (permite todas las IPs - solo para desarrollo)');
      console.log('   (MongoDB Atlas → Network Access → Add IP Address)');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Posibles soluciones:');
      console.log('   1. Verifica tu conexión a Internet');
      console.log('   2. El cluster puede estar iniciando (espera unos minutos)');
      console.log('   3. Verifica el firewall de tu red');
    }
    
    console.log('\n📝 Verifica que tu archivo .env contenga:');
    console.log('   MONGO_URI=mongodb+srv://innovatec_user:TU_PASSWORD@cluster0.nctkhhn.mongodb.net/innovatec?retryWrites=true&w=majority');
    
    process.exit(1);
  }
};

// Ejecutar prueba
testConnection();

