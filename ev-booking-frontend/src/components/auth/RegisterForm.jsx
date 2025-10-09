import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowLeft, User } from 'lucide-react';
import { toast } from 'react-toastify';
import authService from '../../services/authService';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'StationOperator'
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ 
    name: '',
    email: '', 
    phoneNumber: '',
    password: '', 
    confirmPassword: '' 
  });
  const [touched, setTouched] = useState({ 
    name: false,
    email: false, 
    phoneNumber: false,
    password: false, 
    confirmPassword: false 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = (name, value) => {
    if (name === 'name') {
      const isValid = value.trim().length >= 2;
      return isValid ? '' : 'Name must be at least 2 characters';
    }
    if (name === 'phoneNumber') {
      const isValid = /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''));
      return isValid ? '' : 'Enter a valid phone number';
    }
    if (name === 'email') {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      return isValid ? '' : 'Enter a valid email address';
    }
    if (name === 'password') {
      // At least 8 chars, one letter and one number
      const isValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-={}|\[\]:";'<>?,./]{4,}$/.test(value);
      return isValid ? '' : 'Minimum 8 characters with letters and numbers';
    }
    if (name === 'confirmPassword') {
      return value === formData.password ? '' : 'Passwords do not match';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Validate current field
    setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    
    // Re-validate confirmPassword if password changes
    if (name === 'password' && touched.confirmPassword) {
      setFieldErrors((prev) => ({ 
        ...prev, 
        confirmPassword: validate('confirmPassword', formData.confirmPassword) 
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Final validation before submit
    const nameError = validate('name', formData.name);
    const phoneNumberError = validate('phoneNumber', formData.phoneNumber);
    const emailError = validate('email', formData.email);
    const passwordError = validate('password', formData.password);
    const confirmPasswordError = validate('confirmPassword', formData.confirmPassword);
    
    setFieldErrors({ 
      name: nameError,
      phoneNumber: phoneNumberError,
      email: emailError, 
      password: passwordError, 
      confirmPassword: confirmPasswordError 
    });
    setTouched({ name: true, phoneNumber: true, email: true, password: true, confirmPassword: true });

    if (nameError || phoneNumberError || emailError || passwordError || confirmPasswordError) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setLoading(true);

    let result;
    if (formData.role === 'StationOperator') {
      // self-signup path
      result = await authService.registerOperator(formData.name, formData.email, formData.phoneNumber, formData.password);
    } else {
      // backoffice requires admin token
      result = await register(formData.name, formData.email, formData.phoneNumber, formData.password, formData.role);
    }
    
    if (result.success) {
      toast.success('Registration successful! You can now sign in.');
      // Clear form
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        role: 'StationOperator'
      });
      setTouched({ name: false, phoneNumber: false, email: false, password: false, confirmPassword: false });
      setFieldErrors({ name: '', phoneNumber: '', email: '', password: '', confirmPassword: '' });
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
      toast.error(result.error || 'Registration failed', { toastId: 'register-failed' });
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
              Join our network
            </div>
            <h2 className="text-3xl font-bold">Start your journey with EVynk</h2>
            <p className="text-white/80 mt-2 max-w-lg">Register as a station operator to manage charging stations and provide seamless EV charging experiences.</p>
          </div>
        </div>

        {/* Right form */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <div className="h-1 w-16 bg-lime-500 rounded"></div>
              <h1 className="mt-4 text-2xl font-bold text-white">Create account</h1>
              <p className="text-white/70 text-sm">Join the EVynk network today</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-white/60">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="w-full pl-10 pr-3 py-3 rounded-lg border border-white/10 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-lime-500/70 focus:border-transparent transition"
                      placeholder="John Doe"
                    />
                  </div>
                  {touched.name && fieldErrors.name && (
                    <p className="mt-2 text-xs text-lime-300/90">{fieldErrors.name}</p>
                  )}
                </div>

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
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-white/90 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-white/60">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </div>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="w-full pl-10 pr-3 py-3 rounded-lg border border-white/10 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-lime-500/70 focus:border-transparent transition"
                      placeholder="+1234567890"
                    />
                  </div>
                  {touched.phoneNumber && fieldErrors.phoneNumber && (
                    <p className="mt-2 text-xs text-lime-300/90">{fieldErrors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-white/90 mb-2">
                    Account Type
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-white/60">
                      <User size={18} />
                    </div>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      disabled
                      className="w-full pl-10 pr-3 py-3 rounded-lg border border-white/10 bg-white/5 text-white/70 cursor-not-allowed appearance-none focus:outline-none transition"
                    >
                      <option value="StationOperator">Station Operator</option>
                    </select>
                  </div>
                  <p className="mt-2 text-xs text-white/50">Account type is set to Station Operator</p>
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

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-white/60">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="w-full pl-10 pr-10 py-3 rounded-lg border border-white/10 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-lime-500/70 focus:border-transparent transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {touched.confirmPassword && fieldErrors.confirmPassword && (
                    <p className="mt-2 text-xs text-lime-300/90">{fieldErrors.confirmPassword}</p>
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
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-white/80 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-lime-300 hover:text-lime-200 font-medium">
                    Sign in here
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

export default RegisterForm;