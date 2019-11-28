import cluster from "cluster"
const uuidv4 = require('uuid/v4');

if (cluster.isWorker) {
    process.on("message", async (jobArg: any) => {
        //generate uuid(take compute resource) and return result.
        const id =uuidv4();
        process.send(id)
    });
}