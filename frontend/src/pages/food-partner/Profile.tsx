
import { Link } from 'react-router-dom';
import Brand from '../../components/Brand';
import { useParams } from 'react-router-dom';
import './Profile.css';
import axios from 'axios';
import { useState, useEffect } from 'react';

type FoodPartner = {
  _id: string;
  businessname: string;
  email: string;
};

type FoodItem = {
  _id: string;
  name: string;
  description?: string;
  video: string;
};

const Profile = () => {
  // Temporary frontend data — replace it with your own logic later.

  const {profileId} =  useParams();
  const [profile, setProfile] = useState<FoodPartner | null>(null);  // get the Food partner's information
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);  // get the Food partner's uploaded videos
  const [isFollowing, setIsFollowing] = useState(false);


  const initials = profile?.businessname
  ?.split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map(word => word[0])
  .join('')
  .toUpperCase() || 'FB';


  useEffect(() => {
     // API 1: Fetch food partner details
    axios.get(`http://localhost:3000/api/food-partner/${profileId}`, {withCredentials: true})
    .then(response => {
      setProfile(response.data.foodPartner)   // Store the backend response in state
    })
    .catch(error => {
     console.log(error);
   });
  // API 2: Fetch food partner's uploaded videos
    axios.get(
    `http://localhost:3000/api/food/partner/${profileId}`,
    { withCredentials: true }
      )
    .then(response => {
      setFoodItems(response.data.foodItems);
    })
    .catch(error => {
      console.log("Error fetching food items:", error);
    });

  }, [profileId]);



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

      {/* Business Profile */}
      {/* Generate avatar initials dynamically */}
      <section
        className="partner-profile__summary"
        aria-label="Business profile"
      >
        <div className="partner-profile__identity">

          <div
            className="partner-profile__avatar"
            aria-hidden="true"
          >
            {initials}
          </div>

          <div className="partner-profile__details">
            <span className="partner-profile__eyebrow">
              Food Business Name
            </span>

            <h1 className="partner-profile__name">
              {profile?.businessname}
            </h1>
            <button
              className="partner-profile__follow"
              type="button"
              aria-pressed={isFollowing}
              onClick={() => setIsFollowing((following) => !following)}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
           
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
            {foodItems.length} videos
          </span>

        </div>

        {/* Video Gallery */}
        <div className="partner-profile__videos">

          {/* Add your food video cards here later */}
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
                />

                <div className="partner-profile__video-copy">
                  <h3>{item.name}</h3>

                  {item.description && <p>{item.description}</p>}
                </div>
              </article>
            ))}

        </div>

      </section>

    </main>
  );
};

export default Profile;
