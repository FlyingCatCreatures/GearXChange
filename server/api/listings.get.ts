import { getListings } from '../utils/listings';

export default defineEventHandler(async (event) => await getListings());
