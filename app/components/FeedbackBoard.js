import { useEffect, useRef, useState } from "react";
import FeedbackItem from "./FeedbackItem";
import FeedbackFormModal from "./FeedbackFormModal";
import Button from "./Button";
import FeedbackItemModal from "./FeedbackItemModal";
import axios from "axios";
import { useSession } from "next-auth/react";
import { ClipLoader } from "react-spinners";
import Search from "./icons/Search";
import { debounce } from "lodash";

export default function FeedbackBoard() {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showFeedbackModalItem, setShowFeedbackModalItem] = useState(null);

  const [feedbacks, setFeedbacks] = useState([]);
  const [fetchingFeedback, setFetchingFeedback] = useState(false);
  const fetchingFeedbackRef = useRef(false);

  const [votes, setVotes] = useState([]);
  const [votesLoading, setVotesLoading] = useState(false);

  const [sort, setSort] = useState("votes");
  const sortRef = useRef("votes");

  const [searchPhrase, setSearchPhrase] = useState("");
  const searchPhraseRef = useRef("");

  const loadedRowsRef = useRef(0);
  const finishLoadRef = useRef(false);
  const debouncedFetchFeedbackRef = useRef(debounce(fetchFeedbacks, 1000));

  const [waiting, setWaiting] = useState(false);
  const waitingRef = useRef();

  const { data: session } = useSession(false);

  /* GETTING FEEDBACK FROM SERVER */
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    fetchVotes();
  }, [feedbacks]);

  /* SORTING AND SEARCHING*/
  useEffect(() => {
    loadedRowsRef.current = 0;
    sortRef.current = sort;

    finishLoadRef.current = false;
    searchPhraseRef.current = searchPhrase;

    if (feedbacks?.length > 0) {
      setFeedbacks([]);
    }

    setWaiting(true);
    waitingRef.current = true;

    debouncedFetchFeedbackRef.current();
  }, [sort, searchPhrase]);

  /* SCROLL TRACKING FUNCTION FOR PAGINATION */
  useEffect(() => {
    registerScrollListener();
    return () => {
      unregisterScrollListener();
    };
  }, []);

  /* SCROLL LOGIC FOR LOADING POSTS AT END */
  function handleScroll() {
    const html = window.document.querySelector("html");
    const scrolled = html.scrollTop;
    const scrollTotal = html.scrollHeight;
    const scrollLeft = scrollTotal - scrolled - html.clientHeight;

    if (scrollLeft <= 100) {
      fetchFeedbacks((append = true));
    }
  }

  function registerScrollListener() {
    window.addEventListener("scroll", handleScroll);
  }
  function unregisterScrollListener() {
    window.removeEventListener("scroll", handleScroll);
  }

  /* FETCHING FEEDBACK W/ SORT */
  async function fetchFeedbacks(append = false) {
    if (fetchingFeedbackRef.current) return;
    if (finishLoadRef.current) return;

    fetchingFeedbackRef.current = true;
    setFetchingFeedback(true);

    axios
      .get(
        `/api/feedback?sort=${sortRef.current}&loadedRows=${loadedRowsRef.current}&search=${searchPhraseRef.current}`
      )
      .then((response) => {
        /* APPENDING FEEDBACKS TO CURRENT FEEDBACKS AFTER FETCHING FOR PAGINATION */
        if ((append = true)) {
          setFeedbacks((currentFeedback) => [
            ...currentFeedback,
            ...response.data,
          ]);
        } else {
          setFeedbacks(response.data);
        }

        /* GETTING LAST ITEM FOR PAGINATION CONDITION FOR LAST ITEM */
        if (response.data?.length > 0) {
          loadedRowsRef.current += response.data.length;
        } else if (response.data?.length === 0) {
          finishLoadRef.current = true;
        }

        fetchingFeedbackRef.current = false;
        setFetchingFeedback(false);

        waitingRef.current = false;
        setWaiting(false);
      });
  }

  /* LOGIN FUNCTION WITH VOTE + POST + COMMENT INFO SAVED TO LOCAL STORAGE */
  useEffect(() => {
    /* CHECKING FOR CURRENT LOGIN */
    if (session?.user?.email) {
      const feedbackToVote = localStorage.getItem("vote_after_login");
      if (feedbackToVote) {
        /* API REQUEST TO SAVE THE VOTE */
        axios.post("/api/vote", { feedbackId: feedbackToVote }).then(() => {
          /* REMOVE FROM LOCAL STORAGE */
          localStorage.removeItem("vote_after_login");
          fetchVotes();
        });
      }
    }

    /* SAVING FEEDBACK PRIOR TO LOGGING IN THEN POST AFTER LOGIN */
    const feedbackToPost = localStorage.getItem("post_after_login");
    if (feedbackToPost) {
      const feedbackData = JSON.parse(feedbackToPost);
      axios.post("/api/feedback", feedbackData).then(async (response) => {
        localStorage.removeItem("post_after_login");
        await fetchFeedbacks();
        setShowFeedbackModalItem(response.data);
        localStorage.removeItem("post_after_login");
      });
    }

    /* SAVING COMMENT PRIOR TO LOGGING IN THEN POST AFTER LOGIN */
    const commentToPost = localStorage.getItem("comment_after_login");
    if (commentToPost) {
      const commentData = JSON.parse(commentToPost);
      axios.post("/api/comment", commentData).then(() => {
        axios
          .get("/api/feedback?id=" + commentData.feedbackId)
          .then((response) => {
            setShowFeedbackModalItem(response.data);
            localStorage.removeItem("comment_after_login");
          });
      });
    }
  }, [session?.user?.email]);

  function openFeedbackModal() {
    setShowFeedbackModal(true);
  }

  function openFeedbackModalItem(feedback) {
    setShowFeedbackModalItem(feedback);
  }

  /* PAGE UPDATE AFTER FEEDBACK UPDATE */
  async function fetchVotes() {
    setVotesLoading(true);
    const ids = feedbacks.map((item) => item._id); // id search param for query
    const response = await axios.get("/api/vote?feedbackIds=" + ids.join(","));
    setVotes(response.data);
    setVotesLoading(false);
  }

  /* UPDATE FEEDBACKS AFTER EDITING */
  async function handleFeedbackUpdate(updatedData) {
    setShowFeedbackModalItem((previousData) => {
      return { ...previousData, ...updatedData };
    });
    await fetchFeedbacks();
  }

  return (
    <main className="bg-white md:max-w-2xl mx-auto md:shadow-lg md:rounded-lg md:mt-4 md:mb-8 overflow-hidden">
      {/* HERO */}
      <div className="bg-gradient-to-r from-cyan-400 to-blue-400 p-8">
        <h1 className="font-bold text-xl">Kelvin's Feedback</h1>
        <p className="text-opacity-90 text-slate-700">
          Help me decide what should I build or how can I improve?
        </p>
      </div>
      {/* OPTIONS BAR */}
      <div className="bg-gray-100 md:px-8 px-4 py-4 flex border-b items-center justify-around">
        <div className="md:grow flex items-center gap-4 mr-2">
          {/* FILTER OPTIONS */}
          <select
            className="bg-transparent py-2 text-gray-400"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
            }}
            name=""
            id=""
          >
            <option value="votes">Upvotes</option>
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>

          {/* SEARCH OPTION */}
          <div className="relative">
            <Search className="w-6 h-6 text-gray-500 absolute top-2 left-2 pointer-events-none" />
            <input
              className=" bg-transparent p-2 pl-9 rounded-md text-gray-400 w-full "
              type="text"
              placeholder="Search"
              value={searchPhrase}
              onChange={(event) => setSearchPhrase(event.target.value)}
            />
          </div>
        </div>

        {/* SUGGESTION BUTTON */}
        <div>
          <Button primary={"true"} onClick={openFeedbackModal} className="">
            Make a Suggestion
          </Button>
        </div>
      </div>

      <div className="px-8">
        {/* IF NO RESULT */}
        {feedbacks?.length === 0 && !fetchingFeedback && !waiting && (
          <div className="p-8 text-center text-4xl text-gray-400">
            Nothing Found :(
          </div>
        )}
        {/* MAPPING FEEDBACK  */}
        {feedbacks?.map((feedback) => (
          <FeedbackItem
            key={feedback._id}
            {...feedback}
            votes={votes.filter(
              (vote) => vote.feedbackId.toString() === feedback._id.toString()
            )}
            onOpen={() => openFeedbackModalItem(feedback)}
            onVotesChange={() => fetchVotes()}
            parentLoadingVotes={votesLoading}
          />
        ))}

        {/* LOADER FOR FETCHING ON SCROLL */}
        {(fetchingFeedback || waiting) && (
          <div className="flex py-4 justify-center w-full">
            <ClipLoader size={24} />
          </div>
        )}
      </div>
      {/* MODAL SHOW */}
      {/* CREATING FEEDBACK MODAL */}
      {showFeedbackModal && (
        <FeedbackFormModal
          onCreate={fetchFeedbacks}
          setShow={setShowFeedbackModal}
        />
      )}

      {/* OPENING FEEDBACK MODAL FOR OPTION */}
      {showFeedbackModalItem && (
        <FeedbackItemModal
          {...showFeedbackModalItem}
          votes={votes.filter(
            (vote) => vote.feedbackId.toString() === showFeedbackModalItem._id
          )}
          setShow={setShowFeedbackModalItem}
          onVotesChange={fetchVotes}
          onUpdate={handleFeedbackUpdate}
        />
      )}
    </main>
  );
}
