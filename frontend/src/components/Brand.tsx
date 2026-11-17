import { Link } from 'react-router-dom';
import './Brand.css';

type BrandProps = {
  to: string;
  className: string;
  wordmark?: string;
};

const Brand = ({ to, className, wordmark }: BrandProps) => (
  <Link className={className} to={to} aria-label={`${wordmark ?? 'FoodLoops'} home`}>
    <span className="foodloops-mark" aria-hidden="true">F</span>
    {wordmark && <span>{wordmark}</span>}
  </Link>
);

export default Brand;
