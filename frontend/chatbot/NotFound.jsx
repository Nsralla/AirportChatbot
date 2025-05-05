// src/pages/NotFound.jsx
import { Link } from "react-router-dom";
import styles from './NotFound.module.css';

export default function NotFound() {
    // check if the user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        return (
            <div className={styles.notFound}>
                <h1>404 - Page Not Found</h1>
                <p>The page you’re looking for doesn’t exist.</p>
                <Link to="/" className={styles.backLink}>Go back to Home</Link>
            </div>
        );
    }
  return (
    <div className={styles.notFound}>
      <h1>404 - Page Not Found</h1>
      <p>The page you’re looking for doesn’t exist.</p>
      <Link to="/home" className={styles.backLink}>Go back to Home</Link>
    </div>
  );
}
