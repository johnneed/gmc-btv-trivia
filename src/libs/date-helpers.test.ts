import { dateFactory } from "./date-helpers";
import { date2String } from "./date-helpers";
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


describe("date2String", () => {
    it("returns a formatted date when given a date", () => {
        const input = new Date("11-12-2023");
        const returnVal = date2String(input);
        expect(returnVal?.valueOf()).toEqual("November 12, 2023");
    });
    it("returns a formatted date when given a string representing a valid date", () => {
        const input = "12-12-2023";
        const returnVal = date2String(input);
        expect(returnVal?.valueOf()).toEqual("December 12, 2023");
    });
    it("returns an empty string when given an invalid date", () => {
        const input = "NOT A DATE";
        const returnVal = date2String(input);
        expect(returnVal?.valueOf()).toEqual("");
    });
});
