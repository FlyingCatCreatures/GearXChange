import { getBiddings } from '../lib/listings';

export default defineEventHandler(async (event) => await getBiddings());
