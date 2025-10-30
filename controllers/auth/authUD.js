// controllers/auth/authUD.js
import * as authService from '../../services/authServices.js';

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;

    const { updatedUser, newToken } = await authService.updateUser(userId, updates);

    res.json({ token: newToken, user: updatedUser });
  } catch (error) {
    console.error('Error en updateProfile:', error.message);
    res.status(400).json({ error: 'Error al actualizar el perfil' });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    await authService.deleteUser(userId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
