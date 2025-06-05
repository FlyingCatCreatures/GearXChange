import { getListings } from '../lib/listings';

export default defineEventHandler(async (event) => await getListings());
