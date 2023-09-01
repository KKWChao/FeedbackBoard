import { useState } from "react";
import { ClipLoader, MoonLoader } from "react-spinners";
import axios from "axios";
import Upload from "./icons/Upload";

export default function AttachFilesButton({ onNewFiles }) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleAttachFilesInputChange(event) {
    const files = [...event.target.files];
    const data = new FormData();

    setIsUploading(true);

    for (const file of files) {
      data.append("file", file);
    }

    const res = await axios.post("/api/upload", data);

    onNewFiles(res.data);
    setIsUploading(false);

    async function handleRemoveFileButtonClick(event, link) {
      event.preventDefault();
      /* DELETE REQUEST TO REMOVE FROM BUCKET */
      /* axios.delete('/api/upload', {link}) ... */

      setUploads((currentUploads) => {
        return currentUploads.filter((value) => value !== link);
      });
    }
  }

  return (
    <label
      className={
        "py-2 px-4 text-gray-600 dark:text-gray-200 cursor-pointer flex gap-2 items-center"
      }
    >
      {isUploading && <ClipLoader size={20} color="#cccccc" />}
      {!isUploading && <Upload className="w-4 h-4" />}
      <span
        className={
          isUploading ? "text-gray-300" : "text-gray-600 dark:text-gray-200"
        }
      >
        {isUploading ? "Uploading..." : "Attach Files"}
      </span>
      <input
        onChange={handleAttachFilesInputChange}
        className="hidden"
        type="file"
        multiple={true}
      />
    </label>
  );
}
