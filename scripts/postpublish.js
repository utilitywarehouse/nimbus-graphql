const {removeArtifacts} = require('./npm-publish-helper');

const glob = require('glob');

const distCodePath = path.resolve(__dirname, '..', 'dist');

run().then(() => {
    console.log("Done");
}).catch(() => {
    console.error("Command errored");
});

async function run() {
    const packages = glob.sync(path.join(distCodePath, '*'));
    await removeArtifacts(packages);
}