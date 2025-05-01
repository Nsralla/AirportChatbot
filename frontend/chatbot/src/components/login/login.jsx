import { useState } from 'react';
import styles from './login.module.css';
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            setError("Please fill in all credentials");
            return;
        }

        try {
        
            const response = await axios.post('http://127.0.0.1:8000/login',{
                email:email,
                password:password
            });

            const token = response.data.access_token;
            localStorage.setItem("token", token);

            // OPTIONAL: Redirect or update app state here
            console.log("Login successful");
        } catch (err) {
            setError("Invalid credentials");
            console.error(err);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <h1>LOGIN</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">LOGIN</button>
            </form>
        </div>
    );
}
