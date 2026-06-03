'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Package, Truck, CheckCircle, XCircle, RefreshCw, ChevronRight } from 'lucide-react';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: '#f59e0b', bg: '#fffbeb', icon: Package },
  confirmed:  { label: 'Confirmed',  color: '#3b82f6', bg: '#eff6ff', icon: CheckCircle },
  processing: { label: 'Processing', color: '#8b5cf6', bg: '#f5f3ff', icon: Package },
  shipped:    { label: 'Shipped',    color: '#10b981', bg: '#f0fdf4', icon: Truck },
  delivered:  { label: 'Delivered',  color: '#059669', bg: '#ecfdf5', icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: '#ef4444', bg: '#fef2f2', icon: XCircle },
  returned:   { label: 'Returned',   color: '#6b7280', bg: '#f9fafb', icon: RefreshCw },
};

const gold = '#b8860b';
const serif = "'Cormorant Garamond', Georgia, serif";
const sans  = "'Inter', system-ui, sans-serif";

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail,  setDetail]  = useState(null);

  useEffect(() => {
    const API   = process.env.NEXT_PUBLIC_API_URL || '/api';
    const token = localStorage.getItem('jcos_customer_token');
    const customer = JSON.parse(localStorage.getItem('jcos_customer') || '{}');

    if (!token) { setLoading(false); return; }

    // Fetch orders matching customer email or phone
    const params = customer.email ? `?search=${encodeURIComponent(customer.email)}` : '';
    fetch(`${API}/orders${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(res => setOrders(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = (style) => style; // passthrough helper

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#6b6b6b', fontFamily: sans }}>
      Loading orders…
    </div>
  );

  return (
    <div style={{ fontFamily: sans }}>
      <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 300, color: '#1a1a1a', marginBottom: 8 }}>
        My Orders
      </h1>
      <div style={{ width: 40, height: 1, background: gold, marginBottom: 32 }}/>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <ShoppingBag size={40} style={{ color: '#d1ccc4', margin: '0 auto 16px' }}/>
          <p style={{ fontFamily: serif, fontSize: 20, fontWeight: 300, color: '#4a4a4a', marginBottom: 8 }}>
            No orders yet
          </p>
          <p style={{ fontSize: 13, color: '#8b8b8b', marginBottom: 24 }}>
            Your purchase history will appear here.
          </p>
          <Link href="/jewellery" style={{
            display: 'inline-block', padding: '12px 32px',
            background: '#1a1a1a', color: '#fff', textDecoration: 'none',
            fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            Browse Collection
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const Icon = sc.icon;
            const items = Array.isArray(order.items)
              ? order.items
              : (JSON.parse(order.items || '[]'));
            const isSelected = detail?.id === order.id;

            return (
              <div key={order.id}
                onClick={() => setDetail(isSelected ? null : order)}
                style={{
                  border: `1px solid ${isSelected ? gold : '#e8dcc8'}`,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}>
                {/* Order header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 40, height: 40, background: sc.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} style={{ color: sc.color }}/>
                    </div>
                    <div>
                      <p style={{ fontFamily: serif, fontSize: 16, fontWeight: 500, color: '#1a1a1a', marginBottom: 2 }}>
                        {order.order_number}
                      </p>
                      <p style={{ fontSize: 11, color: '#8b8b8b', letterSpacing: '0.05em' }}>
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', padding: '4px 10px', background: sc.bg, color: sc.color, textTransform: 'capitalize' }}>
                      {sc.label}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: serif, fontSize: 18, fontWeight: 500, color: gold }}>
                        {order.currency} {Number(order.total_amount || 0).toLocaleString()}
                      </p>
                      {items.length > 0 && (
                        <p style={{ fontSize: 11, color: '#8b8b8b' }}>{items.length} item{items.length !== 1 ? 's' : ''}</p>
                      )}
                    </div>
                    <ChevronRight size={16} style={{ color: '#c8c0b4', transform: isSelected ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}/>
                  </div>
                </div>

                {/* Expanded detail */}
                {isSelected && (
                  <div style={{ borderTop: '1px solid #e8dcc8', padding: '24px', background: '#faf8f5' }}>
                    {/* Items */}
                    {items.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b8b8b', marginBottom: 12 }}>Items</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < items.length - 1 ? '1px solid #e8dcc8' : 'none' }}>
                              <div>
                                <p style={{ fontSize: 13, color: '#1a1a1a', fontFamily: serif }}>{item.name || item.product_name || 'Item'}</p>
                                {item.qty && <p style={{ fontSize: 11, color: '#8b8b8b' }}>Qty: {item.qty}</p>}
                              </div>
                              {item.price && (
                                <p style={{ fontFamily: serif, fontSize: 14, color: '#4a4a4a' }}>
                                  {order.currency} {Number(item.price).toLocaleString()}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Totals */}
                    <div style={{ borderTop: '1px solid #e8dcc8', paddingTop: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: '#8b8b8b' }}>Subtotal</span>
                        <span style={{ fontSize: 12, color: '#4a4a4a' }}>{order.currency} {Number(order.subtotal || 0).toLocaleString()}</span>
                      </div>
                      {order.tax_amount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: '#8b8b8b' }}>VAT (5%)</span>
                          <span style={{ fontSize: 12, color: '#4a4a4a' }}>{order.currency} {Number(order.tax_amount).toLocaleString()}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #e8dcc8' }}>
                        <span style={{ fontFamily: serif, fontSize: 15, fontWeight: 500, color: '#1a1a1a' }}>Total</span>
                        <span style={{ fontFamily: serif, fontSize: 15, fontWeight: 500, color: gold }}>{order.currency} {Number(order.total_amount || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff', border: '1px solid #e8dcc8' }}>
                        <p style={{ fontSize: 11, color: '#8b8b8b', marginBottom: 4, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Notes</p>
                        <p style={{ fontSize: 13, color: '#4a4a4a' }}>{order.notes}</p>
                      </div>
                    )}

                    {/* Support */}
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e8dcc8', display: 'flex', gap: 12 }}>
                      <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '971500000000'}?text=${encodeURIComponent(`Hi, I'd like to enquire about order ${order.order_number}`)}`}
                        target="_blank" rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#25D366', color: '#fff', textDecoration: 'none', fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        💬 WhatsApp Support
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
