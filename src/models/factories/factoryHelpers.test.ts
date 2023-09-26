import { dateFactory } from "./factoryHelpers";

describe("dateFactory", () => {
    it("returns a valid date when given a valid date", () => {
        const input = new Date("12-12-2023");
        const returnVal = dateFactory(input);
        expect(returnVal?.valueOf()).toEqual(input.valueOf());
    });
    it("returns a valid date when given a valid date string", () => {
        const input = "11-12-2023";
        const returnVal = dateFactory(input);
        expect(returnVal?.getMonth()).toEqual(10);
        expect(returnVal?.getFullYear()).toEqual(2023);
        expect(returnVal?.getDate()).toEqual(12);
    });
    it("returns undefined when given an invalid input and returnCurrentDate", () => {
        const input = "NOT A DATE";
        const returnVal = dateFactory(input);
        expect(returnVal).toBeUndefined();
    });
    it("returns undefined when given a zero", () => {
        const input = 0;
        const returnVal = dateFactory(input);
        expect(returnVal).toBeUndefined();
    });
    it("returns the current date when given an invalid input and returnCurrentDate is true", () => {
        const input = "NOT A DATE";
        const today = new Date();
        const returnVal = dateFactory(input, true);
        expect(returnVal?.getMonth()).toEqual(today.getMonth());
        expect(returnVal?.getFullYear()).toEqual(today.getFullYear());
        expect(returnVal?.getDate()).toEqual(today.getDate());
    });
});
