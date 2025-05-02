import { useState } from 'react';
import styles from './Signin.module.css';
import axios from 'axios';
import { BASE_URL } from '../../api';
import { useNavigate } from 'react-router-dom';
export default function Sigin() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async(e) =>{
        e.preventDefault();

        try{
            const response = await axios.post(`${BASE_URL}/sigin`,{
                name,
                email,
                password,
                is_admin: false
            });
    
            if(response.status === 201){
                navigate('/');
            }
        }

        catch(err){
            setError(err.response.data.detail.message);
        }
      
    }
    return (
        <div className={styles.siginContainer}>
            <h1>SIGIN</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        placeholder="Username"
                        id="username"
                        name="username"
                        value={name}
                        onChange={(e)=>setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
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
                        onChange={(e)=>setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Sigin</button>
            </form>
        </div>
    )
}