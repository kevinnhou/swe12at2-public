"use client";

import type { TUser } from "@/hooks/use-auth";

import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "~/button";

export function DesktopNavigation({ className = "" }) {
  return (
    <nav className={`flex-grow flex items-center justify-between ${className}`}>
      {/* <div className="flex-grow flex justify-center space-x-6">
        {navigationLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {link.name}
          </Link>
        ))}
      </div> */}
    </nav>
  );
}

export function MobileNavigation({
  isAuthenticated,
  onClose,
  signout,
}: {
  isAuthenticated?: boolean;
  onClose: () => void;
  signout?: () => Promise<void>;
  user?: null | TUser;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="md:hidden bg-background border-t border-border"
      exit={{ opacity: 0, y: -20 }}
      initial={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="border-t border-border px-4 py-5">
        <div className="flex flex-col space-y-3">
          {isAuthenticated ? (
            <>
              <Button
                asChild
                className="w-full"
                onClick={onClose}
                variant="outline"
              >
                <Link href="/profile">Profile</Link>
              </Button>
              <Button
                asChild
                className="w-full"
                onClick={onClose}
                variant="outline"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button
                className="w-full"
                onClick={() => {
                  if (signout) signout();
                  onClose();
                }}
                variant="outline"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                className="w-full"
                onClick={onClose}
                variant="outline"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="w-full"
                onClick={onClose}
                variant="cta"
              >
                <Link href="/signup">Signup</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
