import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { FutureConfig } from "react-router-dom";

const futureConfig: FutureConfig = {
  v7_startTransition: true,
};

createRoot(document.getElementById("root")!).render(<App />);