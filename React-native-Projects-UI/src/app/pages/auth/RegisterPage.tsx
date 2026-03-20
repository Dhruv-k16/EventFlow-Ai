import React, { useState, useEffect, memo } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

// Move component outside to prevent recreation on every render
const RoleCard = memo<{ role: UserRole; icon: string; description: string; isSelected: boolean; onClick: () => void }>(
  ({ role, icon, description, isSelected, onClick }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
          isSelected
            ? 'border-[#6E3482] bg-[#F3E8FF]'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full gradient-purple-primary flex items-center justify-center">
            <Check size={14} className="text-white" />
          </div>
        )}
        <div className="text-3xl mb-2">{icon}</div>
        <h3 className="font-bold text-sm mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>{role}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </button>
    );
  }
);

RoleCard.displayName = 'RoleCard';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole | '',
    businessName: '',
    category: '',
    customCategory: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const home = user.role === 'PLANNER' ? '/dashboard' : user.role === 'VENDOR' ? '/vendor/dashboard' : '/client/dashboard';
      navigate(home, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.role) {
      toast.error('Please select a role');
      return;
    }

    // Use custom category if "Others" is selected
    const finalCategory = formData.category === 'Others' ? formData.customCategory : formData.category;

    setLoading(true);
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        businessName: formData.businessName,
        category: finalCategory,
        phone: formData.phone,
      });
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-[45%] gradient-purple-primary flex-col justify-center items-center p-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-white mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            EventFlow <span className="text-pink-300">AI</span>
          </h1>
          <p className="text-lg text-[#E7DBEF]">Intelligent event planning, powered by AI</p>
          <p className="text-sm text-white/70 mt-8">Join thousands of event professionals</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Create Account
            </h2>
            <p className="text-gray-500">Get started with EventFlow AI</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Your Role</label>
              <div className="grid grid-cols-3 gap-3">
                <RoleCard 
                  role="PLANNER" 
                  icon="📋" 
                  description="Plan events"
                  isSelected={formData.role === 'PLANNER'}
                  onClick={() => setFormData({ ...formData, role: 'PLANNER' })}
                />
                <RoleCard 
                  role="VENDOR" 
                  icon="🏪" 
                  description="Provide services"
                  isSelected={formData.role === 'VENDOR'}
                  onClick={() => setFormData({ ...formData, role: 'VENDOR' })}
                />
                <RoleCard 
                  role="CLIENT" 
                  icon="🎉" 
                  description="Host events"
                  isSelected={formData.role === 'CLIENT'}
                  onClick={() => setFormData({ ...formData, role: 'CLIENT' })}
                />
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all duration-200"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all duration-200"
              />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Vendor-specific fields */}
            {formData.role === 'VENDOR' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all duration-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value, customCategory: '' })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all duration-200"
                    >
                      <option value="">Select...</option>
                      <option value="Decor">Decor</option>
                      <option value="Catering">Catering</option>
                      <option value="AV">AV Equipment</option>
                      <option value="Photography">Photography</option>
                      <option value="Venue">Venue</option>
                      <option value="Transport">Transport</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all duration-200"
                    />
                  </div>
                </div>
                {/* Custom category input when "Others" is selected */}
                {formData.category === 'Others' && (
                  <div>
                    <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700 mb-2">
                      Please specify your category
                    </label>
                    <input
                      id="customCategory"
                      type="text"
                      value={formData.customCategory}
                      onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                      placeholder="Enter your business category"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all duration-200"
                    />
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-purple-primary text-white font-semibold py-3.5 rounded-xl hover:opacity-90 hover:shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-[#6E3482] font-semibold hover:text-[#49225B]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;