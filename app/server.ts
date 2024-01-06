import { app } from './app';
import { APIGW_PORT } from './app.config';

const port = APIGW_PORT;

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
