"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Button from "./Button";
import Logout from "./icons/Logout";
import Login from "./icons/Login";

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
    <div className="max-w-2xl mx-auto justify-between flex p-2 gap-4 items-center">
      {isLoggedIn && (
        <>
          <span> Hello, {session.user.name}</span>
          <Button
            onClick={logout}
            className="border bg-white shadow-sm px-2 py-0"
          >
            Logout
            <Logout />
          </Button>
        </>
      )}
      {!isLoggedIn && (
        <>
          <span>Not Logged In</span>
          <Button
            onClick={login}
            className="border bg-white shadow-sm px-2 py-0"
          >
            Login
            <Login />
          </Button>
        </>
      )}
    </div>
  );
}
