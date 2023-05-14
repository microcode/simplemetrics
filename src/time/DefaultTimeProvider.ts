import { ITimeProvider } from "./ITimeProvider";

class DefaultTimeProvider implements ITimeProvider {
    getTime() {
        return Date.now() / 1000.0;
    }
}

export const defaultTimeProvider = new DefaultTimeProvider();
