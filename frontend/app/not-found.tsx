import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4 text-center">
      <h1 className="text-6xl font-extrabold text-sky-400 mb-2">404</h1>
      <h2 className="text-xl font-bold mb-4">Page Not Found</h2>
      <p className="text-slate-400 text-xs max-w-sm mb-6">
        The trading route or resource you are looking for does not exist or has been moved.
      </p>
      <Link href="/app">
        <Button className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl h-10 px-5">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
