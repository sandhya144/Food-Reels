import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import Brand from '../../components/Brand';
import './Profile.css';


type FoodPartner = {
  _id: string;
  bussinessname: string;
};

type FoodItem = {
  _id: string;
  name: string;
  description?: string;
  video: string;
  foodPartner: FoodPartner | string | null;
};

type FoodItemsResponse = {
  foodItems: FoodItem[];
};

const getFoodPartnerId = (
  foodPartner: FoodItem['foodPartner']
): string | undefined => {
  return typeof foodPartner === 'string'
    ? foodPartner
    : foodPartner?._id;
};

const Profile = () => {
  // Get the food partner ID from the URL
  const { profileId } = useParams<{ profileId: string }>();

  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    const fetchFoodItems = async () => {
      if (!profileId) {
        setError('Invalid food business profile.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await axios.get<FoodItemsResponse>(
          'http://localhost:3000/api/food',
          {
            withCredentials: true,
          }
        );

        if (!Array.isArray(response.data.foodItems)) {
          throw new Error('Invalid food API response.');
        }

        // Filter videos belonging to the selected food partner
        const partnerItems = response.data.foodItems.filter(
          (item) => getFoodPartnerId(item.foodPartner) === profileId
        );

        if (isCurrent) {
          setFoodItems(partnerItems);
        }
      } catch (requestError) {
        console.error('Unable to load business profile:', requestError);

        if (isCurrent) {
          if (
            axios.isAxiosError(requestError) &&
            requestError.response?.status === 401
          ) {
            setError('Please sign in with a customer account to view this profile.');
          } else if (
            axios.isAxiosError(requestError) &&
            requestError.response?.status === 403
          ) {
            setError('This profile is available to customer accounts only.');
          } else {
            setError('Unable to load this business profile. Please try again.');
          }
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    void fetchFoodItems();

    return () => {
      isCurrent = false;
    };
  }, [profileId]);

  // Get business information from the first available food item
  const partner = foodItems[0]?.foodPartner;

  const businessName =
    typeof partner === 'object' && partner !== null
      ? partner.bussinessname
      : 'Food Business';

  const initials = businessName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <main className="partner-profile">

      {/* Top Navigation */}
      <header className="partner-profile__topbar">
        <Brand
          className="partner-profile__brand"
          to="/"
          wordmark="Food Reels"
        />

        <Link className="partner-profile__back" to="/">
          <span aria-hidden="true">←</span>
          Back to reels
        </Link>
      </header>

      {/* Loading */}
      {loading && (
        <p className="partner-profile__message" role="status">
          Loading business profile...
        </p>
      )}

      {/* Error */}
      {!loading && error && (
        <section className="partner-profile__message" role="alert">
          <p>{error}</p>

          {(error.includes('sign in') ||
            error.includes('customer accounts')) && (
            <Link to="/user/login">
              Customer sign in
            </Link>
          )}
        </section>
      )}

      {/* Empty State */}
      {!loading && !error && foodItems.length === 0 && (
        <section className="partner-profile__message">
          <h1>No videos available</h1>
          <p>
            This business has not uploaded any food videos yet,
            or its videos are not available.
          </p>
        </section>
      )}

      {/* Business Profile */}
      {!loading && !error && foodItems.length > 0 && (
        <>
          <section
            className="partner-profile__summary"
            aria-label="Business profile"
          >
            <div className="partner-profile__identity">

              <div
                className="partner-profile__avatar"
                aria-hidden="true"
              >
                {initials || 'F'}
              </div>

              <div className="partner-profile__details">
                <span className="partner-profile__eyebrow">
                  Food Business Name
                </span>

                <h1 className="partner-profile__name">
                  {businessName}
                </h1>

              </div>
            </div>

            {/* Business Statistics */}
            <dl className="partner-profile__stats">
              <div className="partner-profile__stat">
                <dt>Published Videos</dt>
                <dd>{foodItems.length}</dd>
              </div>

              <div className="partner-profile__stat">
                <dt>Customers Served</dt>
                <dd>15.5K</dd>
              </div>
            </dl>
          </section>

          {/* Food Video Gallery */}
          <section
            className="partner-profile__gallery"
            aria-labelledby="partner-profile-gallery-title"
          >
            <div className="partner-profile__gallery-heading">
              <div>
                <span className="partner-profile__eyebrow">
                  From the Kitchen
                </span>

                <h2 id="partner-profile-gallery-title">
                  Food Videos
                </h2>
              </div>

              <span className="partner-profile__count">
                {foodItems.length}{' '}
                {foodItems.length === 1 ? 'video' : 'videos'}
              </span>
            </div>

            <div className="partner-profile__videos">
              {foodItems.map((item) => (
                <article
                  className="partner-profile__video-card"
                  key={item._id}
                >
                  <video
                    className="partner-profile__video"
                    src={item.video}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={`${item.name} food video`}
                  />

                  <div className="partner-profile__video-copy">
                    <h3>{item.name}</h3>

                    {item.description && (
                      <p>{item.description}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default Profile;
