import dotenv from 'dotenv';

dotenv.config();

export const DB_NAME = <string>process.env.DB_NAME;
export const MONGO_STRING = <string>process.env.DB_STRING;
export const APIGW_PORT = <string>process.env.PORT;
export const BASE_URL = <string>process.env.BASE_URL;
export const BASE_ASSET_PATH = <string>process.env.BASE_ASSET_PATH;
export const JWT_SECRET = <string>process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = <string>process.env.JWT_EXPIRES_IN;
export const JWT_REFRESH_EXPIRES_IN = <string>process.env.JWT_REFRESH_EXPIRES_IN;
