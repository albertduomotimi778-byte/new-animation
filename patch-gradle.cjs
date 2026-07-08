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

const androidIndex = content.indexOf('android {');
if (androidIndex === -1) {
  console.error("Could not find 'android {' block in build.gradle");
  process.exit(1);
}

content = content.slice(0, androidIndex + 9) + signingConfigStr + content.slice(androidIndex + 9);

const releaseBuildTypeRegex = /(release\\s*\\{[^}]*)/;
if (!releaseBuildTypeRegex.test(content)) {
  console.error("Could not find release buildType in build.gradle");
  process.exit(1);
}

content = content.replace(releaseBuildTypeRegex, (match) => {
  return match + '\\n            signingConfig signingConfigs.release';
});

fs.writeFileSync(gradlePath, content, 'utf8');
console.log("Successfully patched build.gradle with signing config!");
