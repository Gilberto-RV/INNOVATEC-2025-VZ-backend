import { loginUser } from '../../services/authServices.js';

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export default loginController;
