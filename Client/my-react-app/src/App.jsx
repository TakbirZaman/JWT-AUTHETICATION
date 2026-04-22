import { useContext, useState } from 'react';
import AuthContext from './AuthContext';

const initialRegisterForm = {
  name: '',
  email: '',
  password: '',
};

const initialLoginForm = {
  email: '',
  password: '',
};

function App() {
  const auth = useContext(AuthContext);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [message, setMessage] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [protectedUser, setProtectedUser] = useState(null);

  if (!auth) {
    return <p className="p-4 text-red-600">Auth provider is not connected.</p>;
  }

  const { user, token, loading, isAuthenticated, register, signIn, logOut, fetchProfile } = auth;

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage('');
    setProfileMessage('');

    try {
      const data = await register(registerForm.name, registerForm.email, registerForm.password);
      setMessage(data.message || 'Registration successful');
      setProtectedUser(data.user || null);
      setRegisterForm(initialRegisterForm);
    } catch (error) {
      setMessage(error.message || 'Registration failed');
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('');
    setProfileMessage('');

    try {
      const data = await signIn(loginForm.email, loginForm.password);
      setMessage(data.message || 'Login successful');
      setProtectedUser(data.user || null);
      setLoginForm(initialLoginForm);
    } catch (error) {
      setMessage(error.message || 'Login failed');
    }
  };

  const handleGetProfile = async () => {
    setProfileMessage('');

    try {
      const profile = await fetchProfile();

      if (profile) {
        setProtectedUser(profile);
        setProfileMessage('Protected profile loaded successfully');
      } else {
        setProtectedUser(null);
        setProfileMessage('No valid token found');
      }
    } catch (error) {
      setProtectedUser(null);
      setProfileMessage(error.message || 'Failed to fetch protected profile');
    }
  };

  const handleLogout = () => {
    logOut();
    setProtectedUser(null);
    setMessage('Logged out successfully');
    setProfileMessage('');
  };

  // Shared Tailwind classes for inputs and buttons
  const inputStyles = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border";
  const primaryButtonStyles = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";
  const secondaryButtonStyles = "w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">JWT Authentication Demo</p>
          <h1 className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl">Server + Client JWT flow is now connected</h1>
          <p className="max-w-2xl mt-3 mx-auto text-xl text-gray-500">
            Register or log in from the React client, receive a JWT from the Express server,
            store it in localStorage, then use it to access a protected route.
          </p>
        </header>

        {/* Status Card */}
        <section className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Current Auth State</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong className="font-semibold text-gray-900">Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
              <p><strong className="font-semibold text-gray-900">User:</strong> {user ? `${user.name} (${user.email})` : 'No user logged in'}</p>
              <p><strong className="font-semibold text-gray-900">Token:</strong> {token ? `${token.slice(0, 24)}...` : 'No token stored'}</p>
            </div>
            {message && <p className="mt-4 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-md">{message}</p>}
            {profileMessage && <p className="mt-2 text-sm font-medium text-blue-600 bg-blue-50 p-3 rounded-md">{profileMessage}</p>}
          </div>
        </section>

        {/* Auth Grid (Register & Login) */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          
          {/* Register Card */}
          <section className="bg-white shadow rounded-lg border border-gray-200 px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Register</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={registerForm.name}
                  onChange={handleRegisterChange}
                  placeholder="Enter your name"
                  required
                  className={inputStyles}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  placeholder="Enter your email"
                  required
                  className={inputStyles}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  placeholder="Minimum 6 characters"
                  minLength="6"
                  required
                  className={inputStyles}
                />
              </div>
              <button type="submit" disabled={loading} className={primaryButtonStyles}>
                {loading ? 'Processing...' : 'Create Account'}
              </button>
            </form>
          </section>

          {/* Login Card */}
          <section className="bg-white shadow rounded-lg border border-gray-200 px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  placeholder="Enter your email"
                  required
                  className={inputStyles}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                  required
                  className={inputStyles}
                />
              </div>
              <button type="submit" disabled={loading} className={primaryButtonStyles}>
                {loading ? 'Processing...' : 'Login'}
              </button>
            </form>
          </section>
        </div>

        {/* Protected Route Card */}
        <section className="bg-white shadow rounded-lg border border-gray-200 px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Protected Route Test</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button 
              type="button" 
              onClick={handleGetProfile} 
              disabled={loading || !token}
              className={primaryButtonStyles}
            >
              Get Protected Profile
            </button>
            <button 
              type="button" 
              onClick={handleLogout}
              className={secondaryButtonStyles}
            >
              Logout
            </button>
          </div>

          <div className="bg-gray-50 rounded-md border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Protected Profile Data</h3>
            {protectedUser ? (
              <pre className="text-sm text-gray-800 overflow-x-auto">
                {JSON.stringify(protectedUser, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-gray-500 italic">No protected profile loaded yet.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

export default App;