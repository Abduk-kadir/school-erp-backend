const jwt =require('jsonwebtoken');

const generateToken = (data) => {

  return jwt.sign(data, process.env.JWT_KEY, { expiresIn: "90d" });
};

module.exports= generateToken;
