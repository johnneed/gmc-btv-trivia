import type Question from "./question.type";

type Quiz = {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  authorId: number;
  publishDate: number;
  status: "draft" | "published";
  questions: Question[];
  tags: string[];
  // no image field — no featured image for games
};

export default Quiz;
