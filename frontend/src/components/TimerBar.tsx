interface Props {
  timeLeft: number;
}

export default function TimerBar({ timeLeft }: Props) {

  return (
    <p>⏱ Time left: {timeLeft}s</p>
  );

}

