const fs = require('fs');

const version = process.env.CIRCLE_TAG;
const VERSION_REGEX = /^\d+\.\d+\.\d+$/;
if (!VERSION_REGEX.test(version)) {
  console.log('Invalid version string');
  return 1;
}

const package = JSON.parse(fs.readFileSync('package.json'));
package.version = version;
fs.writeFileSync('package.json', JSON.stringify(package, null, 2));
