const users = [];

exports.getProfile = (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.status(200).json({ user_id: user.id, email: user.email, role: user.role });
};

exports.updateProfile = (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  Object.assign(user, req.body);
  res.status(200).json({ message: 'Profile updated successfully' });
};

exports.uploadProfilePicture = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  res.status(201).json({ message: 'Profile picture uploaded successfully', profile_picture_url: fileUrl });
};