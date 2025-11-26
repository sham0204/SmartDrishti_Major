import "./globals.css";
import Navbar from "../components/navbar/Navbar";

export const metadata = {
  title: "SmartDrishti",
  description: "IoT learning platform with guided hardware labs."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="relative min-h-screen">
          <div className="gradient-hero absolute inset-0 opacity-30 blur-3xl" />
          <div className="relative z-10 flex min-h-screen flex-col">
            <Navbar />
            <main className="container mx-auto flex-1 px-4 py-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

