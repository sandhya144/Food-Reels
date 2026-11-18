
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Home.css';
import Brand from '../../components/Brand';
import { useNavigate } from 'react-router-dom';

interface Reel {
   _id: string;
  video: string;
  name: string;
  description: string;
  foodPartner: {
    _id: string;
    businessname: string;
  } | null;
}

const Home = () => {
  const feedRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const navigate = useNavigate();

  const [reels, setReels] = useState<Reel[]>([]);
  const [activeReel, setActiveReel] = useState(0);
  const [blockedReel, setBlockedReel] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [savedReels, setSavedReels] = useState<Record<string, boolean>>({});
  const [commentsByReel, setCommentsByReel] = useState<Record<string, string[]>>({});
  const [commentReelId, setCommentReelId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [shareFeedback, setShareFeedback] = useState<{
    reelId: string;
    message: string;
  } | null>(null);

  // 1. Fetch reels from backend
  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await axios.get(
          'http://localhost:3000/api/food',{withCredentials: true}
        );

        // Supports either an array or { foods: [...] }
        const fetchedReels: Reel[] = Array.isArray(response.data)
          ? response.data
          : response.data.foodItems ?? [];

        setReels(fetchedReels);
      } catch (err) {
        console.error('Error fetching reels:', err);
        setError('Unable to load food reels. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  // 2. Detect which reel is currently visible
  useEffect(() => {
    const feed = feedRef.current;

    if (!feed || reels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(
              (entry.target as HTMLVideoElement).dataset.reelIndex
            );

            setActiveReel(index);
            setBlockedReel(null);
          }
        });
      },
      {
        root: feed,
        threshold: 0.65,
      }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [reels]);

  // 3. Play the active reel and pause the others
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      if (index === activeReel && commentReelId === null) {
        void video.play().catch(() => {
          setBlockedReel(index);
        });
      } else {
        video.pause();
      }
    });
  }, [activeReel, commentReelId, reels]);

  // 4. Play video when user clicks the play button
  const playReel = (index: number) => {
    const video = videoRefs.current[index];

    if (video) {
      void video.play().then(() => {
        setBlockedReel(null);
      }).catch(() => {
        setBlockedReel(index);
      });
    }
  };

  const shareReel = async (reel: Reel) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: reel.name,
          text: reel.description,
          url: reel.video,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(reel.video);
        setShareFeedback({
          reelId: reel._id,
          message: 'Video link copied to clipboard.',
        });
      } else {
        setShareFeedback({
          reelId: reel._id,
          message: 'Sharing is not supported on this device.',
        });
      }
    } catch (shareError) {
      if (shareError instanceof Error && shareError.name === 'AbortError') {
        return;
      }
      setShareFeedback({
        reelId: reel._id,
        message: 'Could not share this video. Please try again.',
      });
    }
  };

  const submitComment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const comment = commentDraft.trim();

    if (!comment || !commentReelId) return;

    setCommentsByReel((currentComments) => ({
      ...currentComments,
      [commentReelId]: [...(currentComments[commentReelId] ?? []), comment],
    }));
    setCommentDraft('');
  };

  return (
    <main className="reels-home">

      <header className="reels-header">
        <Brand className="reels-brand" to="/" />

        <span className="reels-header__label">
          A taste of somewhere good
        </span>

        <Link
          className="reels-header__account"
          to="/food-partner/login"
        >
          Partner Login
        </Link>
      </header>

      {loading && (
        <div className="reels-message">
          Loading food reels...
        </div>
      )}

      {!loading && error && (
        <div className="reels-message">
          {error}
        </div>
      )}

      {!loading && !error && reels.length === 0 && (
        <div className="reels-message">
          No food reels available yet.
        </div>
      )}

      {!loading && !error && reels.length > 0 && (
        <>
          <div
            className="reels-feed"
            ref={feedRef}
            aria-label="Food videos"
          >
            {reels.map((reel, index) => (
              <article className="reel" key={reel._id}>

                <video
                  ref={(element) => {
                    videoRefs.current[index] = element;
                  }}
                  className="reel__video"
                  src={reel.video}
                  data-reel-index={index}
                  muted
                  loop
                  playsInline
                  preload={index === 0 ? 'auto' : 'metadata'}
                  aria-label={`Video from ${reel.foodPartner?.businessname}`}
                />

                <div
                  className="reel__shade"
                  aria-hidden="true"
                />

                <nav className="reel__actions" aria-label={`${reel.name} actions`}>
                  <button
                    className={`reel__action${likedReels[reel._id] ? ' reel__action--active' : ''}`}
                    type="button"
                    aria-label={likedReels[reel._id] ? 'Unlike reel' : 'Like reel'}
                    aria-pressed={Boolean(likedReels[reel._id])}
                    onClick={() =>
                      setLikedReels((currentLikes) => ({
                        ...currentLikes,
                        [reel._id]: !currentLikes[reel._id],
                      }))
                    }
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
                    </svg>
                    <span className="reel__action-label">Like</span>
                    <span className="reel__action-count">
                      {likedReels[reel._id] ? 1 : 0}
                    </span>
                  </button>

                  <button
                    className="reel__action"
                    type="button"
                    aria-label={`View ${commentsByReel[reel._id]?.length ?? 0} comments`}
                    onClick={() => {
                      setCommentDraft('');
                      setCommentReelId(reel._id);
                    }}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.5 11.5a8.4 8.4 0 0 1-8.5 8.2 9 9 0 0 1-3.8-.8L3 20l1.2-4.1A8 8 0 0 1 3.5 12 8.4 8.4 0 0 1 12 3.8a8.4 8.4 0 0 1 8.5 7.7Z" />
                    </svg>
                    <span className="reel__action-label">Comment</span>
                    <span className="reel__action-count">
                      {commentsByReel[reel._id]?.length ?? 0}
                    </span>
                  </button>

                  <button
                    className="reel__action"
                    type="button"
                    aria-label={`Share ${reel.name}`}
                    onClick={() => void shareReel(reel)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6" />
                    </svg>
                    <span className="reel__action-label">Share</span>
                  </button>

                  <button
                    className={`reel__action${savedReels[reel._id] ? ' reel__action--active' : ''}`}
                    type="button"
                    aria-label={savedReels[reel._id] ? 'Unsave reel' : 'Save reel'}
                    aria-pressed={Boolean(savedReels[reel._id])}
                    onClick={() =>
                      setSavedReels((currentSaved) => ({
                        ...currentSaved,
                        [reel._id]: !currentSaved[reel._id],
                      }))
                    }
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4V4.8Z" />
                    </svg>
                    <span className="reel__action-label">
                      {savedReels[reel._id] ? 'Saved' : 'Save'}
                    </span>
                  </button>
                </nav>

                {shareFeedback?.reelId === reel._id && (
                  <div className="reel__share-feedback" role="status" aria-live="polite">
                    {shareFeedback.message}
                  </div>
                )}

                {commentReelId === reel._id && (
                  <div className="reel__comments-overlay">
                    <section
                      className="reel__comments-panel"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby={`comments-title-${reel._id}`}
                    >
                      <header className="reel__comments-header">
                        <h2 id={`comments-title-${reel._id}`}>
                          Comments ({commentsByReel[reel._id]?.length ?? 0})
                        </h2>
                        <button
                          type="button"
                          className="reel__comments-close"
                          aria-label="Close comments"
                          onClick={() => setCommentReelId(null)}
                        >
                          ×
                        </button>
                      </header>

                      <div className="reel__comments-list">
                        {(commentsByReel[reel._id] ?? []).length === 0 ? (
                          <p className="reel__comments-empty">
                            No comments yet. Start the conversation.
                          </p>
                        ) : (
                          (commentsByReel[reel._id] ?? []).map((comment, commentIndex) => (
                            <p className="reel__comment" key={`${reel._id}-${commentIndex}`}>
                              <strong>You</strong>
                              {comment}
                            </p>
                          ))
                        )}
                      </div>

                      <form className="reel__comment-form" onSubmit={submitComment}>
                        <input
                          aria-label="Write a comment"
                          placeholder="Add a comment..."
                          value={commentDraft}
                          onChange={(event) => setCommentDraft(event.target.value)}
                          maxLength={500}
                          required
                        />
                        <button type="submit" disabled={!commentDraft.trim()}>
                          Post
                        </button>
                      </form>
                    </section>
                  </div>
                )}

                {blockedReel === index && (
                  <button
                    className="reel__play"
                    type="button"
                    onClick={() => playReel(index)}
                    aria-label="Play video"
                  >
                    <span aria-hidden="true">▶</span>
                    <span>Tap to play</span>
                  </button>
                )}

                <div className="reel__content">
                  <span className="reel__eyebrow">
                    From a local favorite
                  </span>

                  <h2 className="reel__store">
                    {reel.name}
                  </h2>

                  <p className="reel__description">
                    {reel.description}
                  </p>
                   
                  <button
                    className="reel__visit"
                    type="button"
                    onClick={() => {
                        const partnerId =
                        typeof reel.foodPartner === 'string'
                            ? reel.foodPartner
                            : reel.foodPartner?._id;

                        console.log("Navigating to partner:", partnerId);

                        if (!partnerId) {
                        console.error("Food partner ID is missing!");
                        return;
                        }

                        navigate(`/food-partner/${partnerId}`);
                    }}
                    >
                    Visit store
                    <span aria-hidden="true">↗</span>
                    </button>
                   
                </div>

                <span
                  className="reel__position"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, '0')}
                  {' '}
                  <span>/</span>
                  {' '}
                  {String(reels.length).padStart(2, '0')}
                </span>

              </article>
            ))}
          </div>

          <span className="reels-scroll-hint" aria-hidden="true">
            <span>Scroll to explore</span>
            <span className="reels-scroll-hint__line" />
          </span>
        </>
      )}

    </main>
  );
};

export default Home;

