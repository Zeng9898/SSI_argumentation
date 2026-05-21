module.exports = (req, res, next) => {
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({ error: '需要教師權限' });
  }
  next();
};
