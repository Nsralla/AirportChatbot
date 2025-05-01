import { useState } from 'react';
import styles from './login.module.css';
import axios from 'axios';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()){
            setError("please fill in all credentials");
            return;
        }

        try{
            axios.post("http://127.0.0.1:8000/login",{
                email:email,
                password:password, // is it save to send password in plain text?
                },{
                    
                }
            )
        }catch(err){}
    }

    return (
        <div className={styles.loginContainer}>
            <h1>LOGIN</h1>
            <form>
                <div>
                    <input type="email" placeholder="Email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <input type="password" id="password" name="password" placeholder='Password' value={password} onChange={(e)=>setPassword(e.target.value)} required />
                </div>
                <button type='submit' >LOGIN</button>
            </form>

        </div>
    );
}