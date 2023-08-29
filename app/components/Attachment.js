import PaperClip from "./icons/PaperClip";
import Trash from "./icons/Trash";

export default function Attachment({
  link,
  showRemoveAttachment = false,
  handleRemoveFileButtonClick,
}) {
  return (
    <a
      key={"upload" + link}
      className="h-16 relative"
      href={link}
      target="_blank"
    >
      {showRemoveAttachment && (
        <button
          className="-right-2 -top-2 absolute bg-red-400 rounded-full p-1 text-white"
          onClick={(event) => handleRemoveFileButtonClick(event, link)}
        >
          <Trash className="w-5 h-5" />
        </button>
      )}
      {/.(jpg|png)$/.test(link) ? (
        <img src={link} alt="" className="h-16 w-16 rounded-md" />
      ) : (
        <div className="bg-gray-200 rounded-md h-16 p-2 flex items-center">
          <PaperClip className="w-4 h-4" />
          {link.split("/")[3].substring(13)}
        </div>
      )}
    </a>
  );
}
