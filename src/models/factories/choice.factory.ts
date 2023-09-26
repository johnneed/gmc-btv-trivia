import type { Choice } from "../types";

const choiceFactory = (data: any): Choice => ({
    text: typeof data?.text === "string" ? data.text : ""
})

export default choiceFactory