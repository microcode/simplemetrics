import {
    SummaryBuilder,
    Registry,
    Namespace
} from "../index";

import { ICollectedMetric } from "../ICollectedMetric";

const registry = new Registry();
const ns = new Namespace(registry, "Summary");

import "mocha";
import * as chai from "chai";

const expect = chai.expect;

function metricValues(metrics: IterableIterator<ICollectedMetric>) {
    return JSON.parse(JSON.stringify(Array.from(metrics), (key, value) => {
        switch (key) {
            case 'labels': return Object.fromEntries(value.entries());
            case 'values': return Array.from(value);
            default: return value;
        }
    }));
}

describe("Summary", function () {
    beforeEach(() => {
        ns.clear();
    });

    it("should observe values", function () {
        const testSummary = new SummaryBuilder()
            .namespace(ns)
            .name("testSummary")
            .build();

        const testInstance = testSummary.labels({});
        testInstance.observe(5);

        expect(testInstance.count).to.equal(1);
        expect(testInstance.sum).to.equal(5);
    });

    it("should collect values properly", function () {
        const testSummary = new SummaryBuilder<{ labelA: string, labelB: string }>()
            .namespace(ns)
            .quantile(0.5, 0.01)
            .quantile(0.9, 0.01)
            .quantile(0.95, 0.01)
            .quantile(0.99, 0.01)
            .name("testSummary")
            .build();

        testSummary.labels({ labelA: "A", labelB: "B" }).observe(5);
        testSummary.labels({ labelA: "B", labelB: "C" }).observe(10);

        const result = metricValues(testSummary.collect());

        expect(result).to.deep.equal([
            {
                namespace: "Summary",
                type: "summary",
                name: "testSummary",
                labels: {},
                values: [
                    {
                        suffix: "count",
                        labels: {
                            labelA: "A",
                            labelB: "B"
                        },
                        value: 1
                    },
                    {
                        suffix: "sum",
                        labels: {
                            labelA: "A",
                            labelB: "B"
                        },
                        value: 5
                    },
                    {
                        labels: {
                            labelA: "A",
                            labelB: "B",
                            quantile: "0.5"
                        },
                        value: 5
                    },
                    {
                        labels: {
                            labelA: "A",
                            labelB: "B",
                            quantile: "0.9"
                        },
                        value: 5
                    },
                    {
                        labels: {
                            labelA: "A",
                            labelB: "B",
                            quantile: "0.95"
                        },
                        value: 5
                    },
                    {
                        labels: {
                            labelA: "A",
                            labelB: "B",
                            quantile: "0.99"
                        },
                        value: 5
                    },
                    {
                        suffix: "count",
                        labels: {
                            labelA: "B",
                            labelB: "C"
                        },
                        value: 1
                    },
                    {
                        suffix: "sum",
                        labels: {
                            labelA: "B",
                            labelB: "C"
                        },
                        value: 10
                    },
                    {
                        labels: {
                            labelA: "B",
                            labelB: "C",
                            quantile: "0.5"
                        },
                        value: 10
                    },
                    {
                        labels: {
                            labelA: "B",
                            labelB: "C",
                            quantile: "0.9"
                        },
                        value: 10
                    },
                    {
                        labels: {
                            labelA: "B",
                            labelB: "C",
                            quantile: "0.95"
                        },
                        value: 10
                    },
                    {
                        labels: {
                            labelA: "B",
                            labelB: "C",
                            quantile: "0.99"
                        },
                        value: 10
                    }
                ]
            }
        ]);
    });
});
