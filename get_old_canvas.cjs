const fs = require('fs');
const execSync = require('child_process').execSync;
try {
    const gitOutput = execSync('git log -p -1 utils/CanvasRenderEngine.ts').toString();
    fs.writeFileSync('CanvasRenderEngine_git.txt', gitOutput);
    console.log("Success");
} catch (e) {
    console.log(e);
}
