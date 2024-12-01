import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";

createRoot(document.getElementById("root")!).render(<App />);

if (window?.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    document.body.style.height = `${window?.visualViewport?.height ?? 0}px`;
  });
}
