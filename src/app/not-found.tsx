import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#08080a]">
      <div className="text-center">
        <h1 className="display mb-4 text-7xl gold-text-gradient">404</h1>
        <p className="mb-6 text-xl text-[#9b9a97]">Oops! Page not found</p>
        <Link
          href="/"
          className="text-[#e2b64f] underline transition-colors hover:text-[#f0cd7a]"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
