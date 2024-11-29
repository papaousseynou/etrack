"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useContext, useEffect } from "react";
import { checkAndAddUser } from "../action";
// Modifiez l'import du ThemeContext
import { ThemeContext } from "../context/ThemeContext";
const Navbar = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      checkAndAddUser(user?.primaryEmailAddress?.emailAddress);
    }
  }, [user]);

  return (
    <div className="bg-base-200/30 px-5 md:px-[10%] py-4">
      {isLoaded &&
        (isSignedIn ? (
          <>
            <div className="flex justify-between items-center">
              <div className="flex text-2xl font-bold items-center">
                e <span className="text-accent">.Track</span>
              </div>
              <div className="md:flex hidden">
                <Link
                  className="btn btn-sm md:btn-md btn-outline btn-accent"
                  href={"/budgets"}
                >
                  Mes budgets
                </Link>
                <Link
                  className="btn btn-sm md:btn-md btn-outline btn-accent mx-4"
                  href={"/dashboard"}
                >
                  Tableau de bord
                </Link>
                <Link
                  className="btn btn-sm md:btn-md btn-outline btn-accent"
                  href={"/transactions"}
                >
                  Mes transactions
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="btn btn-circle btn-ghost"
                >
                  {theme === "cupcake" ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                </button>
                <UserButton />
              </div>
            </div>
            <div className="md:hidden flex mt-2 justify-center">
              <Link
                className="btn btn-sm md:btn-md btn-outline btn-accent"
                href={"/budgets"}
              >
                Mes budgets
              </Link>
              <Link
                className="btn btn-sm md:btn-md btn-outline btn-accent mx-4"
                href={""}
              >
                Tableau de bord
              </Link>
              <Link
                className="btn btn-sm md:btn-md btn-outline btn-accent"
                href={""}
              >
                Mes transactions
              </Link>
            </div>
          </>
        ) : (
          <div className="flex justify-between items-center">
            <div className="flex text-2xl font-bold items-center">
              e <span className="text-accent">.Track</span>
            </div>
            <div className="flex mt-2 justify-center">
              <Link
                className="btn btn-sm md:btn-md btn-outline flex items-center"
                href={"/sign-in"}
              >
                Se connecter
              </Link>
              <Link
                className="btn btn-sm md:btn-md btn-outline btn-accent mx-4"
                href={"/sign-up"}
              >
                S&apos;inscrire
              </Link>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Navbar;
