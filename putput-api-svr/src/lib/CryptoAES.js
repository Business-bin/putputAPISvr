const CryptoJS = require('crypto-js');
//const crypto = require('crypto');

const { PASSWORD_SECRET: nearKey } = process.env;

const encryptAES = (text) => {
  const ciphertext = CryptoJS.AES.encrypt(text, nearKey);
  return ciphertext.toString();
};
   
const decryptAES = (text) => {
  let bytes = CryptoJS.AES.decrypt(text, nearKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const encryptAESCShape = (text) => {
  const iv = CryptoJS.enc.Hex.parse('e84ad660c4721ae0e84ad660c4721ae0');
  const Pass = CryptoJS.enc.Utf8.parse(nearKey);
  const Salt = CryptoJS.enc.Utf8.parse('insight123resultxyz');
  const key128Bits1000Iterations = CryptoJS.PBKDF2(Pass.toString(CryptoJS.enc.Utf8), Salt, { keySize: 128 / 32, iterations: 1000 });
  // const cipherParams = CryptoJS.lib.CipherParams.create({
  //   ciphertext: CryptoJS.enc.Utf8.parse(text)
  // });

  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(text), 
    key128Bits1000Iterations, 
  { 
      iv: iv, 
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7 
  }); 
  //return Buffer.from(ciphertext.toString()).toString('base64');
  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
  //return ciphertext.toString();
};

const decryptAESCShape = (text) => {
  const encryptData = text;

  try {
    const iv = CryptoJS.enc.Hex.parse('e84ad660c4721ae0e84ad660c4721ae0');
    const Pass = CryptoJS.enc.Utf8.parse(nearKey);
    const Salt = CryptoJS.enc.Utf8.parse('insight123resultxyz');
    const key128Bits1000Iterations = CryptoJS.PBKDF2(Pass.toString(CryptoJS.enc.Utf8), Salt, { keySize: 128 / 32, iterations: 1000 });
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(encryptData)
    });
    const decrypted = CryptoJS.AES.decrypt(
      cipherParams, 
      key128Bits1000Iterations, 
      { 
        mode: CryptoJS.mode.CBC, 
        iv: iv, 
        padding: CryptoJS.pad.Pkcs7 
      });
    return decrypted.toString(CryptoJS.enc.Utf8);
    
  } catch (err) {
    return null;
  }
};

module.exports = {
  encryptAES,
  decryptAES,
  encryptAESCShape,
  decryptAESCShape
};