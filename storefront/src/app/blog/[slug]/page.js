'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';

export default function BlogPostPage({ params }) {
  const [post, setPost]     = useState(null);
  const [loading, setLoading]= useState(true);

  useEffect(()=>{
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/blog/${params.slug}`)
      .then(r=>r.json()).then(r=>setPost(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  },[params.slug]);

  if (loading) return <div className="pt-32 text-center py-20 text-ink-400">Loading…</div>;
  if (!post)   return <div className="pt-32 text-center py-20"><p className="text-ink-500">Post not found</p><Link href="/blog" className="btn-gold mt-4 inline-block">Back to blog</Link></div>;

  return (
    <div className="pt-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/blog" className="flex items-center gap-2 text-sm text-ink-400 hover:text-gold-600 mb-6 transition-colors"><ArrowLeft size={14}/>Back to blog</Link>

      {post.category && <span className="text-xs text-gold-600 font-semibold uppercase tracking-wide">{post.category}</span>}
      <h1 className="font-serif text-3xl lg:text-4xl text-ink-800 mt-2 mb-4">{post.title}</h1>

      <div className="flex items-center gap-4 text-xs text-ink-400 mb-6 pb-6 border-b border-ink-100">
        <span className="flex items-center gap-1"><Calendar size={12}/>{post.published_at ? new Date(post.published_at).toLocaleDateString('en-AE',{day:'numeric',month:'long',year:'numeric'}) : ''}</span>
        {post.author_name && <span>By {post.author_name}</span>}
      </div>

      {post.cover_image && <img src={post.cover_image} alt={post.title} className="w-full rounded-2xl mb-8 object-cover max-h-96"/>}

      {post.excerpt && <p className="text-lg text-ink-500 leading-relaxed mb-6 font-medium italic">{post.excerpt}</p>}

      <div className="prose prose-ink max-w-none text-sm leading-relaxed text-ink-600"
        dangerouslySetInnerHTML={{ __html: post.content || '<p>Content coming soon.</p>' }}/>

      <div className="mt-12 pt-8 border-t border-ink-100">
        <Link href="/appointment" className="btn-gold">Book an appointment →</Link>
      </div>
    </div>
  );
}
