import * as R from "ramda";

// Caution: this function returns false for a value of 0. `new Date(0)` will produce a valid Date of 1970-01-01T00:00:00.000Z.
// Modify this with a zero check if you intend generate a date by passing zero.
const isValidDate = (value: unknown): boolean => Boolean(value) && new Date(value as any).toString() !== "Invalid Date";


const fn = R.cond([
    [x => isValidDate(x[0]), x => new Date(x[0])],
    [x => x[1], () => new Date()],
    [R.T, R.always(undefined)]
]);
export const dateFactory = (date: unknown, returnCurrentDate: boolean = false): Date | undefined => {
    return fn([date, returnCurrentDate]);
};