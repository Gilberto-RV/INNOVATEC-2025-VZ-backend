import { registerUser } from '../../services/authServices.js';

const registerController = async (req, res) => {
  try {
    const { email, password, role, avatar } = req.body;
    const user = await registerUser({ email, password, role, avatar });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export default registerController;
