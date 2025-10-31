// services/authServices.js
import User from '../models/Auth.js';
import jwt from 'jsonwebtoken';

const generateToken = (userId, role) => {
  const jwtSecret = process.env.JWT_SECRET || 'clave_secreta';
  return jwt.sign({ userId, role }, jwtSecret, {
    expiresIn: '2h',
  });
};

const formatUser = (user) => ({
  id: user._id,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
});

export const registerUser = async ({ email, password, role = 'estudiante', avatar }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('El usuario ya existe');

  const user = new User({ email, password, role, avatar });
  await user.save();

  const token = generateToken(user._id, user.role);
  return { token, user: formatUser(user) };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Correo o contraseña inválidos');
  }

  const token = generateToken(user._id, user.role);
  return { token, user: formatUser(user) };
};

export const updateUser = async (userId, { password, role, avatar }) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('Usuario no encontrado');

  let updated = false;

  if (password?.trim()) {
    user.password = password;
    updated = true;
  }
  if (role && role !== user.role) {
    user.role = role;
    updated = true;
  }
  if (avatar && avatar !== user.avatar) {
    user.avatar = avatar;
    updated = true;
  }

  if (!updated) throw new Error('No se proporcionaron cambios válidos');

  await user.save();

  const newToken = generateToken(user._id, user.role);
  return { updatedUser: formatUser(user), newToken };
};

export const deleteUser = async (userId) => {
  const result = await User.findByIdAndDelete(userId);
  if (!result) throw new Error('Usuario no encontrado');
};
