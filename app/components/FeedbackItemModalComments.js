import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import CoommentForm from "./CommentForm";
import axios from "axios";
import Attachment from "./Attachment";
import TimeAgo from "timeago-react";
import { useSession } from "next-auth/react";
import AttachFilesButton from "./AttachFilesButton";

export default function FeedbackItemModalComment({ feedbackId }) {
  const [comments, setComments] = useState([]);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [editCommentUploads, setEditCommentUploads] = useState([]);
  const { data: session } = useSession();

  useEffect(() => {
    fetchComments();
  }, []);

  /* QUERY FOR FEEDBACKS WITH CORRESPONDING ID */
  async function fetchComments() {
    await axios
      .get("/api/comment?feedbackId=" + feedbackId)
      .then((response) => {
        setComments(response.data);
      });
  }
  /* EDIT COMMENT */
  function handleEditSpanClick(comment) {
    setEditingComment(comment);
    setEditCommentText(comment.text);
    setEditCommentUploads(comment.uploads);
  }

  /* CANCEL OPTION */
  function handleCancleSpanClick() {
    setEditCommentText("");
    setEditCommentUploads([]);
    setEditingComment(null);
  }

  /* REMOVING FILES FROM COMMENT */
  function handleRemoveFileButtonClick(event, linkToRemove) {
    event.preventDefault();
    setEditCommentUploads((previous) =>
      previous.filter((link) => link !== linkToRemove)
    );
  }

  /* ADDING NEW UPLOADS */
  function handleNewLinks(newLinks) {
    setEditCommentUploads((currentLinks) => [...currentLinks, ...newLinks]);
  }

  /* SAVING EDITED COMMENTS */
  function handleSaveSpanClick() {
    const newData = {
      text: editCommentText,
      uploads: editCommentUploads,
    };
    axios.put("/api/comment", { id: editingComment._id, ...newData });
    setComments((existingComments) => {
      return existingComments.map((comment) => {
        if (comment._id === editingComment._id) {
          return { ...comment, ...newData };
        } else {
          return comment;
        }
      });
    });
    setEditingComment(null);
  }

  return (
    <div className="p-8">
      {comments?.length > 0 &&
        comments.map((comment) => {
          /* CHECK FOR EDITING COMMENT ID */
          const editingCheck =
            editingComment && editingComment?._id === comment._id;
          /* CHECKING AUTHOR */
          const isAuthor =
            !!comment?.user?.email &&
            comment?.user?.email === session?.user?.email;

          return (
            <div className=" mb-8 items-center">
              <div className="flex gap-4">
                <Avatar url={comment.user.image} />
                <div>
                  {/* EDITING MODE */}
                  {editingCheck && (
                    <textarea
                      value={editCommentText}
                      onChange={(event) =>
                        setEditCommentText(event.target.value)
                      }
                      className="border p-2 block w-full h-36"
                    />
                  )}
                  {/* STANDARD MODE */}
                  {!editingCheck && (
                    <p className="text-gray-600 dark:text-gray-200">
                      {comment?.text}
                    </p>
                  )}

                  <div className="text-gray-400 mt-2 text-sm dark:text-gray-300">
                    {comment.user.name} &nbsp; &middot; &nbsp;
                    <TimeAgo datetime={comment.createdAt} locale="en_US" />
                    {/* CHECKING MATCHING USER COMMENT TO EDIT */}
                    {!editingCheck && isAuthor && (
                      <>
                        &nbsp; &middot; &nbsp;
                        <span
                          onClick={() => handleEditSpanClick(comment)}
                          className="hover:underline cursor-pointer"
                        >
                          Edit
                        </span>
                      </>
                    )}
                    {/* EDIT MODE SAVE AND CANCLE SPANS */}
                    {editingCheck && (
                      <>
                        &nbsp; &middot; &nbsp;
                        <span
                          onClick={handleSaveSpanClick}
                          className="hover:underline cursor-pointer"
                        >
                          Save
                        </span>
                        &nbsp; &middot; &nbsp;
                        <span
                          onClick={handleCancleSpanClick}
                          className="hover:underline cursor-pointer"
                        >
                          Cancel
                        </span>
                      </>
                    )}
                  </div>
                  {/* MAP COMMENTS AND CHECK FOR EDIT UPLOADS*/}
                  {(editingCheck ? editCommentUploads : comment?.uploads)
                    ?.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {(editingCheck
                        ? editCommentUploads
                        : comment?.uploads
                      ).map((link) => (
                        <Attachment
                          handleRemoveFileButtonClick={
                            handleRemoveFileButtonClick
                          }
                          link={link}
                          key={link + comment.id}
                          showRemoveAttachment={editingCheck}
                        />
                      ))}
                    </div>
                  )}
                  {/* ATTACH FILES BUTTON */}
                  {editingCheck && (
                    <div className="mt-2">
                      <AttachFilesButton onNewFiles={handleNewLinks} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      {/* DO NOT SHOW WHEN EDITING */}
      {!editingComment && (
        <CoommentForm feedbackId={feedbackId} onPost={fetchComments} />
      )}
    </div>
  );
}
