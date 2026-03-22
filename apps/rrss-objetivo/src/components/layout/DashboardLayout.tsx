import Sidebar from "./Sidebar";
import DonnaChatPanel from "../donna/DonnaChatPanel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full relative overflow-hidden text-neutral-900 dark:text-neutral-100 font-sans">
      {/* Background Image fixed layer */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[url('/bg-light.png')] dark:bg-[url('/bg-dark.png')] -z-20 transition-colors duration-500" />
      
      {/* Darkening / Lightening Overlay for Contrast */}
      <div className="absolute inset-0 bg-white/40 dark:bg-black/60 -z-10 pointer-events-none transition-colors duration-500" />
      
      <div className="flex w-full h-full z-10 relative">
        <Sidebar />
        <DonnaChatPanel />
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0 bg-white/20 dark:bg-black/20 backdrop-blur-md relative">
          <div className="w-full h-full p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
