import {parallelCreate} from "async-await-cluster";

const uuidv4 = require('uuid/v4');

/**
 *  This example async-await-cluster should  not be faster than Single Process.
 *  Worker Script:uuidWorker.ts
 */
const main = async () => {
    const jobs = Array.from({length: 1000}, (_, idx) => idx);
    //multi process
    {
        console.time("Parallel");
        // pass worker script path
        const uuids = await parallelCreate(jobs.slice(0), __dirname + "/" + "uuidWorker.js");
        console.timeEnd("Parallel");
    }
    //single process
    {
        console.time("Single");
        const ProgressBar = require("progress");
        const bar = new ProgressBar("[:bar] :current :total :percent ETA :eta Sec :rate Job/Sec", {
            total: jobs.length,
        });
        const tick = () => {
            bar.tick();
        };
        const uuids = [];
        for (const job of jobs) {
            uuids.push(uuidv4());
            tick();
        }
        console.timeEnd("Single");
    }
};
if (require.main === module) {
    main();
}