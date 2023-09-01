import BackArrow from "./icons/BackArrow";
import ExitX from "./icons/ExitX";

export default function Modal({ setShow, children, title, narrow }) {
  function close(event) {
    event.stopPropagation();
    event.preventDefault();
    setShow(false);
  }

  return (
    <div
      className="fixed inset-0 bg-white md:bg-black md:bg-opacity-80 flex md:items-center"
      onClick={close}
    >
      {/* CLOSE BUTTON */}
      <button
        className={"hidden md:block fixed top-4 right-4 text-white"}
        onClick={close}
      >
        <ExitX />
      </button>
      {/* MODAL */}
      <div className="w-full h-full overflow-y-scroll">
        <div
          className={
            (narrow ? "md:max-w-sm" : "md:max-w-2xl") +
            " bg-white dark:bg-gray-600 md:mx-auto md:rounded-lg overflow-hidden md:my-8"
          }
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative min-h-[60px] md:min-h-0">
            {/* MOBILE CLOSE BUTTON */}
            <button
              className="md:hidden absolute top-4 left-4 text-gray-600 dark:text-gray-200"
              onClick={close}
            >
              <BackArrow />
            </button>
            {!!title && <h2 className="py-4 text-center border-b">{title}</h2>}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
