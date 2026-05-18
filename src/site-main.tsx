import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import SitePage from "./SitePage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SitePage />
  </StrictMode>,
);
