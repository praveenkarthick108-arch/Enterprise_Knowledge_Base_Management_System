const STATUS_STYLES = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  archived: 'bg-slate-100 text-slate-700',
  admin: 'bg-purple-100 text-purple-800',
  author: 'bg-blue-100 text-blue-800',
  reviewer: 'bg-teal-100 text-teal-800',
  employee: 'bg-gray-100 text-gray-700',
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

export function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[role] || 'bg-gray-100 text-gray-700'}`}>
      {role}
    </span>
  );
}

export function TagBadge({ name, color }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-white" style={{ backgroundColor: color || '#6366f1' }}>
      #{name}
    </span>
  );
}
