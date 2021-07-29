const generationEmailCode = () => {
  const length = 4;
  const charset = "0123456789";
  let retVal = "";

  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

module.exports = generationEmailCode;
