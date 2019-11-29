# async-await cluster
1行で並列処理をする.

# Feature
* async{内でawaitでclusterによる並列処理を待たせることができます}
* 仕事は自動でマスターが割り振ります.
* Workerの処理を単一ファイルに書くことを強制します.

# Install 
 `npm install async-await-cluster`
 
# Example
[example](example) に使い方のスクリプトが置いてあります.


## Worker
Workerは与えられた引数にしたがって仕事をします.

仕事内容(処理は)別ファイルに書かなければなりません.

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
Master(await元)は投げる仕事の引数列と並列実行する仕事のスクリプトを指定します.

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

async内で並列処理を待てます/

# 仕事によっては並列処理は速くならなかもしれません！
プロセスの立ち上げとプロセス間通信には一定のコストがかかるため
実行する処理によっては同期処理の方が早くなることもあります.

また、並列処理が効くのは使用しているコンピュータのコア数スレッド数にも依ります.

[example/generateUUIDv4Parallel](example/generateUUIDv4Parallel.ts) の例では自分は同期処理の方が速 かったです.
