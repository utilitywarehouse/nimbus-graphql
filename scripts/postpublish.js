const {removeArtifacts} = require('./npm-publish-helper');
const path = require('path');
const glob = require('glob');

const distCodePath = path.resolve(__dirname, '..', 'dist');

run().then(() => {
    console.log("Post publish done!");
}).catch(() => {
    console.error("Post published errored");
});

async function run() {
    const packages = glob.sync(path.join(distCodePath, '*'));
    await removeArtifacts(packages);
}