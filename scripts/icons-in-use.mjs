// Writes tokens/icons-in-use.json: every lucide icon the code imports, so the Icons page shows all of them.
import {writeFileSync} from 'node:fs';
import {iconsInUse} from './lib/icons-in-use.mjs';

const used = [...iconsInUse().keys()];
writeFileSync('tokens/icons-in-use.json', JSON.stringify({used}, null, 2) + '\n');
console.log(`tokens/icons-in-use.json: ${used.length} icons`);
