import {
    CounterBuilder,
    GaugeBuilder,
    Registry,
    Namespace
} from "../index";

import { IMetric } from "../metric/IMetric";
import { ICollectedMetric } from "../ICollectedMetric";

import "mocha";
import * as chai from "chai";

const expect = chai.expect;


function* mapMetrics<T>(iterator: IterableIterator<[string, IMetric]>, cb: (name: string, metric: IMetric) => T) {
    for (const [name, namespace] of iterator) {
        yield cb(name, namespace);
    }
}

function metricValues(metrics: IterableIterator<ICollectedMetric>) {
    return JSON.parse(JSON.stringify(Array.from(metrics), (key, value) => {
        switch (key) {
            case 'labels': return Object.fromEntries(value.entries());
            case 'values': return Array.from(value);
            default: return value;
        }
    }));
}

describe("Namespace", function () {
    const registry = new Registry();

    beforeEach(() => {
        registry.clear();
    });

    it("should properly track metrics", function () {
        const namespace = new Namespace(registry, "foo");
        new CounterBuilder()
            .namespace(namespace)
            .name("bar")
            .build();

        const names = [...mapMetrics<string>(namespace.metrics, (name,) => name)];

        expect(names).to.deep.equal(["bar"]);
    });
   
    it("should properly clear metrics", function () {
        const namespace = new Namespace(registry, "foo");
        new CounterBuilder()
            .namespace(namespace)
            .name("bar")
            .build();

        expect(Array.from(namespace.metrics)).to.have.length(1);

        const names = [...mapMetrics<string>(namespace.metrics, (name,) => name)];

        expect(names).to.deep.equal(["bar"]);

        namespace.clear();

        expect(Array.from(namespace.metrics)).to.have.length(0);
    });

    it("should not allow duplicate metrics", function () {
        const namespace = new Namespace(registry, "foo");

        new CounterBuilder()
            .namespace(namespace)
            .name("bar")
            .build();

        expect(() => new CounterBuilder().namespace(namespace).name("bar").build()).to.throw("Metric already exists");

        const names = [...mapMetrics<string>(namespace.metrics, (name,) => name)];

        expect(names).to.deep.equal(["bar"]);
    });

    it("should properly collect all metrics in namespace", function () {
        const namespace = new Namespace(registry, "foo");
        const counter = new CounterBuilder<{ labelA: string, labelB: string }>()
            .namespace(namespace)
            .name("counter")
            .build();
        const gauge = new GaugeBuilder<{ labelC: string, labelD: string }>()
            .namespace(namespace)
            .name("gauge")
            .build();

        counter.labels({ labelA: "A", labelB: "B" }).inc();
        counter.labels({ labelA: "C", labelB: "D" }).inc();

        gauge.labels({ labelC: "A", labelD: "B" }).value = 8;
        gauge.labels({ labelC: "C", labelD: "D" }).value = 12;

        const result = metricValues(namespace.collect());

        expect(result).to.deep.equal([
            {
                namespace: "foo",
                type: "counter",
                name: "counter",
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
                            labelA: "C",
                            labelB: "D"
                        },
                        suffix: "total",
                        value: 1
                    }
                ]
            },
            {
                namespace: "foo",
                type: "gauge",
                name: "gauge",
                labels: {},
                values: [
                    {
                        labels: {
                            labelC: "A",
                            labelD: "B"
                        },
                        value: 8
                    },
                    {
                        labels: {
                            labelC: "C",
                            labelD: "D"
                        },
                        value: 12
                    }
                ]
            }
        ]);
    });
});