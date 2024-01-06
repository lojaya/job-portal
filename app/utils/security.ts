import { createHash, randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

export const generateSalt = (length = 12): string => bcrypt.genSaltSync(length);

export const generatePassword = (plain: string, salt: string): string =>
	bcrypt.hashSync(plain, salt);

export const checkPassword = (plain: string, password: string): boolean =>
	bcrypt.compareSync(plain, password);

export const sha512digest = (): string => createHash('sha512').update(randomUUID()).digest('hex');

export const md5Digest = (): string => createHash('md5').update(randomUUID()).digest('hex');
