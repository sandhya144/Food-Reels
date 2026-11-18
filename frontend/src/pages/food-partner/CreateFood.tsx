
import { useState } from 'react';
import axios from 'axios';
import Brand from '../../components/Brand';
import './CreateFood.css';
import { Link, useNavigate } from 'react-router-dom';

type SubmitStatus = {
  type: 'success' | 'error';
  message: string;
};

const CreateFood = () => {

  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<SubmitStatus | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    setIsSubmitting(true);
    setStatus(null);

    try {
      await axios.post('http://localhost:3000/api/food', formData, {
        withCredentials: true,
      });
      form.reset();
      setStatus({ type: 'success', message: 'Food added successfully.' });
      setTimeout(() => {
      navigate('/home');
    }, 3000);

    } catch (error) {
      const message =
        axios.isAxiosError<{ message?: string }>(error) &&
        typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : 'Unable to add food. Please try again.';
      setStatus({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="create-food">
      {status && (
        <div
          className={`create-food__notification create-food__notification--${status.type}`}
          role={status.type === 'error' ? 'alert' : 'status'}
          aria-live={status.type === 'error' ? 'assertive' : 'polite'}
        >
          <span>{status.message}</span>
          <button
            type="button"
            className="create-food__notification-close"
            aria-label="Dismiss notification"
            onClick={() => setStatus(null)}
          >
            ×
          </button>
        </div>
      )}

      <header className="create-food__topbar">
        <Brand
          className="create-food__brand"
          to="/"
          wordmark="Food Reels"
        />
        <Link className="create-food__back" to="/">
          <span aria-hidden="true">←</span>
          Back to reels
        </Link>
      </header>

      <section className="create-food__panel" aria-labelledby="create-food-title">
        <div className="create-food__intro">
          <span className="create-food__eyebrow">Food partner studio</span>
          <h1 id="create-food-title">Share a dish</h1>
          <p>
            Add a video and a few details to introduce your food to the
            community.
          </p>
        </div>

        <form className="create-food__form" onSubmit={handleSubmit}>
          <label className="create-food__field" htmlFor="food-video">
            <span>Food video</span>
            <input
              id="food-video"
              name="video"
              type="file"
              accept="video/*"
              required
            />
            <span className="create-food__hint">
              Choose a video from your device.
            </span>
          </label>

          <label className="create-food__field" htmlFor="food-name">
            <span>Dish name</span>
            <input
              id="food-name"
              name="name"
              type="text"
              placeholder="e.g. Creamy tomato pasta"
              autoComplete="off"
              required
            />
          </label>

          <label className="create-food__field" htmlFor="food-description">
            <span>Description</span>
            <textarea
              id="food-description"
              name="description"
              placeholder="What makes this dish special?"
              rows={5}
              required
            />
          </label>

          <button
            className="create-food__submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding food...' : 'Share food'}
            {!isSubmitting && <span aria-hidden="true">→</span>}  </button>
        </form>
      </section>
    </main>
  );
};

export default CreateFood;