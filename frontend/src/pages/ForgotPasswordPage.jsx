import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';
import { BuildingOfficeIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import Spinner from '../components/ui/Spinner';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const onSubmit = async (data) => {
    try {
      const res = await authApi.forgotPassword(data.email);
      setSent(true);
      if (res.data.data?.resetToken) setResetToken(res.data.data.resetToken);
      toast.success('Reset instructions generated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4">
            <BuildingOfficeIcon className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8">
          {!sent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-indigo-200 text-sm">Enter your email and we'll generate a reset token.</p>
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-1.5">Email address</label>
                <input type="email" {...register('email', { required: 'Email is required' })} className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm" placeholder="you@company.com" />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                {isSubmitting && <Spinner size="sm" />}
                {isSubmitting ? 'Processing...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <EnvelopeIcon className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-white font-medium">Reset token generated!</p>
              {resetToken && (
                <div className="bg-white/10 rounded-lg p-3 text-left">
                  <p className="text-xs text-indigo-300 mb-1">Your reset token (demo mode):</p>
                  <p className="text-xs text-white font-mono break-all">{resetToken}</p>
                  <Link to={`/reset-password/${resetToken}`} className="text-xs text-indigo-400 hover:text-white mt-2 block">Click here to reset →</Link>
                </div>
              )}
            </div>
          )}
          <p className="text-center text-indigo-300 text-sm mt-6">
            <Link to="/login" className="text-white font-medium hover:underline">← Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
