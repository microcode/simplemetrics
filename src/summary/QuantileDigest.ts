import {
    IListIterator,
    LinkedList
} from "@microcode/linked-list";

export class Quantile {
    u: number
    v: number

    constructor(public quantile: number, public epsilon: number) {
        if (quantile < 0 || quantile > 1) throw new Error("Quantile out of range")
        if (epsilon < 0 || epsilon > 1) throw new Error("Epsilon out of range");

        this.u = 2.0 * epsilon / (1 - quantile);
        this.v = 2.0 * epsilon / quantile;
    }
}

class Sample {
    g = 1
    constructor(public value: number, public delta: number) {}
}

export class QuantileDigest {
    static readonly compressionInterval = 128;

    quantiles: Quantile[]
    samples: LinkedList<Sample> = new LinkedList();
    numObservations = 0;
    currentInserts = 0;

    buffer = new Float64Array(QuantileDigest.compressionInterval);
    bufferOffset = 0;

    constructor(quantiles: Quantile[]) {
        if (!quantiles.length) {
            throw new Error("Quantiles cannot be empty");
        }

        this.quantiles = quantiles;
    }

    insert(value: number) {
        this.buffer[this.bufferOffset++] = value;

        if (this.buffer.length == this.bufferOffset) {
            this.flush();
        }

        if (++this.currentInserts == QuantileDigest.compressionInterval) {
            this.compress();
            this.currentInserts = 0;
        }
    }

    get(q: number): number {
        this.flush();

        if (!this.samples.length) {
            return Number.NaN;
        }

        if (q < Number.EPSILON) {
            return this.samples.head.value.value;
        }

        if (q > (1 - Number.EPSILON)) {
            return this.samples.tail.value.value;
        }

        let r = 0;
        const desiredRank = Math.ceil(q * this.numObservations);
        const upperBound = desiredRank + (this.f(desiredRank) / 2);

        const iterator = this.samples.listIterator();
        while (iterator.hasNext) {
            const sample = iterator.next();
            if (r + sample.g + sample.delta > upperBound) {
                iterator.previous();
                if (iterator.hasPrevious) {
                    return iterator.previous().value;
                } else {
                    return sample.value;
                }
            }
            r += sample.g;
        }

        return this.samples.tail.value.value;
    }

    flush() {
        if (this.bufferOffset == 0) {
            return;
        }

        const values = this.buffer
            .slice(0, this.bufferOffset)
            .sort();
        this.bufferOffset = 0;

        let i = 0;
        let r = 0;

        const iterator = this.samples.listIterator();
        while (iterator.hasNext && i < values.length) {
            const sample = iterator.next();
            while (i < values.length) {
                if (values[i] > sample.value) {
                    break;
                }

                this.insertBefore(iterator, values[i], r);

                ++r;
                ++i;
                ++this.numObservations;
            }
            r += sample.g;
        }

        while (i < values.length) {
            this.samples.add(new Sample(values[i++], 0));
            ++this.numObservations;
        }
    }

    insertBefore(iterator: IListIterator<Sample>, value: number, r: number) {
        if (!iterator.hasPrevious) {
            this.samples.addHead(new Sample(value, 0));
        } else {
            iterator.previous();
            iterator.add(new Sample(value, this.f(r) - 1));
            iterator.next();
        }
    }

    compress() {
        if (this.samples.length < 3) {
            return;
        }

        const descendingIterator = this.samples.descendingIterator();
        let r = this.numObservations;

        let right;
        let left = descendingIterator.next();
        r -= left.g;

        while (descendingIterator.hasNext) {
            right = left;
            left = descendingIterator.next();
            r = r - left.g;
            if (left == this.samples.head.value) {
                break;
            }
            if (left.g + right.g + right.delta < this.f(r)) {
                right.g += left.g;
                descendingIterator.remove();
                left = right;
            }
        }
    }

    private f(r: number) {
        let minResult = Number.MAX_SAFE_INTEGER;
        for (const q of this.quantiles) {
            if (q.quantile < Number.EPSILON || q.quantile > (1 - Number.EPSILON)) {
                continue;
            }

            let result;
            if (r >= q.quantile * this.numObservations) {
                result = Math.trunc(q.v * r + Number.EPSILON);
            } else {
                result = Math.trunc(q.u * (this.numObservations - r) + Number.EPSILON);
            }

            minResult = Math.min(result, minResult);
        }

        return Math.max(minResult, 1);
    }
}