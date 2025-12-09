import { Pax8Client } from '../src/index.js';

const clientId = process.env.PAX8_CLIENT_ID;
const clientSecret = process.env.PAX8_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error('Please set PAX8_CLIENT_ID and PAX8_CLIENT_SECRET environment variables.');
}

const client = new Pax8Client({ clientId, clientSecret });

async function main() {
  const products = await client.products.list({ size: 5 });
  console.log(JSON.stringify(products, null, 2));
}

main().catch((error) => {
  console.error('Failed to list products:', error);
  process.exitCode = 1;
});
