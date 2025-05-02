import { useState } from 'react';
import styles from './login.module.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../api.js';
import { useNavigate } from 'react-router-dom';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            setError("Please fill in all credentials");
            return;
        }

        try {
            const params = new URLSearchParams();
            params.append("username", email);  // 'username' is required by OAuth2PasswordRequestForm
            params.append("password", password);
        
            const response = await axios.post(`${BASE_URL}/login`,params,{
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });
            if(response.status === 200){
                const token = response.data.access_token;
                localStorage.setItem("token", token);
    
                // OPTIONAL: Redirect or update app state here
                console.log("Login successful");
                navigate('/home'); // Redirect to home page after successful login
            }
           
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
                <div>
                    <p>Don't have an account? <Link to="/signin">Sign In</Link></p>
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">LOGIN</button>
            </form>
        </div>
    );
}
