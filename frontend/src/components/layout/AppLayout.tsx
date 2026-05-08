import { Outlet } from "react-router-dom";
import { NavigationProvider } from "./Navigation";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <NavigationProvider />
      <main className="lg:ml-64 pt-16 pb-24 lg:pb-8 min-h-screen">
        <div className="px-5 py-8 lg:px-8 max-w-[1280px] mx-auto page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
