import fs from 'fs';
import dotenv from 'dotenv';

export const CONFIG = dotenv.parse(fs.readFileSync(__dirname + '/../.env'));
export const TOKENS = {
  appKey: CONFIG.CONSUMER_TOKEN,
  appSecret: CONFIG.CONSUMER_SECRET,
};

export default CONFIG;
