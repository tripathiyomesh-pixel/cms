'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User, Heart, Calendar, MessageSquare, Settings, LogOut, ChevronRight, ShoppingBag } from 'lucide-react';

const NAV = [
  { href:'/account',             icon:User,         label:'My Profile' },
  { href:'/account/orders',      icon:ShoppingBag,  label:'My Orders' },
  { href:'/account/wishlist',    icon:Heart,        label:'Wishlist' },
  { href:'/account/appointments',icon:Calendar,     label:'Appointments' },
  { href:'/account/enquiries',   icon:MessageSquare,label:'Enquiries' },
  { href:'/account/settings',    icon:Settings,     label:'Settings' },
];

export default function AccountLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('jcos_customer_token');
    const acc   = localStorage.getItem('jcos_customer');
    if (!token) { router.push('/account/login'); return; }
    if (acc) setAccount(JSON.parse(acc));
  }, []);

  const logout = () => {
    localStorage.removeItem('jcos_customer_token');
    localStorage.removeItem('jcos_customer');
    router.push('/');
  };

  return (
    <div style={{ maxWidth:1200, margin:'0 auto', padding:'48px 32px', display:'grid', gridTemplateColumns:'220px 1fr', gap:40 }}>
      {/* Sidebar */}
      <aside>
        {/* Account info */}
        <div style={{ padding:'20px', background:'#f5ede2', marginBottom:20 }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:'#b8860b', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
            <span style={{ color:'#fff', fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:300 }}>
              {account?.first_name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:400, color:'#1a1a1a' }}>
            {account?.first_name} {account?.last_name}
          </p>
          <p style={{ fontSize:11, color:'#6b6b6b', marginTop:2 }}>{account?.email}</p>
        </div>

        {/* Nav links */}
        <nav>
          {NAV.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'12px 16px', textDecoration:'none',
                borderLeft: isActive ? '2px solid #b8860b' : '2px solid transparent',
                background: isActive ? '#fdf8f3' : 'transparent',
                color: isActive ? '#b8860b' : '#4a4a4a',
                fontSize:13, fontWeight: isActive ? 600 : 400,
                transition:'all .15s',
              }}>
                <span style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <item.icon size={14}/>
                  {item.label}
                </span>
                <ChevronRight size={12} style={{ opacity:0.4 }}/>
              </Link>
            );
          })}
          <button onClick={logout} style={{
            display:'flex', alignItems:'center', gap:10, padding:'12px 16px',
            width:'100%', border:'none', background:'transparent', cursor:'pointer',
            color:'#6b6b6b', fontSize:13, textAlign:'left', marginTop:8,
          }}>
            <LogOut size={14}/> Sign out
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main>{children}</main>
    </div>
  );
}
