import crypto from "crypto";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

const randomString = (length: number) => {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return out;
};

export const randomId = () => randomString(12);

export const randomInviteToken = () => randomString(20);
