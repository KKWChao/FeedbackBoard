import axios from "axios";
import Button from "./Button";
import FeedbackItemModalComment from "./FeedbackItemModalComments";
import Modal from "./Modal";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { useSession } from "next-auth/react";
import Tick from "./icons/Tick";
import Attachment from "./Attachment";
import Edit from "./icons/Edit";
import AttachFilesButton from "./AttachFilesButton";
import Trash from "./icons/Trash";

export default function FeedbackItemModal({
  _id,
  title,
  description,
  votes,
  setShow,
  onVotesChange,
  uploads,
  user,
  onUpdate,
}) {
  const [isVotesLoading, setIsVotesLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description);
  const [editUploads, setEditUploads] = useState(uploads);

  const { data: session } = useSession();
  const myVote = votes.find((vote) => vote.userEmail === session?.user?.email);

  /* POSTING VOTE */
  async function handleVoteButtonClick() {
    setIsVotesLoading(true);
    await axios.post("/api/vote", { feedbackId: _id }).then(() => {
      onVotesChange();
    });
    setIsVotesLoading(false);
  }

  /* EDIT MODE */
  function handleEditButtonClick() {
    setIsEditing(true);
  }

  /* EXIT EDIT MODE - CANCEL AND CLEAR STATE FUNCTION */
  function handleCancelButtonClick() {
    setIsEditing(false);
    setEditTitle(title);
    setEditDescription(description);
    setEditUploads(uploads);
  }

  /* EDIT MODE: removing images */
  function handleRemoveFileButtonClick(event, linkToRemove) {
    event.preventDefault();
    setEditUploads((previousEditUploads) =>
      previousEditUploads.filter((link) => link !== linkToRemove)
    );
  }

  /* EDIT MODE: adding images to edit */
  function handleEditUploads(newLinks) {
    setEditUploads((previousUploads) => [...previousUploads, ...newLinks]);
  }

  /* EDIT MODE: saving edited info */
  /* passing info back to board */
  function handleSaveButtonClick() {
    axios
      .put("/api/feedback", {
        id: _id,
        title: editTitle,
        description: editDescription,
        uploads: editUploads,
      })
      .then(() => {
        setIsEditing(false);
        onUpdate({
          title: editTitle,
          description: editDescription,
          uploads: editUploads,
        });
      });
  }

  return (
    <Modal title={""} setShow={setShow}>
      <div className="p-8 pb-2">
        {/* EDIT TITLE */}
        {isEditing && (
          <input
            value={editTitle}
            className="block w-full border rounded-md mb-2 p-2"
            onChange={(event) => setEditTitle(event.target.value)}
          />
        )}
        {/* NON EDIT MODE */}
        {!isEditing && <h2 className="text-lg font-bold mb-2">{title}</h2>}
        {/* EDIT TEXT */}
        {isEditing && (
          <textarea
            value={editDescription}
            className="border w-full block rounded-md mb-2 p-2 h-36"
            onChange={(event) => setEditDescription(event.target.value)}
          />
        )}

        {/* NON EDIT MODE */}
        {!isEditing && (
          <p
            className="text-gray-600"
            dangerouslySetInnerHTML={{
              __html: description.replace(/\n/gi, "<br />"),
            }}
          />
        )}

        {/* SHOWING UPLOADS */}
        {uploads?.length > 0 && (
          <div className="mt-4">
            <span className="text-sm text-gray-600">Attachments:</span>
            <div className="flex gap-2 mt-2">
              {(isEditing ? editUploads : uploads).map((link) => (
                <Attachment
                  key={link + _id}
                  link={link}
                  showRemoveAttachment={isEditing}
                  handleRemoveFileButtonClick={handleRemoveFileButtonClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 justify-end border-b px-8 py-2">
        {/* CHECK EDIT MODE FOR BUTTONS */}
        {isEditing && (
          <>
            <Button primary={"true"} onClick={handleSaveButtonClick}>
              Save
            </Button>
            <AttachFilesButton onNewFiles={handleEditUploads} />
            <Button onClick={handleCancelButtonClick}>
              <Trash className="w-4 h-4" />
              Cancel
            </Button>
          </>
        )}
        {/* CHECK FOR SESSION */}
        {/* EDIT BUTTON */}
        {!isEditing && user?.email && session?.user?.email === user?.email && (
          <Button onClick={handleEditButtonClick}>
            <Edit className="w-4 h-4" />
            Edit
          </Button>
        )}
        {/* HIDDEN IF EDITING */}
        {!isEditing && (
          <Button primary={"true"} onClick={handleVoteButtonClick}>
            {/* LOADING AND MY VOTES LOGIC */}
            {isVotesLoading && <ClipLoader size={20} color="cyan" />}
            {!isVotesLoading && (
              <>
                {myVote && (
                  <>
                    <Tick className="w-4 h-4" />
                    Upvoted {votes?.length || "0"}
                  </>
                )}
                {!myVote && (
                  <>
                    <span className="triangle-vote-up" />
                    Upvote {votes?.length || "0"}
                  </>
                )}
              </>
            )}
          </Button>
        )}
      </div>
      <div>
        <FeedbackItemModalComment feedbackId={_id} />
      </div>
    </Modal>
  );
}
