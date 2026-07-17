import createClient from 'openapi-fetch';
import type { paths } from './types';

const client = createClient<paths>({
  baseUrl: 'https://api.terminpilot.de',
});

export default client;
