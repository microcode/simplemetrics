import {
    GaugeBuilder,
    Registry,
    Namespace
} from "../index";

import { ICollectedMetric } from "../ICollectedMetric";

const registry = new Registry();
const ns = new Namespace(registry, "Gauge");

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

describe("Gauge", function () {
    beforeEach(() => {
        ns.clear();
    });

    it("should increment the value", function () {
        const testGauge = new GaugeBuilder()
            .namespace(ns)
            .name("testGauge")
            .build();

        const testInstance = testGauge.labels({});
        testInstance.inc();

        expect(testInstance.value).to.equal(1);
    });

    it("should add to the value", function () {
        const testGauge = new GaugeBuilder()
            .namespace(ns)
            .name("testGauge")
            .build();

        const testInstance = testGauge.labels({});
        testInstance.add(2);

        expect(testInstance.value).to.equal(2);
    });

    it("should subtract from the value", function () {
        const testGauge = new GaugeBuilder()
            .namespace(ns)
            .name("testGauge")
            .build();

        const testInstance = testGauge.labels({});
        testInstance.sub(2);

        expect(testInstance.value).to.equal(-2);
    });


    it("should allow adding negative values", function () {
        const testGauge = new GaugeBuilder()
            .namespace(ns)
            .name("testGauge")
            .build();

        const testInstance = testGauge.labels({});
        testInstance.add(-1);

        expect(testInstance.value).to.equal(-1);
    });

    it("should collect values properly", function () {
        const testGauge = new GaugeBuilder<{ labelA: string, labelB: string }>()
            .namespace(ns)
            .name("testGauge")
            .build();

        testGauge.labels({ labelA: "A", labelB: "B" }).inc();
        testGauge.labels({ labelA: "B", labelB: "C" }).add(2);

        const result = metricValues(testGauge.collect());

        expect(result).to.deep.equal([
            {
                namespace: "Gauge",
                type: "gauge",
                name: "testGauge",
                labels: {},
                values: [
                    {
                        labels: {
                            labelA: "A",
                            labelB: "B"
                        },
                        value: 1
                    },
                    {
                        labels: {
                            labelA: "B",
                            labelB: "C"
                        },
                        value: 2
                    }
                ]
            }
        ]);
    });
});
