import React, { useState } from 'react';
import { useAuth } from '../state/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Film } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login/Register
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register(formData);
      }
      navigate('/'); // Redirect to Home on success
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1014] flex items-center justify-center p-4">
      <div className="bg-[#1a1b26] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-800">
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 font-bold text-2xl text-white tracking-wider">
            <Film className="text-purple-500 w-8 h-8" />
            <span>FILMHIVE</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-[#2e3048] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email Address"
            className="w-full bg-[#2e3048] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full bg-[#2e3048] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition mt-4">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-purple-400 hover:text-purple-300 font-bold"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;