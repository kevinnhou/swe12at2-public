"use client";

import Logo from "@/components/logo";
import { DesktopNavigation, MobileNavigation } from "@/components/navigation";
import { useAuth } from "@/hooks/use-auth";
import useScroll from "@/hooks/use-scroll";
import { site } from "@/lib/config";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "~/button";

export default function Header() {
  const pathname = usePathname();
  const scrolled = useScroll(50);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading, refreshUserData, signout } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      await refreshUserData();
      setAuthChecked(true);
    };

    checkAuth();
  }, [refreshUserData, pathname]);

  if (pathname?.includes("/onboarding")) {
    return null;
  }

  const renderHeaderContent = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        <div className="flex-shrink-0">
          <Link className="flex items-center space-x-2" href="/">
            <Logo className="h-8 w-8" />
            <span className="text-lg font-semibold text-foreground">
              {site.name.short}
            </span>
          </Link>
        </div>

        {!isLoading && (
          <>
            <DesktopNavigation className="hidden md:flex" />
            <div className="items-center space-x-4 hidden md:flex">
              {isAuthenticated ? (
                <>
                  <Button asChild variant="ghost">
                    <Link href="/profile">Profile</Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button onClick={signout} variant="outline">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild variant="cta">
                    <Link href="/signup">Signup</Link>
                  </Button>
                </>
              )}
            </div>
          </>
        )}

        <div className="flex md:hidden">
          <Button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            size="icon"
            variant="ghost"
          >
            <span className="sr-only">Toggle menu</span>
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                key={mobileMenuOpen ? "close" : "open"}
                transition={{ duration: 0.2 }}
              >
                {mobileMenuOpen ? (
                  <X aria-hidden="true" className="h-6 w-6" />
                ) : (
                  <Menu aria-hidden="true" className="h-6 w-6" />
                )}
              </motion.div>
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all ${
        scrolled
          ? "bg-background/80 backdrop-blur-sm shadow-sm"
          : "bg-background"
      }`}
    >
      {renderHeaderContent()}

      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileNavigation
            isAuthenticated={isAuthenticated}
            onClose={() => setMobileMenuOpen(false)}
            signout={signout}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
