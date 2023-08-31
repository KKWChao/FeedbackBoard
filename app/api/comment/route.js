import mongoose from "mongoose";
import { Comment } from "@/app/models/Comment";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
  mongoose.connect(process.env.NEXT_PUBLIC_MONGO_URI);

  /* QUERY FOR GET REQUEST  */
  const url = new URL(request.url);

  if (url.searchParams.get("feedbackId")) {
    try {
      const result = await Comment.find({
        feedbackId: url.searchParams.get("feedbackId"),
      }).populate("user");
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ message: "Error fetching comments" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  return new Response(JSON.stringify(false), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request) {
  mongoose.connect(process.env.NEXT_PUBLIC_MONGO_URI);
  const jsonBody = await request.json();

  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const commentDoc = await Comment.create({
      text: jsonBody.text,
      uploads: jsonBody.uploads,
      userEmail: session.user.email,
      feedbackId: jsonBody.feedbackId,
    });
    return new Response(JSON.stringify(commentDoc), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error creating comment" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(request) {
  mongoose.connect(process.env.NEXT_PUBLIC_MONGO_URI);
  const jsonBody = await request.json();

  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { id, text, uploads } = jsonBody;

  try {
    const updatedCommentDoc = await Comment.findOneAndUpdate(
      { userEmail: session.user.email, _id: id },
      {
        text,
        uploads,
      }
    );
    if (!updatedCommentDoc) {
      return new Response(JSON.stringify({ message: "Comment not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(updatedCommentDoc), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error updating comment" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
