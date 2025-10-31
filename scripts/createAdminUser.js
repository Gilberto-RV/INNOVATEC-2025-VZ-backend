// scripts/createAdminUser.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/Auth.js';

dotenv.config();

const createAdminUser = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: 'test@gmail.com' });
    
    if (existingUser) {
      console.log('⚠️  El usuario test@gmail.com ya existe');
      console.log('   Actualizando rol a administrador...');
      existingUser.role = 'administrador';
      existingUser.password = 'admin123'; // Se hasheará automáticamente
      await existingUser.save();
      console.log('✅ Usuario actualizado a administrador');
    } else {
      // Crear nuevo usuario administrador
      const adminUser = new User({
        email: 'test@gmail.com',
        password: 'admin123',
        role: 'administrador'
      });
      
      await adminUser.save();
      console.log('✅ Usuario administrador creado exitosamente');
    }

    // Verificar el usuario creado
    const user = await User.findOne({ email: 'test@gmail.com' });
    console.log('\n📋 Información del usuario:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Rol: ${user.role}`);
    console.log(`   ID: ${user._id}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdminUser();

