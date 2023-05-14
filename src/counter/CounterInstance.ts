import { ICollectedMetricValue } from "../ICollectedMetricValue";
import { MetricInstance } from "../metric/MetricInstance";
import { ICounterInstance } from "./ICounterInstance";

export class CounterInstance extends MetricInstance implements ICounterInstance {
    _value = 0

    inc(): void {
        ++ this._value;
    }

    add(amount: number): void {
        if (amount < 0) {
            throw new Error("Amount cannot be negative");
        }
        this._value += amount;
    }

    get value(): number {
        return this._value;
    }

    collect(): IterableIterator<ICollectedMetricValue> {
        return (function* (): Generator<ICollectedMetricValue, void, unknown> {
            yield {
                suffix: 'total',
                labels: this.labels,
                value: this._value,
            };
        }.bind(this))();
    }
}
