import { useState } from "react";
import Button from "./Button";
import AttachFilesButton from "./AttachFilesButton";
import Attachment from "./Attachment";
import axios from "axios";
import { signIn, useSession } from "next-auth/react";

export default function CoommentForm({ feedbackId, onPost }) {
  const [commentText, setCommentText] = useState("");
  const [uploads, setUploads] = useState([]);
  const { data: session } = useSession();

  function addUploads(newLinks) {
    setUploads((previousLinks) => [...previousLinks, ...newLinks]);
  }
  /* REMOVING IMAGE UPLOAD  */
  function removeUpload(event, linkToRemove) {
    event.preventDefault();
    event.stopPropagation();
    setUploads((previousLinks) =>
      previousLinks.filter((link) => link !== linkToRemove)
    );
  }

  /* POSTING COMMENT TO DATABASE */
  async function handleCommentButtonClick(event) {
    event.preventDefault();

    const commentData = {
      text: commentText,
      uploads: uploads,
      feedbackId: feedbackId,
    };

    if (session) {
      await axios.post("/api/comment", commentData);

      setCommentText("");
      setUploads([]);
      onPost();
    } else {
      localStorage.setItem("comment_after_login", JSON.stringify(commentData));
      await signIn("google");
    }
  }

  return (
    <form>
      <textarea
        className="border rounded-md w-full p-2"
        placeholder="Let us know what you think..."
        name=""
        id=""
        cols=""
        rows=""
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
      />
      {uploads.length > 0 && (
        <div className="">
          <div className="text-sm text-gray-600 mb-2 mt-4 dark:text-gray-200">
            Files:
          </div>
          <div className="flex gap-3">
            {uploads.map((link) => (
              <div>
                <Attachment
                  link={link}
                  showRemoveAttachment={true}
                  handleRemoveFileButtonClick={(event, link) =>
                    removeUpload(event, link)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2 mt-2">
        <AttachFilesButton onNewFiles={addUploads} />
        <Button
          primary={"true"}
          disabled={commentText === ""}
          onClick={handleCommentButtonClick}
        >
          {session ? "Comment" : "Login and Comment"}
        </Button>
      </div>
    </form>
  );
}
