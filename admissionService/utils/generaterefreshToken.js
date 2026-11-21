const jwt =require('jsonwebtoken');

const generateRefreshToken = (data) => {

  return jwt.sign(data, process.env.JWT_REFRESH_KEY, { expiresIn: "7d" });
};

module.exports= generateRefreshToken;