export default function Sigin() {
    return (
        <div>
            <h1>Sigin</h1>
            <form>
                <div>
                    <input
                        type="text"
                        placeholder="Username"
                        id="username"
                        name="username"
                        required
                    />
                </div>
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        id="email"
                        name="email"
                        required
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        id="password"
                        name="password"
                        required
                    />
                </div>
                <button type="submit">Sigin</button>
            </form>
        </div>
    )
}