import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Settings, X } from 'lucide-react';
import api from '../../services/api';

const ICON_MAP = {
  'message-square': '💬',
  'shopping-cart':  '🛒',
  'calendar':       '📅',
  'package':        '📦',
  'alert-circle':   '⚠️',
  'trending-up':    '📈',
  'bell':           '🔔',
};

const COLOR_MAP = {
  blue:   { bg:'#eff6ff', text:'#1d4ed8', dot:'#3b82f6' },
  green:  { bg:'#f0fdf4', text:'#15803d', dot:'#22c55e' },
  amber:  { bg:'#fffbeb', text:'#92400e', dot:'#f59e0b' },
  red:    { bg:'#fef2f2', text:'#dc2626', dot:'#ef4444' },
  purple: { bg:'#faf5ff', text:'#7e22ce', dot:'#9333ea' },
  gold:   { bg:'#fdf8f3', text:'#92600a', dot:'#b8860b' },
};

export default function NotificationBell() {
  const [open,        setOpen]        = useState(false);
  const [notifs,      setNotifs]      = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading,     setLoading]     = useState(false);
  const ref = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/notifications?limit=15');
      setNotifs(r.data.data || []);
      setUnreadCount(r.data.unread_count || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifs(n => n.map(x => x.id===id ? { ...x, is_read:true } : x));
    setUnreadCount(c => Math.max(0, c-1));
  };

  const markAllRead = async () => {
    await api.put('/notifications/all/read');
    setNotifs(n => n.map(x => ({ ...x, is_read:true })));
    setUnreadCount(0);
  };

  const deleteNotif = async (id) => {
    await api.delete(`/notifications/${id}`);
    setNotifs(n => n.filter(x => x.id!==id));
  };

  const timeAgo = (date) => {
    const secs = Math.floor((Date.now() - new Date(date)) / 1000);
    if (secs < 60) return 'just now';
    if (secs < 3600) return `${Math.floor(secs/60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs/3600)}h ago`;
    return `${Math.floor(secs/86400)}d ago`;
  };

  return (
    <div ref={ref} style={{ position:'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(!open); if (!open) load(); }}
        style={{
          position:'relative', width:36, height:36, borderRadius:10,
          border:'1px solid var(--color-border-secondary)',
          background:'var(--color-background-primary)',
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', transition:'all .15s',
        }}
        onMouseEnter={e=>e.currentTarget.style.borderColor='#b8860b'}
        onMouseLeave={e=>e.currentTarget.style.borderColor='var(--color-border-secondary)'}>
        <Bell size={15} style={{ color:'var(--color-text-secondary)' }}/>
        {unreadCount > 0 && (
          <span style={{
            position:'absolute', top:-4, right:-4,
            minWidth:16, height:16, borderRadius:8,
            background:'#ef4444', color:'#fff',
            fontSize:9, fontWeight:700,
            display:'flex', alignItems:'center', justifyContent:'center',
            padding:'0 3px',
          }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:'absolute', top:44, right:0, width:340,
          background:'var(--color-background-primary)',
          border:'1px solid var(--color-border-secondary)',
          borderRadius:14, boxShadow:'0 8px 32px rgba(0,0,0,0.12)',
          zIndex:1000, overflow:'hidden',
        }}>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderBottom:'1px solid var(--color-border-tertiary)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'var(--color-text-primary)' }}>Notifications</p>
              {unreadCount > 0 && (
                <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:10, background:'#fef2f2', color:'#dc2626' }}>{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                style={{ fontSize:10, color:'#b8860b', background:'transparent', border:'none', cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                <Check size={11}/> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight:360, overflowY:'auto' }}>
            {loading && notifs.length === 0 ? (
              <div style={{ padding:24, textAlign:'center', color:'var(--color-text-tertiary)', fontSize:12 }}>Loading…</div>
            ) : notifs.length === 0 ? (
              <div style={{ padding:32, textAlign:'center' }}>
                <p style={{ fontSize:32, marginBottom:8 }}>🔔</p>
                <p style={{ fontSize:12, color:'var(--color-text-tertiary)' }}>No notifications yet</p>
              </div>
            ) : notifs.map(n => {
              const c = COLOR_MAP[n.color] || COLOR_MAP.blue;
              return (
                <div key={n.id}
                  style={{ display:'flex', gap:10, padding:'10px 14px', borderBottom:'1px solid var(--color-border-tertiary)', background: n.is_read?'transparent':'rgba(184,134,11,0.03)', cursor:'pointer', transition:'background .1s' }}
                  onClick={() => { if (!n.is_read) markRead(n.id); if (n.link) window.location.hash = n.link; }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--color-background-secondary)'}
                  onMouseLeave={e=>e.currentTarget.style.background=n.is_read?'transparent':'rgba(184,134,11,0.03)'}>
                  {/* Icon */}
                  <div style={{ width:34, height:34, borderRadius:10, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16 }}>
                    {ICON_MAP[n.icon] || '🔔'}
                  </div>
                  {/* Content */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:4 }}>
                      <p style={{ fontSize:12, fontWeight: n.is_read?400:600, color:'var(--color-text-primary)', lineHeight:1.4 }}>{n.title}</p>
                      {!n.is_read && <div style={{ width:6, height:6, borderRadius:'50%', background:c.dot, flexShrink:0, marginTop:4 }}/>}
                    </div>
                    {n.body && <p style={{ fontSize:11, color:'var(--color-text-secondary)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.body}</p>}
                    <p style={{ fontSize:10, color:'var(--color-text-tertiary)', marginTop:3 }}>{timeAgo(n.created_at)}</p>
                  </div>
                  {/* Delete */}
                  <button onClick={e=>{ e.stopPropagation(); deleteNotif(n.id); }}
                    style={{ padding:4, background:'transparent', border:'none', cursor:'pointer', color:'var(--color-text-tertiary)', opacity:0, flexShrink:0 }}
                    onMouseEnter={e=>{ e.currentTarget.style.opacity='1'; e.currentTarget.style.color='#ef4444'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.opacity='0'; e.currentTarget.style.color='var(--color-text-tertiary)'; }}>
                    <X size={12}/>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ padding:'8px 14px', borderTop:'1px solid var(--color-border-tertiary)', display:'flex', justifyContent:'center' }}>
            <button onClick={()=>{ setOpen(false); window.location.hash='/settings/notifications'; }}
              style={{ fontSize:11, color:'var(--color-text-tertiary)', background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
              <Settings size={11}/> Notification settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
