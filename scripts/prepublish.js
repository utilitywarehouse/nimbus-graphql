const {moveFileToPackageRoot, buildTS, removeArtifacts} = require('./npm-publish-helper');

const glob = require('glob');

const distCodePath = path.resolve(__dirname, '..', 'dist');

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
}