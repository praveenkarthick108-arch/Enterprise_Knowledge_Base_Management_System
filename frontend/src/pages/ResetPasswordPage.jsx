import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import Spinner from '../components/ui/Spinner';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await authApi.resetPassword({ token, newPassword: data.password });
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4">
            <BuildingOfficeIcon className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1.5">New Password</label>
              <input type="password" {...register('password', { required: true, minLength: { value: 8, message: 'Min 8 characters' } })} className={inputClass} placeholder="Min 8 characters" />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1.5">Confirm Password</label>
              <input type="password" {...register('confirmPassword', { validate: v => v === password || 'Passwords do not match' })} className={inputClass} placeholder="••••••••" />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
              {isSubmitting && <Spinner size="sm" />}
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <p className="text-center text-indigo-300 text-sm mt-6">
            <Link to="/login" className="text-white font-medium hover:underline">← Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
