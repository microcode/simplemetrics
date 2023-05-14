import { CounterBuilder } from "../counter/CounterBuilder";
import { Registry } from "./Registry";
import { Namespace } from "../namespace/Namespace";

import { INamespace } from "../namespace/INamespace";
import { ICollectedMetric } from "../ICollectedMetric";

import "mocha";
import * as chai from "chai";

const expect = chai.expect;

function* mapNamespaces<T>(iterator: IterableIterator<[string, INamespace]>, cb: (name: string, namespace: INamespace) => T) {
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


describe("Registry", function () {
    it("should properly track namespaces", function () {
        const registry = new Registry();

        new Namespace(registry, "foo");

        const names = [...mapNamespaces<string>(registry.namespaces, (name,) => name)];

        expect(names).to.deep.equal(["foo"]);
    });
   
    it("should properly clear namespaces", function () {
        const registry = new Registry();

        new Namespace(registry, "foo");

        expect(Array.from(registry.namespaces)).to.have.length(1);

        const names = [...mapNamespaces<string>(registry.namespaces, (name,) => name)];
        expect(names).to.deep.equal(["foo"]);

        registry.clear();

        expect(Array.from(registry.namespaces)).to.have.length(0);
    });

    it("should not allow duplicate namespaces", function () {
        const registry = new Registry();

        new Namespace(registry, "foo");

        expect(() => new Namespace(registry, "foo")).to.throw("Namespace already exists");

        const names = [...mapNamespaces<string>(registry.namespaces, (name,) => name)];

        expect(names).to.deep.equal(["foo"]);
    });


    it("should properly collect entire registry", function () {
        const registry = new Registry();

        const ns1 = new Namespace(registry, "ns1");
        const ns2 = new Namespace(registry, "ns2");

        const counter1 = new CounterBuilder()
            .namespace(ns1)
            .name("counter1")
            .build();
        const counter2 = new CounterBuilder()
            .namespace(ns2)
            .name("counter2")
            .build();

        counter1.labels({}).inc();
        counter2.labels({}).inc();

        const result = metricValues(registry.collect());

        expect(result).to.deep.equal([
            {
                namespace: "ns1",
                type: "counter",
                name: "counter1",
                labels: {},
                values: [
                    {
                        labels: {},
                        suffix: "total",
                        value: 1
                    }
                ]
            },
            {
                namespace: "ns2",
                type: "counter",
                name: "counter2",
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
});