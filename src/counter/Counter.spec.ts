import {
    CounterBuilder,
    Registry,
    Namespace
} from "../index";

import { Counter } from "./Counter";

import { IMetricInstance } from "../metric/IMetricInstance";
import { ICollectedMetric } from "../ICollectedMetric";

const registry = new Registry();
const ns = new Namespace(registry, "Counter");

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

describe("Counter", function () {
    beforeEach(() => {
        ns.clear();
    });

    it("should increment the value", function () {
        const testCounter = new CounterBuilder()
            .namespace(ns)
            .name("testCounter")
            .build();

        const testInstance = testCounter.labels({});
        testInstance.inc();

        expect(testInstance.value).to.equal(1);
    });

    it("should add to the value", function () {
        const testCounter = new CounterBuilder()
            .namespace(ns)
            .name("testCounter")
            .build();

        const testInstance = testCounter.labels({});
        testInstance.add(2);

        expect(testInstance.value).to.equal(2);
    });

    it("should not allow adding negative values", function () {
        const testCounter = new CounterBuilder()
            .namespace(ns)
            .name("testCounter")
            .build();

        const testInstance = testCounter.labels({});

        expect(() => {
            testInstance.add(-1);
        }).to.throw("Amount cannot be negative");

        expect(testInstance.value).to.equal(0);
    });

    it("should handle labels properly", function () {
        const testCounter = new CounterBuilder<{ labelA: string, labelB: string}>()
            .namespace(ns)
            .name("testCounter")
            .build();

        const testInstance = testCounter.labels({ labelA: "A", labelB: "B" });
        testInstance.inc();

        expect(Object.fromEntries(testInstance.labels)).to.deep.equal({ labelA: "A", labelB: "B" });
    });

    it("should handle const labels properly", function () {
        const testCounter = new CounterBuilder<{ labelA: string, labelB: string }>()
            .namespace(ns)
            .name("testCounter")
            .constLabels({ labelC: "C" })
            .build();

        const testInstance = testCounter.labels({ labelA: "A", labelB: "B" });
        testInstance.inc();

        const result = metricValues(testCounter.collect());

        expect(result).to.deep.equal([
            {
                namespace: "Counter",
                type: "counter",
                name: "testCounter",
                labels: {
                    labelC: "C"
                },
                values: [
                    {
                        labels: {
                            labelA: "A",
                            labelB: "B"
                        },
                        suffix: "total",
                        value: 1
                    }
                ]
            }
        ]);
    });

    it("should handle help messages properly", function () {
        const testCounter = new CounterBuilder()
            .namespace(ns)
            .name("testCounter")
            .help("help message")
            .build();

        const testInstance = testCounter.labels({});
        testInstance.inc();

        const result = metricValues(testCounter.collect());

        expect(result).to.deep.equal([
            {
                namespace: "Counter",
                type: "counter",
                name: "testCounter",
                help: "help message",
                labels: {},
                values: [
                    {
                        labels: {},
                        suffix: "total",
                        value: 1
                    }
                ]
            }
        ]);
    });

    it("should be added to namespace properly", function () {
        const counterName = "testCounter";
        const testCounter = new CounterBuilder<{ labelA: string, labelB: string }>()
            .namespace(ns)
            .name(counterName)
            .build();

        const testInstance = testCounter.labels({ labelA: "A", labelB: "B" });
        testInstance.inc();

        const metricResult = ns.metrics.next();
        expect(metricResult.done).to.be.false;

        expect(metricResult.value[0]).to.equal(counterName);
        expect(metricResult.value[1]).to.equal(testCounter);

        const counters = metricResult.value[1] as Counter<{ labelA: string, labelB: string }>;

        const metricInstanceResult = counters.instances.next();
        expect(metricInstanceResult.done).to.be.false;

        const metricInstance = metricInstanceResult.value[1] as IMetricInstance;

        expect(Object.fromEntries(testInstance.labels)).to.deep.equal({ labelA: "A", labelB: "B" });
        expect(Object.fromEntries(metricInstance.labels)).to.deep.equal({ labelA: "A", labelB: "B" });
    });

    it("should collect values properly", function () {
        const testCounter = new CounterBuilder<{ labelA: string, labelB: string }>()
            .namespace(ns)
            .name("testCounter")
            .build();

        testCounter.labels({ labelA: "A", labelB: "B" }).inc();
        testCounter.labels({ labelA: "B", labelB: "C" }).add(2);

        const result = metricValues(testCounter.collect());

        expect(result).to.deep.equal([
            {
                namespace: "Counter",
                type: "counter",
                name: "testCounter",
                labels: {},
                values: [
                    {
                        labels: {
                            labelA: "A",
                            labelB: "B"
                        },
                        suffix: "total",
                        value: 1
                    },
                    {
                        labels: {
                            labelA: "B",
                            labelB: "C"
                        },
                        suffix: "total",
                        value: 2
                    }
                ]
            }
        ]);
    });
});
