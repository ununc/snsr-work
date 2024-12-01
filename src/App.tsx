import { BrowserRouter } from "react-router-dom";
import "@/App.css";
import { PathController } from "@/router/PathController";

export const App = () => {
  return (
    <BrowserRouter>
      <div className="w-full h-full mx-auto max-w-md flex flex-col">
        <div className="w-full h-safe-top" />
        <main className="flex-1">
          <PathController />
        </main>
      </div>
    </BrowserRouter>
  );
};
