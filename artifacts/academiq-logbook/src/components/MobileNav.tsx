import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Box, Menu, X } from "lucide-react";

const navLinks = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: null },
  { label: "Reviews", href: "/reviews" },
  { label: "Resources", href: "/resources" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  return (
    <>
      <nav className="relative z-30 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md">
              <Box className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">AcademiQ</span>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 text-sm text-foreground/80 md:flex">
          {navLinks.map((link) => (
            <li key={link.label} className="cursor-pointer hover:text-foreground">
              {link.href ? (
                <Link href={link.href}>
                  <span className={location === link.href ? "text-violet-600 font-medium" : ""}>{link.label}</span>
                </Link>
              ) : (
                <span>{link.label}</span>
              )}
            </li>
          ))}
        </ul>

        {/* Desktop auth buttons */}
        <div className="hidden items-center gap-5 md:flex">
          <Link href="/sign-in">
            <span className="cursor-pointer text-sm font-medium text-foreground">Sign in</span>
          </Link>
          <Link href="/sign-up">
            <button className="rounded-lg bg-gradient-to-b from-violet-500 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 hover:opacity-95 transition">
              Get started free
            </button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white shadow-sm md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-20 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div
            className="absolute left-0 right-0 top-[69px] mx-4 rounded-2xl border border-slate-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="divide-y divide-slate-100 px-2 py-2">
              {navLinks.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <Link href={link.href}>
                      <span
                        className={`block rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-violet-50 hover:text-violet-600 cursor-pointer ${
                          location === link.href ? "text-violet-600 bg-violet-50" : "text-foreground"
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </span>
                    </Link>
                  ) : (
                    <span className="block rounded-xl px-4 py-3 text-sm font-medium text-foreground/50 cursor-default">
                      {link.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-100 p-3 flex flex-col gap-2">
              <Link href="/sign-in">
                <button
                  className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-foreground hover:bg-slate-50 transition"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </button>
              </Link>
              <Link href="/sign-up">
                <button
                  className="w-full rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 py-3 text-sm font-semibold text-white shadow-md hover:opacity-95 transition"
                  onClick={() => setOpen(false)}
                >
                  Get started free
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
