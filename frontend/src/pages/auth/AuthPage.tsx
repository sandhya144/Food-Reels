import { Link } from 'react-router-dom';
import './AuthPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Brand from '../../components/Brand';

type AuthPageProps = {
  role: 'user' | 'partner';
  mode: 'login' | 'register';
};

type AuthStatus = {
  type: 'success' | 'error';
  message: string;
};

const AuthPage = ({ role, mode }: AuthPageProps) => {
  const isPartner = role === 'partner';
  const isRegister = mode === 'register';
  const basePath = isPartner ? '/food-partner' : '/user';
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<AuthStatus | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const endpoint = `/${role === 'partner' ? 'food-partner' : 'user'}/${mode}`;

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await axios.post<{ message?: string }>(
        `http://localhost:3000/api/auth${endpoint}`,
        data,
        { withCredentials: true }
      );
      setStatus({
        type: 'success',
        message: response.data.message ?? 'Your account is ready.',
      });
    } catch (error) {
      const message =
        axios.isAxiosError<{ message?: string }>(error) &&
        typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : 'Please try again. If the problem continues, check your connection.';
      setStatus({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusAction = () => {
    if (status?.type === 'success') {
      navigate(role === 'user' ? '/home' : '/create-food');
      return;
    }

    setStatus(null);
  };


  const title = isPartner
    ? isRegister ? 'Bring your menu to life.' : 'Welcome back.'
    : isRegister ? 'Good food starts here.' : 'Welcome back.';


  return (
    <main className="auth-page">
      {status && (
        <div className="auth-notice-backdrop">
          <section
            className={`auth-notice auth-notice--${status.type}`}
            role={status.type === 'error' ? 'alertdialog' : 'dialog'}
            aria-modal="true"
            aria-labelledby="auth-notice-title"
            aria-describedby="auth-notice-message"
          >
            <span className="auth-notice__eyebrow">
              {status.type === 'success' ? 'SUCCESS' : 'PLEASE CHECK'}
            </span>
            <h2 id="auth-notice-title">
              {status.type === 'success'
                ? isRegister ? 'Account created' : 'Signed in'
                : isRegister ? 'Registration failed' : 'Sign-in failed'}
            </h2>
            <p id="auth-notice-message">{status.message}</p>
            <button
              className="auth-notice__action"
              type="button"
              onClick={handleStatusAction}
              autoFocus
            >
              {status.type === 'success' ? 'Continue' : 'Try again'}
              {status.type === 'success' && <span aria-hidden="true">→</span>}
            </button>
          </section>
        </div>
      )}

      <section className="auth-shell" aria-label={`${isPartner ? 'Food partner' : 'User'} ${mode}`}>
        <aside className={`auth-aside${isPartner ? ' auth-aside--partner' : ''}`}>
          <Brand className="brand" to="/user/login" wordmark="FoodLoop" />

          <div className="aside-copy">
            <span className="eyebrow">{isPartner ? 'FOR FOOD PARTNERS' : 'A LITTLE MORE DELICIOUS'}</span>
            <h1>{title}</h1>
            <p>
              {isPartner
                ? 'Meet new customers and share the dishes they’ll come back for.'
                : 'Find your next favorite, one delicious reel at a time.'}
            </p>
          </div>

          <div className="dish-art" aria-hidden="true">
            <span className="dish-art__ring" />
            <span className="dish-art__center" />
            <span className="dish-art__leaf dish-art__leaf--one" />
            <span className="dish-art__leaf dish-art__leaf--two" />
            <span className="dish-art__dot dish-art__dot--one" />
            <span className="dish-art__dot dish-art__dot--two" />
            <span className="dish-art__dot dish-art__dot--three" />
          </div>

          <p className="aside-note">
            {isPartner ? 'Your next regular is just around the corner.' : 'Good things are always on the menu.'}
          </p>
        </aside>

        <div className="auth-content">
          <div className="auth-content__top">
            <span>{isPartner ? 'Restaurant account' : 'Personal account'}</span>
            <Link to={isPartner ? '/user/login' : '/food-partner/login'}>
              {isPartner ? 'I’m here to eat' : 'I’m a food partner'}
            </Link>
          </div>

          <div className="auth-form-wrap">
            <div className="auth-heading">
              <span className="eyebrow">{isRegister ? 'GET STARTED' : 'GOOD TO SEE YOU'}</span>
              <h2>{isRegister ? 'Create your account' : 'Sign in'}</h2>
              <p>{isRegister ? 'A few details and you’re all set.' : 'Pick up right where you left off.'}</p>
            </div>

            <nav className="auth-tabs" aria-label="Account access">
              <Link to={`${basePath}/login`} aria-current={!isRegister ? 'page' : undefined}>
                Sign in
              </Link>
              <Link to={`${basePath}/register`} aria-current={isRegister ? 'page' : undefined}>
                Create account
              </Link>
            </nav>

            {/* form submission  */}
            <form className="auth-form" onSubmit={handleSubmit}>

              {isRegister && (
                <>
                  {isPartner ? (
                    <>
                      <label className="form-field">
                        <span>Restaurant name</span>
                        <input name="businessname" type="text" placeholder="e.g. Sunday Table" autoComplete="organization" required />
                      </label>
                      <label className="form-field">
                        <span>Your name</span>
                        <input name="name" type="text" placeholder="e.g. Alex Morgan" autoComplete="name" required />
                      </label>
                    </>
                  ) : (
                    <label className="form-field">
                      <span>Your name</span>
                      <input name="fullName" type="text" placeholder="e.g. Alex Morgan" autoComplete="name" required />
                    </label>
                  )}
                </>
              )}

              <label className="form-field">
                <span>Email address</span>
                <input name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
              </label>

              {isPartner && isRegister && (
                <label className="form-field">
                  <span>Phone number <span className="field-optional">Optional</span></span>
                  <input name="phone" type="tel" placeholder="+1 (555) 000-0000" autoComplete="tel" />
                </label>
              )}

              <label className="form-field">
                <span>Password</span>
                <input
                  name="password"
                  type="password"
                  placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  required
                />
              </label>

              {!isRegister && (
                <div className="form-options">
                  <label className="remember-option">
                    <input type="checkbox" name="remember" />
                    <span>Remember me</span>
                  </label>
                  <a href="#forgot-password">Forgot password?</a>
                </div>
              )}

              <button className="submit-button" type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isRegister ? 'Creating account...' : 'Signing in...'
                  : isRegister ? 'Create account' : 'Sign in'}
                {!isSubmitting && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <p className="auth-terms">
              {isRegister
                ? <>By creating an account, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.</>
                : <>New to Food Reels? <Link to={`${basePath}/register`}>Create an account</Link></>}
            </p>
          </div>

          <footer className="auth-footer">
            <span>© 2025 FoodLoops</span>
            <a href="#help">Need help?</a>
          </footer>
        </div>
      </section>
    </main>
  );
};

export default AuthPage;
