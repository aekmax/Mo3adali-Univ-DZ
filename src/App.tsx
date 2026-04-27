import { useState } from "react";
import WelcomeScreen from "./WelcomeScreen";
import GradeCalculator from "./GradeCalculator";

export default function App() {
  const [screen, setScreen] = useState<"welcome" | "calculator">("welcome");
  const [fading, setFading] = useState(false);

  const goToCalculator = () => {
    setScreen("calculator");
  };

  const goToWelcome = () => {
    setFading(true);
    setTimeout(() => {
      setScreen("welcome");
      setFading(false);
    }, 350);
  };

  return (
    <div style={{
      opacity: fading ? 0 : 1,
      transition: "opacity 0.35s ease",
      minHeight: "100dvh",
    }}>
      {screen === "welcome" ? (
        <WelcomeScreen onEnter={goToCalculator} />
      ) : (
        <GradeCalculator onBack={goToWelcome} />
      )}
    </div>
  );
}
