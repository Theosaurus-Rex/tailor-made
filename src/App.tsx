import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";

import { AppShell } from "@/components/AppShell";
import { AboutScreen } from "@/features/about/AboutScreen";
import { DailyScreen } from "@/features/daily/DailyScreen";
import { GeneratorScreen } from "@/features/generator/GeneratorScreen";
import { NotFoundScreen } from "@/features/not-found/NotFoundScreen";
import { SharedChallengeScreen } from "@/features/shared-challenge/SharedChallengeScreen";

const DebugScreen = import.meta.env.DEV
  ? lazy(() =>
      import("@/features/debug/DebugScreen").then((module) => ({ default: module.DebugScreen })),
    )
  : null;

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<GeneratorScreen />} />
        <Route path="/daily" element={<DailyScreen />} />
        <Route path="/c" element={<SharedChallengeScreen />} />
        <Route path="/about" element={<AboutScreen />} />
        {DebugScreen && (
          <Route
            path="/debug"
            element={
              <Suspense fallback={null}>
                <DebugScreen />
              </Suspense>
            }
          />
        )}
        <Route path="*" element={<NotFoundScreen />} />
      </Route>
    </Routes>
  );
}
