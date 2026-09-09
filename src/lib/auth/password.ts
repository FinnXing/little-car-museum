import {
  randomBytes,
  scrypt as nodeScrypt,
  timingSafeEqual,
} from "node:crypto";

const KEY_LENGTH = 64;
const COST = 16_384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;

function scrypt(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: { N: number; r: number; p: number; maxmem: number },
) {
  return new Promise<Buffer>((resolve, reject) => {
    nodeScrypt(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error);
      } else {
        resolve(derivedKey as Buffer);
      }
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
    maxmem: 32 * 1024 * 1024,
  });

  return [
    "scrypt",
    COST,
    BLOCK_SIZE,
    PARALLELIZATION,
    salt.toString("base64url"),
    derivedKey.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(password: string, encoded: string) {
  try {
    const [algorithm, cost, blockSize, parallelization, saltValue, keyValue] =
      encoded.split("$");
    if (
      algorithm !== "scrypt" ||
      !cost ||
      !blockSize ||
      !parallelization ||
      !saltValue ||
      !keyValue
    ) {
      return false;
    }

    const salt = Buffer.from(saltValue, "base64url");
    const expectedKey = Buffer.from(keyValue, "base64url");
    if (salt.length === 0 || expectedKey.length !== KEY_LENGTH) return false;

    const derivedKey = await scrypt(password, salt, expectedKey.length, {
      N: Number(cost),
      r: Number(blockSize),
      p: Number(parallelization),
      maxmem: 32 * 1024 * 1024,
    });

    return timingSafeEqual(expectedKey, derivedKey);
  } catch {
    return false;
  }
}
