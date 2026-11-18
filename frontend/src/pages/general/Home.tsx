
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
    bussinessname: string;
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

      if (index === activeReel) {
        void video.play().catch(() => {
          setBlockedReel(index);
        });
      } else {
        video.pause();
      }
    });
  }, [activeReel, reels]);

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
                  aria-label={`Video from ${reel.foodPartner?.bussinessname}`}
                />

                <div
                  className="reel__shade"
                  aria-hidden="true"
                />

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

