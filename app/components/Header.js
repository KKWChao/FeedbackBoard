"use client";
import { signIn, signOut, useSession } from "next-auth/react";

import Button from "./Button";
import Logout from "./icons/Logout";
import Login from "./icons/Login";
import ThemeChanger from "./ThemeChanger";

export default function Header() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.email;

  function logout() {
    signOut();
  }

  function login() {
    signIn("google");
  }
  return (
    <div className="max-w-2xl mx-auto justify-between flex p-2 gap-4 items-center md:mt-4">
      {isLoggedIn && (
        <>
          <span> Hello, {session.user.name}</span>

          <div className="flex items-center gap-2">
            <ThemeChanger />
            <Button
              onClick={logout}
              className="border dark:border-none bg-white dark:bg-slate-700 dark:text-white shadow-sm px-2 py-0"
            >
              Logout
              <Logout />
            </Button>
          </div>
        </>
      )}

      {!isLoggedIn && (
        <>
          <span className="">Not Logged In</span>
          <div className="flex items-center gap-2">
            <ThemeChanger />
            <Button
              onClick={login}
              className="border dark:border-none bg-white dark:bg-slate-700 dark:text-white shadow-sm px-2 py-0"
            >
              Login
              <Login />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
