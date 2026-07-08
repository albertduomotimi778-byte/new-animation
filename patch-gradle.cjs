const fs = require('fs');
const path = require('path');

const gradlePath = path.join(__dirname, 'android', 'app', 'build.gradle');
if (!fs.existsSync(gradlePath)) {
  console.error("build.gradle not found at: " + gradlePath);
  process.exit(1);
}

let content = fs.readFileSync(gradlePath, 'utf8');

const signingConfigStr = `
    signingConfigs {
        release {
            storeFile file("../../android.keystore")
            storePassword "password"
            keyAlias "android"
            keyPassword "password"
        }
    }
`;

if (!content.includes('android {')) {
  console.error("Could not find 'android {' block in build.gradle");
  process.exit(1);
}

// 1. Inject signingConfigs right inside the 'android {' block
content = content.replace('android {', 'android {' + signingConfigStr);

if (!content.includes('release {')) {
  console.error("Could not find 'release {' block in build.gradle");
  process.exit(1);
}

// 2. Inject signingConfig inside the release buildTypes block
content = content.replace('release {', 'release {\n            signingConfig signingConfigs.release');

fs.writeFileSync(gradlePath, content, 'utf8');
console.log("Successfully patched build.gradle with signing config!");
