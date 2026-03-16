interface Props {
  questions: string[];
  answers: string[];
  flags: boolean[];
  current: number;
  jumpToQuestion: (index: number) => void;
}

export default function QuestionNavigator({
  questions,
  answers,
  flags,
  current,
  jumpToQuestion
}: Props) {

  return (
    <div style={{ marginBottom: "20px" }}>

      {questions.map((q, index) => {

        const answered = answers[index] !== "";
        const flagged = flags[index];

        return (
          <button
            key={index}
            onClick={() => jumpToQuestion(index)}
            style={{
              marginRight: "5px",
              background:
                index + 1 === current
                  ? "#4CAF50"
                  : answered
                  ? "#90EE90"
                  : "#ddd"
            }}
          >
            {index + 1} {flagged ? "⚑" : ""}
          </button>
        );

      })}

    </div>
  );
}

