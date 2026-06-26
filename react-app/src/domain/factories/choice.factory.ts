import { v4 as uuidv4 } from "uuid";
import type Choice from "../types/choice.type";

const createChoice = (overrides: Partial<Choice> = {}): Choice => ({
  id: uuidv4(),
  text: "",
  ...overrides,
});

export { createChoice };
