const users = [];

exports.getAllUsers = (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  res.status(200).json(users);
};