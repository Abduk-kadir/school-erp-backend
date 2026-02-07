module.exports= getTokenFromHeader = (req) => {
  //get token from header
  const token = req?.headers?.authorization?.split(" ")[1];
 
   return token;
  
};
