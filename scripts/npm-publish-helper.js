
const path = require('path');

const child_process = require('child_process');

const projectPathCwd = path.resolve(__dirname, '..');

require('events').EventEmitter.defaultMaxListeners = 200;


/**
 * NPM RUN BUILD - Build typescript
 */
function buildTS() {
    // NPM Run Build, build TS Code
    return promisyCommand("npm run build");
}

/**
 * Move compiled files to root
 * @param packagePaths
 * @returns {Promise<void>}
 */
async function moveFileToPackageRoot(packagePaths) {
    // Move dist packages to project root.
    const rootPackages = packagePaths
        .map((packagePath) => {
        return promisyCommand(`mv dist/${path.basename(packagePath)} .`)
            .then(() => {
            return packagePath;
        });
    });

    return Promise.all(rootPackages);
}

/**
 * Remove artifacts
 * @param packages
 * @returns {*}
 */
async function removeArtifacts(packages) {
    await Promise.all(packages.map((packagePath) => {
        const rootFile = path.join(projectPathCwd, path.basename(packagePath));
        return promisyCommand(`rm -rf ${rootFile}`)
    }));

    return promisyCommand("rm -rf ./dist");
}


function promisyCommand(bashCommand) {
    return new Promise((resolve, reject) => {
        const command = child_process.exec(bashCommand, {
            stdio: "inherit",
            cwd: projectPathCwd,
        }, function (err) {
            if (err) {
                return reject()
            }
            resolve();
        });

        command.stdout.pipe(process.stdout);
        command.stderr.pipe(process.stderr);
    });
}

module.exports = {
    moveFileToPackageRoot,
    removeArtifacts,
    buildTS,
};