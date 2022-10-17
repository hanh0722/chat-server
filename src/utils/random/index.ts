import { randomBytes } from 'crypto';

export const randomId = (size: number = 16) => {
  return new Promise<string>((resolve, reject) => {
    randomBytes(size, (err, buffer) => {
      if (err) {
        reject(err);
      }
      resolve(buffer.toString('hex'));
    })
  })
}

export const randomByRange = (min: number = 1000, max: number = 9999) => {
  return Math.floor(Math.random() * (max - min) + min);
}