import mongoose from "mongoose";
import { Comment } from "@/app/models/Comment";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
  mongoose.connect(process.env.NEXT_PUBLIC_MONGO_URI);

  /* QUERY FOR GET REQUEST  */
  const url = new URL(request.url);

  if (url.searchParams.get("feedbackId")) {
    const result = await Comment.find({
      feedbackId: url.searchParams.get("feedbackId"),
    }).populate("user");

    return Response.json(
      result
      // /* REMOVING USER EMAILS FROM GET REQUEST (unused because needed to match user to edit comments)*/
      // result.map((doc) => {
      //   const { userEmail, ...commentWithoutEmail } = doc.toJSON();
      //   const { email, ...userWithoutEmail } = commentWithoutEmail.user;
      //   commentWithoutEmail.user = userWithoutEmail;
      //   return commentWithoutEmail;
      // })
    );
  }
  return Response.json(false);
}

export async function POST(request) {
  mongoose.connect(process.env.NEXT_PUBLIC_MONGO_URI);
  const jsonBody = await request.json();

  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json(false);
  }

  const commentDoc = await Comment.create({
    text: jsonBody.text,
    uploads: jsonBody.uploads,
    userEmail: session.user.email,
    feedbackId: jsonBody.feedbackId,
  });

  return Response.json(commentDoc);
}

export async function PUT(request) {
  mongoose.connect(process.env.NEXT_PUBLIC_MONGO_URI);
  const jsonBody = await request.json();

  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json(false);
  }
  const { id, text, uploads } = jsonBody;

  const updatedCommentDoc = await Comment.findOneAndUpdate(
    { userEmail: session.user.email, _id: id },
    {
      text,
      uploads,
    }
  );

  return Response.json(updatedCommentDoc);
}
