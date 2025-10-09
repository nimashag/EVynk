import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = (name, value) => {
    if (name === 'email') {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      return isValid ? '' : 'Enter a valid email address';
    }
    if (name === 'password') {
      // At least 8 chars, one letter and one number
      const isValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-={}|\[\]:";'<>?,./]{4,}$/.test(value);
      return isValid ? '' : 'Minimum 8 characters with letters and numbers';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Final validation before submit
    const emailError = validate('email', formData.email);
    const passwordError = validate('password', formData.password);
    setFieldErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });

    if (emailError || passwordError) {
      toast.error('Invalid login, please try again');
      return;
    }

    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Welcome back!');
      // Redirect based on role
      if (result.role === 'Backoffice') {
        navigate('/admin/dashboard');
      } else if (result.role === 'StationOperator') {
        navigate('/operator/panel');
      }
    } else {
      setError(result.error);
      toast.error(result.error || 'Invalid email or password', { toastId: 'login-failed' });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-900 to-teal-800 flex items-stretch justify-center p-0">
     <Link to="/" className="absolute top-4 left-4 z-50 inline-flex items-center gap-2 text-white hover:text-lime-300 transition-colors duration-200">
  <ArrowLeft size={24} className="drop-shadow" />
  <span className="text-sm font-medium">Back</span>
</Link>
      <div className="w-full grid lg:grid-cols-2">
        {/* Left image (desktop) */}
        <div className="hidden lg:block relative">
          <img
            src="./images/login.jpg"
            alt="EV charging"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/80 via-teal-800/30 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs border border-white/20 mb-3">
              <ShieldCheck size={14} className="text-lime-300" />
              Secure access
            </div>
            <h2 className="text-3xl font-bold">Charge smarter with EVynk</h2>
            <p className="text-white/80 mt-2 max-w-lg">Access your dashboard to manage stations, monitor performance, and streamline operations.</p>
          </div>
        </div>

        {/* Right form */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <div className="h-1 w-16 bg-lime-500 rounded"></div>
              <h1 className="mt-4 text-2xl font-bold text-white">Welcome back</h1>
              <p className="text-white/70 text-sm">Sign in to continue</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-white/60">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="w-full pl-10 pr-3 py-3 rounded-lg border border-white/10 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-lime-500/70 focus:border-transparent transition"
                      placeholder="you@example.com"
                    />
                  </div>
                  {touched.email && fieldErrors.email && (
                    <p className="mt-2 text-xs text-lime-300/90">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-white/60">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="w-full pl-10 pr-10 py-3 rounded-lg border border-white/10 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-lime-500/70 focus:border-transparent transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {touched.password && fieldErrors.password && (
                    <p className="mt-2 text-xs text-lime-300/90">{fieldErrors.password}</p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-lime-500 hover:bg-lime-400 text-teal-900 font-semibold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-lime-500/20"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-white/80 text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-lime-300 hover:text-lime-200 font-medium">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
