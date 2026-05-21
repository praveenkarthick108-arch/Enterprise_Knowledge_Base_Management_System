import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import Spinner from '../components/ui/Spinner';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await authApi.login(data);
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4">
            <BuildingOfficeIcon className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Enterprise KB</h1>
          <p className="text-indigo-300 text-sm">Knowledge Base Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1.5">Email address</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
                placeholder="you@company.com"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1.5">Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-indigo-300 hover:text-white transition-colors">Forgot password?</Link>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-60">
              {isSubmitting ? <Spinner size="sm" /> : null}
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-indigo-300 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-white font-medium hover:underline">Register</Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 bg-white/5 rounded-xl border border-white/10 p-4">
          <p className="text-indigo-300 text-xs font-medium mb-2">Demo Credentials</p>
          <div className="space-y-1 text-xs text-indigo-300">
            <p>Admin: admin@company.com / Admin@123</p>
            <p>Author: author@company.com / Author@123</p>
            <p>Reviewer: reviewer@company.com / Review@123</p>
            <p>Employee: employee@company.com / Employee@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
