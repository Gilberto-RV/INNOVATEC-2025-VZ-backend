// models/Auth.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'El correo es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: 6,
    select: false // No devuelve la contraseña en consultas por defecto
  },
  role: {
    type: String,
    enum: ['estudiante', 'profesor', 'administrador'],
    default: 'estudiante'
  },
  avatar: {
    type: String,
    default: '' // Esto se puede llenar con la imagen de Gmail si aplica
  }
}, { timestamps: true });

// Middleware para hashear la contraseña antes de guardar
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar contraseña
UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', UserSchema);
