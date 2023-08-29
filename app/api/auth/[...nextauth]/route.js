import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/app/libs/mongoClient";

export const authOptions = {
  secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
