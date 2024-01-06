import { BASE_ASSET_PATH, BASE_URL } from '../app.config';
import type { TypedRequest, TypedResponse } from '../types';
import { splitFileName, uploadPath } from '../utils/helpers';

export const handler = async (req: TypedRequest, res: TypedResponse): Promise<void> => {
	// check if there is file being uploaded
	if (!req.files || Object.keys(req.files).length === 0) {
		res.status(400).send('No files were uploaded.');
		return;
	}

	// check if the key is correct, it should be 'images'
	if (!req.files.images || Object.keys(req.files.images).length === 0) {
		res.status(400).send('Wrong file key');
		return;
	}

	// convert data into array because we enable multiple upload under one key
	const uploadedFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

	/*
	// check if the mimetype of the file is image
	// for this case, we will restrict the file upload
	// to only allow image files
	*/
	const isNotImages = uploadedFiles.some((file) => file.mimetype.indexOf('image/') === -1);
	if (isNotImages) {
		res.status(400).send('files other than images is not allowed!');
		return;
	}
	// move the data from buffer to file, save into /uploads folder
	const files = uploadedFiles.map((file) => {
		const { fullName } = splitFileName(file.name);
		return {
			fullName,
			name: file.name,
			mv: file.mv,
			mimetype: file.mimetype,
		};
	});

	await Promise.all(
		files.map((file) =>
			file.mv(uploadPath + file.fullName).catch(() => {
				console.log(`error moving file: ${file.name}`);
			}),
		),
	);

	res.status(200).json({
		message: 'file uploaded successfully',
		status: res.statusCode,
		data: files.map((file) => ({
			file: `${BASE_URL}/${BASE_ASSET_PATH}/${file.fullName}`,
		})),
	});
};
