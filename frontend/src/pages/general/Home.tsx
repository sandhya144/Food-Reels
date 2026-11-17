import { useEffect, useRef, useState } from 'react';
import './Home.css';
import reelOne from '../../assets/videos/14552837_1080_1920_30fps.mp4';
import reelTwo from '../../assets/videos/15743654_1080_1920_30fps.mp4';
import reelThree from '../../assets/videos/8908405-hd_1080_1920_25fps.mp4';
import reelFour from '../../assets/videos/8908930-hd_1080_1920_25fps.mp4';

const reels = [
  {
    video: reelOne,
    store: 'The Sunday Table',
    description: 'Slow mornings, warm plates, and the kind of brunch worth lingering over.',
  },
  {
    video: reelTwo,
    store: 'Little Olive Kitchen',
    description: 'Fresh from the kitchen: bright, simple bites made for sharing.',
  },
  {
    video: reelThree,
    store: 'Good Grain Café',
    description: 'A little something delicious to make your everyday feel special.',
  },
  {
    video: reelFour,
    store: 'Gather & Graze',
    description: 'Big flavors, good company, and one more bite before you go.',
  },
];

const Home = () => {
  const feedRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeReel, setActiveReel] = useState(0);
  const [blockedReel, setBlockedReel] = useState<number | null>(null);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveReel(Number((entry.target as HTMLVideoElement).dataset.reelIndex));
            setBlockedReel(null);
          }
        });
      },
      { root: feed, threshold: 0.65 },
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeReel) {
        void video.play().catch(() => setBlockedReel(index));
      } else {
        video.pause();
      }
    });
  }, [activeReel]);

  const playReel = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      void video.play().catch(() => setBlockedReel(index));
    }
  };

  return (
    <main className="reels-home">
      <header className="reels-header">
        <a className="reels-brand" href="/" aria-label="FoodLoops home">
          <span className="reels-brand__mark" aria-hidden="true">f</span>
          <span>FoodLoops</span>
        </a>
        <span className="reels-header__label">A taste of somewhere good</span>
        <a className="reels-header__account" href="/user/login">Sign in</a>
      </header>

      <div className="reels-feed" ref={feedRef} aria-label="Food videos">
        {reels.map((reel, index) => (
          <article className="reel" key={reel.video}>
            <video
              ref={(element) => { videoRefs.current[index] = element; }}
              className="reel__video"
              src={reel.video}
              data-reel-index={index}
              muted
              loop
              playsInline
              preload={index === 0 ? 'auto' : 'metadata'}
              aria-label={`Video from ${reel.store}`}
            />
            <div className="reel__shade" aria-hidden="true" />

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
              <span className="reel__eyebrow">From a local favorite</span>
              <h2 className="reel__store">{reel.store}</h2>
              <p className="reel__description">{reel.description}</p>
              <button className="reel__visit" type="button">
                Visit store
                <span aria-hidden="true">↗</span>
              </button>
            </div>
            <span className="reel__position" aria-hidden="true">
              {String(index + 1).padStart(2, '0')} <span>/</span> {String(reels.length).padStart(2, '0')}
            </span>
          </article>
        ))}
      </div>

      <span className="reels-scroll-hint" aria-hidden="true">
        <span>Scroll to explore</span>
        <span className="reels-scroll-hint__line" />
      </span>
    </main>
  );
};

export default Home;
