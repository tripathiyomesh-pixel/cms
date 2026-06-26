'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User, Heart, Calendar, MessageSquare, LogOut, ChevronRight } from 'lucide-react';

const NAV = [
  { href:'/account',              icon:User,         label:'My Profile'    },
  { href:'/account/wishlist',     icon:Heart,        label:'Wishlist'      },
  { href:'/account/appointments', icon:Calendar,     label:'Appointments'  },
  { href:'/account/enquiries',    icon:MessageSquare,label:'Enquiries'     },
];

export default function AccountLayout({ children }) {
  const router     = useRouter();
  const pathname   = usePathname();
  const [account, setAccount] = useState(null);
  const [authed,  setAuthed]  = useState(null); // null = loading

  useEffect(() => {
    const token = localStorage.getItem('jcos_customer_token');
    const acc   = localStorage.getItem('jcos_customer');
    if (!token) {
      setAuthed(false);
      return;
    }
    setAuthed(true);
    if (acc) { try { setAccount(JSON.parse(acc)); } catch {} }
  }, []);

  const logout = () => {
    localStorage.removeItem('jcos_customer_token');
    localStorage.removeItem('jcos_customer');
    router.push('/');
  };

  // Loading state — avoid flash
  if (authed === null) {
    return <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-heading)', fontSize:16, color:'var(--color-text-muted)' }}>Loading…</div>;
  }

  // Not authenticated — render children (account/page.js handles the login/register UI)
  if (!authed) {
    return <>{children}</>;
  }

  return (
    <div style={{ background:'var(--color-bg)', minHeight:'100vh' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'48px 32px', display:'grid', gridTemplateColumns:'220px 1fr', gap:40 }}>
        {/* Sidebar */}
        <aside>
          <div style={{ padding:'20px', background:'#f5ede2', marginBottom:20, border:'1px solid #e5d5c0' }}>
            <div style={{ width:48, height:48, background:'var(--color-accent)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
              <span style={{ color:'#fff', fontFamily:'var(--font-heading)', fontSize:22, fontWeight:300 }}>
                {account?.first_name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <p style={{ fontFamily:'var(--font-heading)', fontSize:18, fontWeight:400, color:'var(--color-text)' }}>
              {account?.first_name} {account?.last_name}
            </p>
            <p style={{ fontSize:11, color:'var(--color-text-muted)', marginTop:2 }}>{account?.email}</p>
          </div>
          <nav>
            {NAV.map(item => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'12px 16px', textDecoration:'none',
                  borderLeft: active ? '2px solid var(--color-accent)' : '2px solid transparent',
                  background: active ? 'var(--color-bg)' : 'transparent',
                  color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontSize:13, fontWeight: active ? 600 : 400, transition:'all .15s',
                }}>
                  <span style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <item.icon size={14}/>
                    {item.label}
                  </span>
                  <ChevronRight size={12} style={{ opacity:0.4 }}/>
                </Link>
              );
            })}
            <button onClick={logout} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', width:'100%', border:'none', background:'transparent', cursor:'pointer', color:'var(--color-text-muted)', fontSize:13, textAlign:'left', marginTop:8 }}>
              <LogOut size={14}/> Sign out
            </button>
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}