import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { signIn, useSession } from "next-auth/react";
import axios from "axios";
import { ClipLoader } from "react-spinners";

export default function FeedbackItem({
  onOpen,
  _id,
  title,
  description,
  votes,
  onVotesChange,
  parentLoadingVotes = true,
}) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isVoteLoading, setIsVoteLoading] = useState(false);
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.email;

  function handleVoteButtonClick(event) {
    event.stopPropagation();
    event.preventDefault();

    /* CHECKING FOR SESSION AND LOGGED IN TO VOTE */
    if (!isLoggedIn) {
      localStorage.setItem("vote_after_login", _id);
      setShowLoginModal(true);
    } else {
      setIsVoteLoading(true);
      axios.post("/api/vote", { feedbackId: _id }).then(() => {
        /* UPDATING VOTE FROM FUNCTION PASSED IN, WILL REFRESH POST FOR VOTES */
        onVotesChange();
        setIsVoteLoading(false);
      });
    }
  }

  async function handleGoogleLoginButtonClick(event) {
    event.stopPropagation();
    event.preventDefault();
    await signIn("google");
  }

  /* FOR LOGGED IN USER VOTE */
  const myVotes = !!votes.find(
    (vote) => vote.userEmail === session?.user?.email
  );

  /* SHORTENING DESCRIPTION */
  const shortDescription = description.substring(0, 200);

  return (
    <a
      href=""
      onClick={(e) => {
        e.preventDefault();
        onOpen();
      }}
      className="flex gap-8 items-center my-8"
      key={title}
    >
      {/* LEFT TITLE AND DESCRIPTION*/}
      <div className="flex-grow">
        <h2 className="font-bold">{title}</h2>
        <p className="text-gray-600 text-sm">
          {shortDescription}
          {shortDescription.length < description.length ? " . . ." : ""}
        </p>
      </div>
      {/* RIGHT VOTE AND LOGIN */}
      <div>
        {/* LOGIN BUTTON LOGIC */}
        {showLoginModal && (
          <Modal
            narrow
            setShow={setShowLoginModal}
            title={"Confirm your vote?"}
          >
            <div className="p-4 flex justify-center">
              <Button
                onClick={handleGoogleLoginButtonClick}
                primary={true}
                className=""
              >
                Login with Google
              </Button>
            </div>
          </Modal>
        )}

        <Button
          onClick={handleVoteButtonClick}
          className={"shadow-md border"}
          primary={myVotes}
        >
          {/* HIDE VOTES WHEN LOADING */}
          {!isVoteLoading && (
            <>
              <span className="triangle-vote-up " />
              {votes?.length || "0"}
            </>
          )}
          {isVoteLoading && <ClipLoader size={24} color="cyan" />}
        </Button>
      </div>
    </a>
  );
}
