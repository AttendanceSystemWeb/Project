import * as authService from '../services/authService.js';

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await authService.loginUser(username, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createTeacher = async (req, res, next) => {
  try {
    const { username, password, fullName } = req.body;

    if (!username || !password || !fullName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const teacher = await authService.createUser(username, password, fullName, 'teacher');
    res.status(201).json(teacher);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res) => {
  res.json({
    userId: req.user.userId,
    role: req.user.role
  });
};

