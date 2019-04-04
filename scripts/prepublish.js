
const path = require('path');
const glob = require('glob');
const child_process = require('child_process');

const distCodePath = path.resolve(__dirname, '..', 'dist');
const projectPathCwd = path.resolve(__dirname, '..');

require('events').EventEmitter.defaultMaxListeners = 200;

run().then(() => {
    console.log("Done");
}).catch(() => {
    console.error("Command errored");
});

async function run() {
    await buildTS();
    const packages = glob.sync(path.join(distCodePath, '*'));

    try {
        await moveFileToPackageRoot(packages);
    } catch (e) {
        await removeArtifacts(packages);
        throw e;
    }

    await removeArtifacts(packages);
}

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

    await Promise.all(rootPackages);

    return promisyCommand("rm -rf ./dist");
}

/**
 * Remove artifacts
 * @param packages
 * @returns {*}
 */
function removeArtifacts(packages) {
    return packages.map((packagePath) => {
        const rootFile = path.join(projectPathCwd, path.basename(packagePath));
        return promisyCommand(`rm -rf ${rootFile}`)
    })
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