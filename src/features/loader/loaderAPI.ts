import { Trivia } from "../../models/types";

export const fetchTrivia = async (amount = 1): Promise<Trivia> => {
    // const response = await fetch("https://gmcburlington.org/wp-content/uploads/2023/09/trivia.json");
    // const trivia = await response.json();
    // return trivia as Trivia;
    return {
        quizzes: [{
            id: "Quiz_1",
            title: "Quiz 1",
            publishDate: new Date("02-22-2023"),
            image: "foo.jpg",
            questions: [
                {
                    id: "Q1",
                    tags: ["QTAG1"],
                    questionText: "Question 1",
                    choices: [{
                        text: "Choice A"
                    }, {
                        text: "Choice B"
                    }, {
                        text: "Choice C"
                    }, {
                        text: "Choice D"
                    }],
                    correctAnswerIndex: 0,
                    answerText: "OMG YOU GOT IT RIGHT",
                    answerImage: undefined
                }
            ],
            tags: ["TAG 1", "COMMON TAG"]
        },
            {
                id: "Quiz_2",
                title: "Quiz 2",
                publishDate: new Date("03-22-2023"),
                image: "bar.jpg",
                questions: [
                    {
                        id: "Q1",
                        tags: ["QTAG1"],
                        questionText: "Question 2",
                        choices: [{
                            text: "Choice E"
                        }, {
                            text: "Choice F"
                        }, {
                            text: "Choice G"
                        }, {
                            text: "Choice H"
                        }],
                        correctAnswerIndex: 1,
                        answerText: "OMG YOU GOT IT RIGHT",
                        answerImage: undefined
                    }
                ],
                tags: ["TAG 2", "COMMON TAG"]

            }]
    };
};
