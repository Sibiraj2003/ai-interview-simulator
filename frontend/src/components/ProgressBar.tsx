interface Props {
  questionNumber: number;
  totalQuestions: number;
}

export default function ProgressBar({ questionNumber, totalQuestions }: Props) {

  const progress = (questionNumber / totalQuestions) * 100;

  return (

    <div
      style={{
        background: "#ddd",
        height: "10px",
        width: "100%",
        marginBottom: "20px"
      }}
    >
      <div
        style={{
          background: "#4CAF50",
          width: `${progress}%`,
          height: "100%"
        }}
      />
    </div>

  );

}

