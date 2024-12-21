import { BrowserRouter } from "react-router-dom";
import { PathController } from "@/router/PathController";
import "@/App.css";
import { useGlobalStore } from "./stores/global.store";
import { useEffect, useState } from "react";
import { Toaster } from "./components/ui/toaster";

export const App = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    useGlobalStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });
  }, []);

  if (!isHydrated) {
    return null; // or loading spinner
  }

  return (
    <BrowserRouter>
      <div className="w-full h-full mx-auto max-w-md flex flex-col">
        <div className="w-full h-safe-top" />
        <main className="flex-1">
          <PathController />
        </main>
        <Toaster />
      </div>
    </BrowserRouter>
  );
};
