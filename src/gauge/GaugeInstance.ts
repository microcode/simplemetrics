import { ICollectedMetricValue } from "../ICollectedMetricValue";
import { MetricInstance } from "../metric/MetricInstance";
import { IGaugeInstance } from "./IGaugeInstance";

export class GaugeInstance extends MetricInstance implements IGaugeInstance {
    _value = 0

    set value(value: number) {
        this._value = value;
    }

    get value(): number {
        return this._value;
    }

    inc(): void {
        ++ this._value;
    }

    add(amount: number): void {
        this._value += amount;
    }

    sub(amount: number): void {
        this._value -= amount;
    }

    collect(): IterableIterator<ICollectedMetricValue> {
        return (function* (): Generator<ICollectedMetricValue, void, unknown> {
            yield {
                labels: this.labels,
                value: this._value
            };
        }.bind(this))();
    }
}
