const fs = require('fs');

const version = process.env.CIRCLE_TAG;
const VERSION_REGEX = /^v(\d+\.\d+\.\d+)$/;
if (!VERSION_REGEX.test(version)) {
  throw new Error('Invalid version string');
}

const package = JSON.parse(fs.readFileSync('package.json'));
package.version = VERSION_REGEX.exec(version)[1];
fs.writeFileSync('package.json', JSON.stringify(package, null, 2));
