import Link from "next/link";
import { Metadata } from "next";
import { APP_CONFIG } from "@/config/app";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist. Head back to Storytime to discover amazing stories.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-accent-shade-1 flex flex-col items-center justify-center px-6 text-center">
      {/* Illustration */}
      <div className="text-8xl mb-6 select-none" aria-hidden="true">📖</div>

      {/* Headline */}
      <h1
        className={`text-6xl text-primary-colour mb-3 ${Magnetik_Bold.className}`}
        aria-label="Error 404 — Page not found"
      >
        404
      </h1>
      <h2 className={`text-xl text-primary-colour mb-3 ${Magnetik_Bold.className}`}>
        Page Not Found
      </h2>
      <p className={`text-primary-shade-4 text-sm max-w-sm mb-10 leading-relaxed ${Magnetik_Regular.className}`}>
        Looks like this page went missing — maybe it's hiding inside a great story.
        Head back and keep exploring.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          href="/"
          className={`flex-1 py-3 px-6 rounded-full bg-complimentary-colour text-universal-white text-sm text-center ${Magnetik_Medium.className}`}
        >
          Go Home
        </Link>
        <Link
          href="/search"
          className={`flex-1 py-3 px-6 rounded-full border-2 border-primary-colour text-primary-colour text-sm text-center ${Magnetik_Medium.className}`}
        >
          Search Stories
        </Link>
      </div>

      {/* Subtle brand */}
      <p className={`mt-12 text-xs text-primary-shade-3 ${Magnetik_Regular.className}`}>
        {APP_CONFIG.name} · {APP_CONFIG.shortDescription}
      </p>
    </div>
  );
}
