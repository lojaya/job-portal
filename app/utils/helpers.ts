import slug from 'slugify';
import { md5Digest } from './security';

export const uploadPath = `${__dirname}/../../uploads/`;

export const splitFileName = (str: string): { [key: string]: string } => {
	const splitted = str.split('.');
	const ext = splitted.pop() || '';
	const name = splitted.join('.');
	const sanitized = slug(name, { lower: true });
	const filename = `${sanitized.slice(0, 20)}-${md5Digest()}`;
	const fullName = ext ? `${filename}.${ext}` : filename;
	return { ext, name, fullName };
};
