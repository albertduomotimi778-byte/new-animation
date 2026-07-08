const fs = require('fs');
const path = require('path');

const gradlePath = path.join(process.cwd(), 'android', 'app', 'build.gradle');
if (!fs.existsSync(gradlePath)) {
  console.error("build.gradle not found at: " + gradlePath);
  process.exit(1);
}

let content = fs.readFileSync(gradlePath, 'utf8');

const signingConfigs = `
    signingConfigs {
        release {
            storeFile file("../../android.keystore")
            storePassword "password"
            keyAlias "android"
            keyPassword "password"
        }
    }
`;

if (!content.includes('buildTypes {')) {
  console.error("Could not find 'buildTypes {' block in build.gradle");
  process.exit(1);
}

// 1. Inject signingConfigs right before buildTypes block
content = content.replace('buildTypes {', signingConfigs + '\n    buildTypes {');

if (!/buildTypes\s*\{\s*release\s*\{/.test(content)) {
  console.error("Could not find 'release {' block inside 'buildTypes {' in build.gradle");
  process.exit(1);
}

// 2. Inject signingConfig inside the release buildTypes block
content = content.replace(/buildTypes\s*\{\s*release\s*\{/, "buildTypes {\n        release {\n            signingConfig signingConfigs.release");

fs.writeFileSync(gradlePath, content, 'utf8');
console.log("Successfully patched build.gradle with signing config!");
