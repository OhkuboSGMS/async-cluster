# async-await cluster
run multiprocessing on line.
[日本語](./README-ja.md)

# Requirement
node >
# Feature
* Await cluster process on async function
* Auto distributing Jobs.
* Force dividing worker script.

# Install 
 `npm install async-await-cluster`
 
# Example
[example](example) show How To Use.


##Worker
Worker performs  given jobs.

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

## Master
master generates job arguments and specifies a script for processing to be executed in parallel.

[uuidMaster](example/generateUUIDv4Parallel.ts)

```typescript

import {parallelCreate} from "async-await-cluster";

 const main = async () => {
    // generate job arguments
    const jobs = Array.from({length: 1000}, (_, idx) => idx);
    // pass worker script path
    const uuids = await parallelCreate(jobs.slice(0), __dirname + "/" + "uuidWorker.js");
}
main()

```

# Not Every Multi Processing makes Faster
Launching and Messaging process take a few more costs.

Whether parallel processing speeds up depends on the processing to be executed and the number of processes and threads on your computer.

[example/generateUUIDv4Parallel](example/generateUUIDv4Parallel.ts) is not faster than single process.
