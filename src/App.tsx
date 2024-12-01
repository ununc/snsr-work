import { BrowserRouter } from "react-router-dom";
import { PathController } from "@/router/PathController";
import "@/App.css";

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
