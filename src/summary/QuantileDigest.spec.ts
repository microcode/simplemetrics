import {
    Quantile,
    QuantileDigest
} from "./QuantileDigest";

import "mocha";
import * as chai from "chai";

const expect = chai.expect;

const qMin: Quantile = new Quantile(0.0, 0.00);
const q50: Quantile = new Quantile(0.5, 0.01);
const q95: Quantile = new Quantile(0.95, 0.005);
const q99: Quantile = new Quantile(0.99, 0.001);
const qMax: Quantile = new Quantile(1.0, 0.00);

function validateResults(digest: QuantileDigest) {
    for (const q of digest.quantiles) {
        const actual = digest.get(q.quantile);
        let lowerBound: number;
        let upperBound: number;

        if (q.quantile == 0) {
            lowerBound = 1;
            upperBound = 1;
        } else if (q.quantile == 1) {
            lowerBound = digest.numObservations;
            upperBound = digest.numObservations;
        } else {
            lowerBound = Math.floor(digest.numObservations * (q.quantile - 2 * q.epsilon));
            upperBound = Math.ceil(digest.numObservations * (q.quantile + 2 * q.epsilon));
        }

        const ok = (actual >= lowerBound) && (actual <= upperBound);
        if (!ok) {
            throw new Error("Results are not matching");
        }
    }
}

function shuffledValues(count: number): number[] {
    const result = new Array<number>(count);
    for (let i = 0; i < count; ++i) {
        result[i] = (i + 1.0);
    }


    return result
        .map(value => ({ value, order: Math.random() }))
        .sort((a, b) => a.order - b.order)
        .map(({ value }) => value);

}

describe("QuantileDigest", function () {
    it("should get NaN on empty digests", function () {
        const digest = new QuantileDigest([q50, q95, q99]);
        expect(Number.isNaN(digest.get(q95.quantile))).to.be.true;
    });

    it("should get valid results", function () {
        const digest = new QuantileDigest([q50, q95, q99]);
        for (const value of shuffledValues(100)) {
            digest.insert(value);
        }
        validateResults(digest);
    });

    it("should work well with 1 million elements", function () {
        const digest = new QuantileDigest([q50, q95, q99]);
        for (const value of shuffledValues(1000 * 1000)) {
            digest.insert(value);
        }
        validateResults(digest);
        expect(digest.samples.length).to.be.lessThan(1000);
    });

    it("should compress samples well with minimum quantile", function () {
        const digest = new QuantileDigest([qMin]);
        for (const value of shuffledValues(1000)) {
            digest.insert(value);
        }
        validateResults(digest);
        digest.compress();
        expect(digest.samples.length).to.equal(2);
    });

    it("should compress samples well with maximum quantile", function () {
        const digest = new QuantileDigest([qMax]);
        for (const value of shuffledValues(1000)) {
            digest.insert(value);
        }
        validateResults(digest);
        digest.compress();
        expect(digest.samples.length).to.equal(2);
    });

    it("should compress samples well with minimum and maximum quantiles", function () {
        const digest = new QuantileDigest([qMin, qMax]);
        for (const value of shuffledValues(1000)) {
            digest.insert(value);
        }
        validateResults(digest);
        digest.compress();
        expect(digest.samples.length).to.equal(2);
    });

    it("should compress samples well with minimum and other quantiles", function () {
        const digest = new QuantileDigest([q95, qMin]);
        for (const value of shuffledValues(1000)) {
            digest.insert(value);
        }
        validateResults(digest);
        digest.compress();
        expect(digest.samples.length).to.be.lessThan(200);
    });

    it("should compress samples well with maximum and other quantiles", function () {
        const digest = new QuantileDigest([q50, q95, qMax]);
        for (const value of shuffledValues(1000)) {
            digest.insert(value);
        }
        validateResults(digest);
        digest.compress();
        expect(digest.samples.length).to.be.lessThan(200);
    });

    it("should compress samples well with minimum, maximum and other quantiles", function () {
        const digest = new QuantileDigest([qMin, q50, q95, q99, qMax]);
        for (const value of shuffledValues(1000)) {
            digest.insert(value);
        }
        validateResults(digest);
        digest.compress();
        expect(digest.samples.length).to.be.lessThan(200);
    });

    it("should keep all samples when using an exact quantile", function () {
        const q95Exact = new Quantile(0.95, 0);
        const digest = new QuantileDigest([qMin, q50, q95Exact]);
        const values = shuffledValues(10000);
        for (const value of values) {
            digest.insert(value);
        }
        validateResults(digest);
        expect(digest.samples).to.have.length(values.length);
    });

    it("should work with a max epsilon quantile", function () {
        const digest = new QuantileDigest([new Quantile(0.95, 1)]);
        const values = shuffledValues(10000);
        for (const value of values) {
            digest.insert(value);
        }
        validateResults(digest);
    });
});
