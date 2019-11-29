// onGetJob : omit process messaging
import {onGetJob} from "async-await-cluster";
import {createCanvas} from "canvas";
import cluster from "cluster"
import fs from "fs"

/**
 * draw number text.
 * @param args
 */
export function createNumberPNG(args: any[]) {
    // args:pass from master
    const num = args[0] as string;
    const fileName = args[1] as string;
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext("2d",);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.font = `${canvas.width / 2}px Sans`;
    ctx.fillText(num,0, canvas.height / 1.5);
    fs.writeFileSync(fileName, canvas.toBuffer());
    return fileName; // return process message pass data
}

if (cluster.isWorker) {
    onGetJob(createNumberPNG);
}


