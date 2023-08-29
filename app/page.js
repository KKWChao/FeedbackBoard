"use client";

import { SessionProvider } from "next-auth/react";
import FeedbackBoard from "./components/FeedbackBoard";
import Header from "./components/Header";

export default function Home() {
  return (
    <SessionProvider>
      <Header />
      <FeedbackBoard />
    </SessionProvider>
  );
}
