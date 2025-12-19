import * as userService from '../services/userService.js';

export const updateCredentials = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { username, password, currentPassword } = req.body;
    const requesterId = req.user.userId;
    
    // Only admin can update any user, or user can update themselves
    if (req.user.role !== 'admin' && parseInt(userId) !== requesterId) {
      return res.status(403).json({ error: 'You can only update your own credentials' });
    }
    
    const updatedUser = await userService.updateUserCredentials(parseInt(userId), {
      username,
      password,
      currentPassword,
      requesterId
    });
    
    res.json({
      message: 'Credentials updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

export const getUserInfo = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user.userId;
    
    // Only admin can view any user, or user can view themselves
    if (req.user.role !== 'admin' && parseInt(userId) !== requesterId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const user = await userService.getUserById(parseInt(userId));
    res.json(user);
  } catch (error) {
    next(error);
  }
};

