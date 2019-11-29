# async-await cluster
run multiprocessing on line.

# Requirement
[日本語](./README-ja.md)
# Feature
* await cluster process on async function
* make simple worker script
* Force dividing worker script.

# Install 
 npm:
 `npm install async-await-cluster`
 
 
# Example
[example](example) show How To Use.


`Worker`
Worker performs the given job.
Process must be written to another file(like example/imageWorker.ts).

[uuidWorker](example/uuidWorker.ts)
```typescript

import cluster from "cluster"
const uuidv4 = require('uuid/v4');

if (cluster.isWorker) {
    process.on("message", async (jobArg: any) => {
        //generate uuid(take compute resource) and return result.
        const id =uuidv4();
        process.send(id)
    });
}

```

master generates job arguments and specifies a script for processing to be executed in parallel.
[uuidMater](example/generateUUIDv4Parallel.ts)

```typescript

import {parallelCreate} from "async-await-cluster";

 const main = async () => {
    // generate job arguments
    const jobs = Array.from({length: 1000}, (_, idx) => idx);
    // pass worker script path
    const uuids = await parallelCreate(jobs.slice(0), __dirname + "/" + "uuidWorker.js");
}

```

# Not Every Multi Processing makes Faster
Launching and Messaging process take a few more costs.

Whether parallel processing speeds up depends on the processing to be executed and the number of processes and threads on your computer.

[example/generateUUIDv4Parallel](example/generateUUIDv4Parallel.ts) is not faster than single process.
