import {parallelCreate} from "async-await-cluster";
import fs from "fs"
import {createNumberPNG} from "./imageWorker";

/**
 *  This example async-await-cluster should be faster than Single Process.
 *  But it depends on your Computer.
 *  Worker Script: imageWorker.ts
 */
const main = async () => {

    const jobsMul = Array.from({length: 5000}, (_, idx) => [idx.toString().padStart(3, '0'), `Mul/img-${idx.toString().padStart(3, '0')}.png`]);
    const jobsSig = Array.from({length: 5000}, (_, idx) => [idx.toString().padStart(3, '0'), `Sig/img-${idx}.png`]);
    await fs.promises.mkdir('Mul', {recursive: true});
    await fs.promises.mkdir('Sig', {recursive: true});

    //multi process
    {
        console.time("Parallel");
        // pass worker script path
        const filePaths = await parallelCreate(jobsMul, __dirname + "/" + "imageWorker.js", {log: false});
        console.timeEnd("Parallel");
    }
    //single process
    {

        console.time("Single");
        const ProgressBar = require("progress");
        const bar = new ProgressBar("[:bar] :current :total :percent ETA :eta Sec :rate Job/Sec", {
            total: jobsSig.length,
        });
        const tick = () => {
            bar.tick();
        };
        const filePaths = [];
        for (const job of jobsSig) {
            filePaths.push(createNumberPNG(job));
            tick();
        }
        console.timeEnd("Single");
    }
};
if (require.main === module) {
    main();
}