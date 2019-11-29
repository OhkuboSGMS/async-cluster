import cluster from "cluster";
import os from "os"

/**
 * Worker
 */
export function onGetJob(callback: (job: any) => any) {
    if (cluster.isWorker) {
        process.on("message", (job: any) => {
            try {
                const result = callback(job);
                process.send(result);
            } catch (e) {
                process.send(RESULT_FAIL);
            }
        });
    }
}

/**
 * Master
 */
const ProgressBar = require("progress");
export const RESULT_FAIL = -1;

export interface Option {
    worker?: number;
    log?: boolean;
}

/**
 * Master distribute job to worker.
 * @param jobQueue
 * @param workers
 * @param option
 */
function masterWork(jobQueue: any[], workers: cluster.Worker[], option?: Partial<Option>): Promise<any> {
    const isLog = option.log !== undefined ? option.log : true;

    const bar = new ProgressBar("[:bar] :current :total :percent ETA :eta Sec :rate Job/Sec", {
        total: jobQueue.length,
    });
    const tick = () => {
        bar.tick();
        // if (bar.complete) {}
    };
    const resultData: any[] = [];
    const numOfCpu = option.worker !== undefined ? Math.min(option.worker, os.cpus().length) : os.cpus().length;

    if (isLog)
        console.log(`Hire ${numOfCpu} worker`);

    for (let i = 0; i < numOfCpu; i++) {
        if (jobQueue.length > 0) {
            const worker = cluster.fork();
            workers.push(worker);
            worker.send(jobQueue.pop());
            //ワーカープロセスがメッセージを送ったことをマスターに通知する
            //今回ではワーカーは仕事が終わったことを通知する
            worker.on('message', (result: any) => {
                // console.log(result);
                resultData.push(result);
                tick();
                // console.log(`Rest Work :${workQueue.length}`);
                if (jobQueue.length > 0) {
                    worker.send(jobQueue.pop())
                } else {
                    worker.kill();
                    // console.log(`Kill Worker ${worker.id}`)
                }
            });
        }
    }
    return new Promise(resolve => {
        cluster.on('online', (worker: cluster.Worker) => {
            // if (isLog)
            //     console.log('Worker ' + worker.process.pid + ' is Hired');
        });
        cluster.on('exit', (exitWorker: cluster.Worker, code: number, signal: string) => {
            // console.log('Worker ' + exitWorker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
            if (jobQueue.length > 0) {
                if (isLog)
                    console.log('Hiring a new worker');

                const worker = cluster.fork();
                workers.push(worker);
                worker.send(jobQueue.pop());
            } else {
                // console.log(`Worker ${exitWorker.process.pid} go home.`)
                workers = workers.filter(w => w.process.pid !== exitWorker.process.pid);
                if (workers.length === 0) {
                    if (isLog)
                        console.log("---++++--- C O M P L E T E ---+++---");
                    // console.log("Job End.");

                    //ワーカー全員が仕事を終了したのでresolve
                    resolve(resultData)
                }
            }
        });
    });
}

/**
 * run jobJS process with jobs argument.
 * master distribute jobs to worker.
 *
 * @param jobs Arguments to pass jobWorker(jobJS)
 * @param jobJS load worker script
 * @param option option for async-await-cluster
 */
export async function parallelCreate(jobs: any[], jobJS: string, option: Partial<Option> = {}) {
    if (cluster.isMaster) {
        let workers: cluster.Worker[] = [];
        const workQueue: any[] = jobs.slice();
        console.info(`Processing ${workQueue.length} Jobs with ${os.cpus().length} Workers and +1 Master`);
        cluster.setupMaster({exec: jobJS});

        return await masterWork(workQueue, workers, option);
    }
}

