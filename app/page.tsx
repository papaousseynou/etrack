// import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div>
      {/* <UserButton/> */}
      <Navbar />
      <div className="flex items-center justify-center flex-col text-center py-10 w-full">
        <div>
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl font-bold text-center">
              Prenez le contrôle le <br /> de vos finances
            </h1>
            <p className="py-6 text-gray-800 text-center">
              Suivez vos budgets et vos dépenses <br /> en toute simplicité avec
              notre application intuitive
            </p>
            <div className="flex justify-center items-center">
              <Link
                className="btn btn-sm md:btn-md btn-outline"
                href={"/sign-in"}
              >
                Se connecter
              </Link>
              <Link
                className="btn btn-sm md:btn-md ml-2 btn-accent"
                href={"/sign-up"}
              >
                S&apos;inscrire
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
