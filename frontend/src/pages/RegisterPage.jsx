import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import Spinner from '../components/ui/Spinner';

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      const res = await authApi.register({ name: data.name, email: data.email, password: data.password, department: data.department });
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm";
  const labelClass = "block text-sm font-medium text-indigo-200 mb-1.5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4">
            <BuildingOfficeIcon className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-indigo-300 text-sm mt-1">Join your organization's knowledge base</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} className={inputClass} placeholder="John Doe" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Email address</label>
              <input type="email" {...register('email', { required: 'Email is required' })} className={inputClass} placeholder="you@company.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Department</label>
              <input type="text" {...register('department')} className={inputClass} placeholder="e.g. Engineering, HR, Finance" />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <input type="password" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })} className={inputClass} placeholder="Min 8 characters" />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Confirm Password</label>
              <input type="password" {...register('confirmPassword', { required: 'Please confirm password', validate: v => v === password || 'Passwords do not match' })} className={inputClass} placeholder="••••••••" />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-60 mt-2">
              {isSubmitting && <Spinner size="sm" />}
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-indigo-300 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
