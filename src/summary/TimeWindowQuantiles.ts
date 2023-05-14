import { ITimeProvider } from "../time/ITimeProvider";
import { Quantile, QuantileDigest } from "./QuantileDigest";

export class TimeWindowQuantiles {
    private ringBuffer: QuantileDigest[]
    private currentBuffer = 0;

    private lastRotation: number
    private rotationDuration: number

    constructor(public quantiles: Quantile[], public maxAge: number, ageBuckets: number, public timeProvider: ITimeProvider) {
        this.maxAge = maxAge;

        this.ringBuffer = Array(Math.trunc(ageBuckets));
        for (let i = 0; i < this.ringBuffer.length; ++i) {
            this.ringBuffer[i] = new QuantileDigest(this.quantiles);
        }
        this.lastRotation = this.timeProvider.getTime();
        this.rotationDuration = maxAge / ageBuckets;
    }

    get(q: number) {
        const digest = this.rotate();
        return digest.get(q);
    }

    insert(value: number) {
        for (const digest of this.ringBuffer) {
            digest.insert(value);
        }
    }

    private rotate(): QuantileDigest {
        const currentTime = this.timeProvider.getTime();

        let currentDelta = currentTime - this.lastRotation;
        while (currentDelta > this.rotationDuration) {
            this.ringBuffer[this.currentBuffer] = new QuantileDigest(this.quantiles);
            this.currentBuffer = (this.currentBuffer + 1) >= this.ringBuffer.length ? 0 : this.currentBuffer + 1;
            currentDelta -= this.rotationDuration;
        }

        this.lastRotation = currentTime;
        return this.ringBuffer[this.currentBuffer];
    }
}

