import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authApi } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import { RoleBadge } from '../components/ui/Badge';
import { UserCircleIcon, LockClosedIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState('profile');

  const { register: regProfile, handleSubmit: handleProfile, formState: { isSubmitting: submittingProfile } } = useForm({
    defaultValues: { name: user?.name || '', department: user?.department || '', avatar: user?.avatar || '' }
  });

  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, watch, formState: { errors: pwdErrors, isSubmitting: submittingPwd } } = useForm();
  const newPassword = watch('newPassword');

  const onSaveProfile = async (data) => {
    try {
      const res = await authApi.updateMe(data);
      updateUser(res.data.data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const onChangePassword = async (data) => {
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully');
      resetPwd();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account information and security</p>
      </div>

      {/* User card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 text-3xl font-bold flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <RoleBadge role={user?.role?.name} />
            {user?.department && <span className="text-xs text-gray-500 flex items-center gap-1"><BuildingOfficeIcon className="w-3.5 h-3.5" />{user.department}</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        <button onClick={() => setTab('profile')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'profile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          Profile Info
        </button>
        <button onClick={() => setTab('security')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'security' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          Security
        </button>
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <UserCircleIcon className="w-5 h-5 text-indigo-600" />
            Personal Information
          </h3>
          <form onSubmit={handleProfile(onSaveProfile)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input {...regProfile('name', { required: true })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (read-only)</label>
              <input value={user?.email} readOnly className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
              <input {...regProfile('department')} className={inputClass} placeholder="e.g. Engineering, HR, Finance" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role (read-only)</label>
              <input value={user?.role?.name || ''} readOnly className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed capitalize`} />
            </div>
            <button type="submit" disabled={submittingProfile} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
              {submittingProfile && <Spinner size="sm" />}
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <LockClosedIcon className="w-5 h-5 text-indigo-600" />
            Change Password
          </h3>
          <form onSubmit={handlePwd(onChangePassword)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
              <input type="password" {...regPwd('currentPassword', { required: 'Required' })} className={inputClass} placeholder="••••••••" />
              {pwdErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{pwdErrors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input type="password" {...regPwd('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} className={inputClass} placeholder="Min 8 characters" />
              {pwdErrors.newPassword && <p className="text-red-500 text-xs mt-1">{pwdErrors.newPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <input type="password" {...regPwd('confirmPassword', { validate: v => v === newPassword || 'Passwords do not match' })} className={inputClass} placeholder="••••••••" />
              {pwdErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{pwdErrors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={submittingPwd} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
              {submittingPwd && <Spinner size="sm" />}
              Update Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
