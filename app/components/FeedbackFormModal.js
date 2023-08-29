import Modal from "./Modal";
import Button from "./Button";
import { useState } from "react";
import axios from "axios";

import Attachment from "./Attachment";
import AttachFilesButton from "./AttachFilesButton";
import { signIn, useSession } from "next-auth/react";

export default function FeedbackFormModal({ setShow, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploads, setUploads] = useState([]);

  const { data: session } = useSession();

  async function handleCreatePostButtonClick(event) {
    event.preventDefault();
    /* LOGIN CHECK TO POST */
    if (session) {
      axios
        .post("/api/feedback", {
          title: title,
          description: description,
          uploads: uploads,
        })
        .then(() => {
          setShow(false);
          onCreate();
        });
    } else {
      localStorage.setItem(
        "post_after_login",
        JSON.stringify({ title, description, uploads })
      );
      await signIn("google");
    }
  }

  function addNewUploads(newLinks) {
    setUploads((previousLinks) => [...previousLinks, ...newLinks]);
  }

  return (
    <Modal setShow={setShow} title={"Make a suggestion"}>
      <form className="p-4">
        <label className="block mt-4 mb-1 text-slate-700">Title</label>
        <input
          className="w-full border rounded-md p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          type="text"
          placeholder="A short description"
        />
        <label className="block mt-4 mb-1 text-slate-700">Details</label>
        <textarea
          className="w-full border rounded-md p-2 h-48"
          placeholder="Please include any details"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {/* Upload logic for dipslaying images during post */}
        {uploads?.length > 0 && (
          <div>
            <label className="block mt-2 mb-1 text-slate-700">Files</label>
            <div className="flex gap-2 ">
              {uploads.map((link) => (
                <Attachment
                  key={title + link}
                  link={link}
                  showRemoveAttachment={true}
                  handleRemoveFileButtonClick={(e, link) =>
                    handleRemoveFileButtonClick(e, link)
                  }
                />
              ))}
            </div>
          </div>
        )}
        {/* MODAL BUTTONS */}
        <div className="flex gap-2 mt-2 justify-end">
          <AttachFilesButton onhNewFiles={addNewUploads} />
          <Button primary={true} onClick={handleCreatePostButtonClick}>
            {session ? "Create Post" : "Login and Post"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
