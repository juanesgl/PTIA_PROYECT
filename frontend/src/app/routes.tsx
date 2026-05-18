import React from "react";
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { CurriculumMap } from "./pages/CurriculumMap";
import { Schedule } from "./pages/Schedule";
import { Progress } from "./pages/Progress";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "mapa", Component: CurriculumMap },
      { path: "horario", Component: Schedule },
      { path: "progreso", Component: Progress },
    ],
  },
]);
