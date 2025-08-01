// services/authService.js
import User from '../models/Auth.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async ({ email, password, role = 'estudiante', avatar }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('El usuario ya existe');

  const newUser = new User({ email, password, role, avatar });
  await newUser.save();
  return { id: newUser._id, email: newUser.email, role: newUser.role };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new Error('Correo o contraseña inválidos');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error('Correo o contraseña inválidos');

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || 'clave_secreta',
    { expiresIn: '2h' }
  );

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  };
};
