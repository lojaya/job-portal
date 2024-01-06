import mongoose from 'mongoose';
import { DB_NAME, MONGO_STRING } from './app.config';

mongoose
	.connect(MONGO_STRING, { dbName: DB_NAME })
	.then(() => {
		console.log('Connected to MongoDB');
	})
	.catch((error) => console.error(error));

export default mongoose;
