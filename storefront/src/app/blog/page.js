'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const CATEGORIES = ['All','Education','Buying guide','Diamond guide','Gemstone spotlight','Jewellery care','Collection stories'];

export default function BlogPage() {
  const [posts, setPosts]    = useState([]);
  const [total, setTotal]    = useState(0);
  const [cat,   setCat]      = useState('');
  const [loading, setLoading]= useState(true);

  useEffect(()=>{
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/blog${cat?`?category=${cat}`:''}`)
      .then(r=>r.json()).then(r=>{setPosts(r.data?.data||[]); setTotal(r.data?.total||0);}).catch(()=>setPosts([])).finally(()=>setLoading(false));
  },[cat]);

  return (
    <div className="pt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl lg:text-4xl text-ink-800 mb-3">Education & Stories</h1>
        <p className="text-ink-400">Diamond guides, gemstone spotlights, and jewellery expertise</p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {CATEGORIES.map(c=>(
          <button key={c} onClick={()=>setCat(c==='All'?'':c)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${(c==='All'&&!cat)||(cat===c)?'bg-gold-500 border-gold-500 text-white':'border-ink-200 text-ink-500 hover:border-gold-400'}`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{Array(6).fill(0).map((_,i)=><div key={i} className="card animate-pulse h-72"/>)}</div>
      ) : posts.length===0 ? (
        <div className="card p-16 text-center"><p className="text-ink-400">No posts yet in this category</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(p=>(
            <Link key={p.id} href={`/blog/${p.slug}`} className="card overflow-hidden hover:shadow-lg transition-all group">
              {p.cover_image ? <img src={p.cover_image} alt={p.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"/> : <div className="w-full h-48 bg-gradient-to-br from-gold-50 to-ink-50 flex items-center justify-center text-3xl">📖</div>}
              <div className="p-5">
                {p.category && <span className="text-xs text-gold-600 font-medium uppercase tracking-wide">{p.category}</span>}
                <h2 className="font-serif text-lg text-ink-800 mt-1 mb-2 group-hover:text-gold-700 transition-colors line-clamp-2">{p.title}</h2>
                {p.excerpt && <p className="text-xs text-ink-400 line-clamp-2 mb-3">{p.excerpt}</p>}
                <div className="flex items-center justify-between text-xs text-ink-400">
                  <span>{p.author_name||'Editorial'}</span>
                  <span className="text-gold-600 flex items-center gap-1">Read <ChevronRight size={12}/></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
