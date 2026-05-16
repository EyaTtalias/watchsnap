// Patch os.hostname() before Vercel CLI loads — fixes Hebrew/non-ASCII machine names
const os = require('os');
const origHostname = os.hostname.bind(os);
os.hostname = () => {
  const h = origHostname();
  // Replace any non-ASCII characters
  return h.replace(/[^\x00-\x7F]/g, 'X');
};

// Run vercel CLI
require('C:\\Users\\eyalt\\AppData\\Roaming\\npm\\node_modules\\vercel\\dist\\index.js');
