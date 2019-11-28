import {parallelCreate} from "async-await-cluster";
const uuidv4 = require('uuid/v4');

/**
 *  This multiprocessing not faster than Single Process.
 *  Worker Script:uuidWorker.ts
 */
const main = async () => {
    const jobs = Array.from({length: 1000000}, (_, idx) => idx);
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
        const uuids = [];
        for (const job of jobs) {
            uuids.push(uuidv4());
        }
        console.timeEnd("Single");
    }
};
if (require.main === module) {
    main();
}