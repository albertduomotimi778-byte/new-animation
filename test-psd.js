const fs = require('fs');
const psd = require('ag-psd');
// Create a fake PSD
// I can't easily create a PSD file from scratch here, but I can ask the environment, or maybe the comment is right:
// "// Actually `ag-psd` layer 0 is bottom. So length-1 is top."
// "// First child (topmost in PSD, processed first because i goes from length-1 to 0?"
console.log('done');
