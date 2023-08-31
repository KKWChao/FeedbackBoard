import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

import { Feedback } from "@/app/models/Feedback";
import { Comment } from "@/app/models/Comment";

export async function GET(request) {
  const url = new URL(request.url);
  mongoose.connect(process.env.NEXT_PUBLIC_MONGO_URI);

  try {
    if (url.searchParams.get("id")) {
      const feedback = await Feedback.findById(url.searchParams.get("id"));
      if (!feedback) {
        return new Response(JSON.stringify({ message: "Feedback not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(feedback), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      /* SORTING PARAM */
      const sortParam = url.searchParams.get("sort");

      /* PAGINATION PARAM */
      const loadedRows = url.searchParams.get("loadedRows");

      /* SEARCH PARAM */
      const searchPhrase = url.searchParams.get("search");

      let sortDef;

      if (sortParam === "votes") {
        sortDef = { voteCountCache: -1 };
      }
      if (sortParam === "latest") {
        sortDef = { createdAt: -1 };
      }
      if (sortParam === "oldest") {
        sortDef = { createdAt: 1 };
      }

      /* SEARCH LOGIC FOR PHRASES IN FEEDBACK, DESCRIPTION, COMMENTS*/
      let filter = null;
      if (searchPhrase) {
        const comments = await Comment.find(
          { text: { $regex: ".*" + searchPhrase + ".*" } },
          "feedbackId",
          {
            limit: 10,
          }
        );
        filter = {
          $or: [
            { title: { $regex: ".*" + searchPhrase + ".*" } },
            { description: { $regex: ".*" + searchPhrase + ".*" } },
            { _id: comments.map((comment) => comment.feedbackId) },
          ],
        };
      }
      /* FILTERING FOR PAGINATION */
      const feedbackList = await Feedback.find(filter, null, {
        sort: sortDef,
        skip: loadedRows,
        limit: 10,
      }).populate("user");
      return new Response(JSON.stringify(feedbackList), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error fetching feedback" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(request) {
  const jsonBody = await request.json();
  const { title, description, uploads } = jsonBody;
  mongoose.connect(process.env.NEXT_PUBLIC_MONGO_URI);

  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const userEmail = session.user.email;
    const feedbackDoc = await Feedback.create({
      title,
      description,
      uploads,
      userEmail,
    });
    return new Response(JSON.stringify(feedbackDoc), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error creating feedback" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(request) {
  const jsonBody = await request.json();
  const { id, title, description, uploads } = jsonBody;

  const mongoUrl = process.env.NEXT_PUBLIC_MONGO_URI;
  mongoose.connect(mongoUrl);

  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const updatedFeedbackDoc = await Feedback.updateOne(
      { _id: id, userEmail: session?.user?.email },
      {
        title: title,
        description: description,
        uploads: uploads,
      }
    );

    return new Response(JSON.stringify(updatedFeedbackDoc), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error updating feedback" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
