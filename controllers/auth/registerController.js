// controllers/auth/registerController.js
import { registerUser } from '../../services/authServices.js';

const registerController = async (req, res) => {
  try {
    const { email, password, role, avatar } = req.body;
    const { token, user } = await registerUser({ email, password, role, avatar });
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export default registerController;