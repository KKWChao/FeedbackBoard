import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { Vote } from "@/app/models/Vote";
import { Feedback } from "@/app/models/Feedback";

/* FUNCTION FOR COUNTING AND MODIFYING VOTES */
async function updateVotes(feedbackId) {
  const count = await Vote.countDocuments({ feedbackId });
  await Feedback.updateOne(
    { _id: feedbackId },
    {
      voteCountCache: count,
    }
  );
}

export async function GET(request) {
  /* GETTING URLS */
  const url = new URL(request.url);
  try {
    /* GETTING FEEDCBACK ITEMS PER QUERY */
    if (url.searchParams.get("feedbackIds")) {
      /* CREATING ARRAY OF IDS FOR SEARCH */
      const feedbackIds = url.searchParams.get("feedbackIds").split(",");
      const votesDocs = await Vote.find({ feedbackId: feedbackIds });
      return new Response(JSON.stringify(votesDocs), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error fetching votes" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request) {
  const jsonBody = await request.json();
  const { feedbackId } = jsonBody;
  mongoose.connect(process.env.NEXT_PUBLIC_MONGO_URI);
  /* SETTING UP SESSION FOR EACH USER */
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    /* GETTING USER EMAIL FOR VOTE SCHEMA */
    const { email: userEmail } = session.user;
    /* CREATING VOTE && CHECKING FOR EXISTING VOTE */
    const existingVote = await Vote.findOne({ feedbackId, userEmail });

    if (existingVote) {
      await Vote.findByIdAndDelete(existingVote._id);
      await updateVotes(feedbackId);
      return new Response(JSON.stringify(existingVote), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const voteDoc = await Vote.create({ feedbackId, userEmail });
      await updateVotes(feedbackId);
      return new Response(JSON.stringify(voteDoc), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error processing vote" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
