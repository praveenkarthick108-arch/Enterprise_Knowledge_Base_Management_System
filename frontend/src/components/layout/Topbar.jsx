import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import { searchApi } from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function Topbar({ onMenuToggle }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const down = (e) => { if (!ref.current?.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener('mousedown', down);
    return () => document.removeEventListener('mousedown', down);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setSuggestions(null); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await searchApi.suggestions(query);
        setSuggestions(data.data);
        setShowSuggestions(true);
      } catch (_) {}
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 sticky top-0 z-40 shadow-sm">
      <button onClick={onMenuToggle} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
        <Bars3Icon className="w-5 h-5" />
      </button>

      <form onSubmit={handleSearch} className="flex-1 max-w-xl relative" ref={ref}>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions && setShowSuggestions(true)}
            placeholder="Search knowledge base..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
          />
        </div>

        {showSuggestions && suggestions && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
            {suggestions.articles?.length > 0 && (
              <div>
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50">Articles</p>
                {suggestions.articles.map(a => (
                  <button key={a.id} type="button" className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 text-sm text-gray-800 flex items-center gap-2"
                    onClick={() => { navigate(`/articles/${a.id}`); setShowSuggestions(false); setQuery(''); }}>
                    <MagnifyingGlassIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    {a.title}
                  </button>
                ))}
              </div>
            )}
            {suggestions.tags?.length > 0 && (
              <div>
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50">Tags</p>
                {suggestions.tags.map(t => (
                  <button key={t.id} type="button" className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 text-sm text-gray-800"
                    onClick={() => { navigate(`/search?tag=${t.slug}`); setShowSuggestions(false); setQuery(''); }}>
                    #{t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </form>

      <div className="flex items-center gap-2 ml-auto">
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors relative">
          <BellIcon className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold cursor-pointer" onClick={() => navigate('/profile')}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
