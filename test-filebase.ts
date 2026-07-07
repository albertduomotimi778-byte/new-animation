import { getFilebaseAccounts } from './utils/filebase';

async function test() {
  const accounts = await getFilebaseAccounts();
  console.log(accounts);
  process.exit(0);
}

test();
