import { Route, Routes } from "react-router";

import { AboutScreen } from "@/features/about/AboutScreen";
import { DailyScreen } from "@/features/daily/DailyScreen";
import { GeneratorScreen } from "@/features/generator/GeneratorScreen";
import { NotFoundScreen } from "@/features/not-found/NotFoundScreen";
import { SharedChallengeScreen } from "@/features/shared-challenge/SharedChallengeScreen";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<GeneratorScreen />} />
      <Route path="/daily" element={<DailyScreen />} />
      <Route path="/c" element={<SharedChallengeScreen />} />
      <Route path="/about" element={<AboutScreen />} />
      <Route path="*" element={<NotFoundScreen />} />
    </Routes>
  );
}
