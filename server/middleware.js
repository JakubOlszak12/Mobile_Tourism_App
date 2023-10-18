const jwt = require('jsonwebtoken');
const middleware = (req, res, next) => {
  try {
    const token = req.header('token');
    console.log(token);
    if (!token) return res.status(401).json({message: 'Brak dostępu.'});
    const isVerified = jwt.verify(token, process.env.JWT_SECRET);
    if (!isVerified) {
      return res
          .status(401)
          .json({message: 'Niepoprawna weryfikacja, brak dostępu.'});
    }
    req.user = isVerified.id;
    next();
  } catch (err) {
    res.status(500).json({error: err.message});
  }
};
module.exports = middleware;
