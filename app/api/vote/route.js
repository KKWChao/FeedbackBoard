import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { Vote } from "@/app/models/Vote";
import { Feedback } from "@/app/models/Feedback";

/* COUNTING AND MODIFYING VOTES */
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
  /* GETTING FEEDCBACK ITEMS PER QUERY */
  if (url.searchParams.get("feedbackIds")) {
    /* CREATING ARRAY OF IDS FOR SEARCH */
    const feedbackIds = url.searchParams.get("feedbackIds").split(",");
    const votesDocs = await Vote.find({ feedbackId: feedbackIds });
    return Response.json(votesDocs);
  }

  return Response.json([]);
}

export async function POST(request) {
  mongoose.connect(process.env.NEXT_PUBLIC_MONGO_URI);
  const jsonBody = await request.json();

  const { feedbackId } = jsonBody;

  /* SETTING UP SESSION FOR EACH USER */
  const session = await getServerSession(authOptions);

  /* GETTING USER EMAIL FOR VOTE SCHEMA */
  const { email: userEmail } = session.user;

  /* CREATING VOTE && CHECKING FOR EXISTING VOTE */
  const existingVote = await Vote.findOne({ feedbackId, userEmail });

  if (existingVote) {
    await Vote.findByIdAndDelete(existingVote._id);
    await updateVotes(feedbackId);
    return Response.json(existingVote);
  } else {
    const voteDoc = await Vote.create({ feedbackId, userEmail });
    await updateVotes(feedbackId);
    return Response.json(voteDoc);
  }
}
