const axios = require('axios');
const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json'); // Import the package.json file

const specmaticVersion = packageJson.specmaticVersion;
const jarUrl = `https://repo1.maven.org/maven2/in/specmatic/specmatic-executable/${specmaticVersion}/specmatic-executable-${specmaticVersion}-all.jar`;
const jarFilename = 'specmatic.jar'; // Specify the desired filename for the JAR

const downloadPath = path.resolve(__dirname, '..', jarFilename);

if (fs.existsSync(downloadPath)) {
  console.log(`Deleting existing jar ...`);
  fs.unlinkSync(downloadPath);
}

console.log("Downloading Specmatic jar version: " + specmaticVersion + " ...");
axios({
  method: 'get',
  url: jarUrl,
  responseType: 'stream',
})
  .then((response) => {
    response.data.pipe(fs.createWriteStream(downloadPath));
    console.log("Finished downloading Specmatic jar");
  })
  .catch((error) => {
    console.error('Error downloading Specmatic Core JAR file version: ' + specmaticVersion, error);
    process.exit(1);
  });