'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function useProducts({
  preFilter = {},
  initialSort = 'featured',
  pageSize = 24,
} = {}) {
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [hasMore,    setHasMore]    = useState(false);
  const [filters,    setFilters]    = useState({ ...preFilter });
  const [sort,       setSort]       = useState(initialSort);
  const abortRef = useRef(null);

  const buildParams = useCallback((pg) => {
    const p = new URLSearchParams();
    p.set('page', pg);
    p.set('limit', pageSize);
    p.set('status', 'published');
    if (filters.category)    p.set('category',    filters.category);
    if (filters.collection)  p.set('collection',  filters.collection);
    if (filters.metal_type)  p.set('metal_type',  filters.metal_type);
    if (filters.price_min)   p.set('price_min',   filters.price_min);
    if (filters.price_max)   p.set('price_max',   filters.price_max);
    if (filters.stone_type)  p.set('stone_type',  filters.stone_type);
    if (filters.diamond_type)p.set('diamond_type',filters.diamond_type);
    if (filters.is_new_arrival)  p.set('is_new_arrival', 'true');
    if (filters.is_best_seller)  p.set('is_best_seller', 'true');
    if (filters.is_featured)     p.set('is_featured',    'true');
    if (filters.in_stock)        p.set('in_stock',       'true');
    if (filters.search)          p.set('search',         filters.search);
    p.set('sort', sort);
    return p.toString();
  }, [filters, sort, pageSize]);

  const fetchPage = useCallback(async (pg, append = false) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/storefront/products?${buildParams(pg)}`, { signal: abortRef.current.signal });
      const data = await res.json();
      const items = data.data || [];
      const tot   = data.meta?.total || data.total || items.length;
      if (append) setProducts(prev => [...prev, ...items]);
      else        setProducts(items);
      setTotal(tot);
      setHasMore(pg * pageSize < tot);
    } catch (e) {
      if (e.name !== 'AbortError') setError('Could not load products. Please try again.');
    } finally { setLoading(false); }
  }, [buildParams, pageSize]);

  // Reset + fetch when filters/sort change
  useEffect(() => {
    setPage(1);
    fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchPage(next, true);
  }, [loading, hasMore, page, fetchPage]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ ...preFilter });
  }, [preFilter]);

  return {
    products, loading, error,
    total, hasMore,
    filters, setFilters: updateFilters, clearFilters,
    sort, setSort,
    loadMore,
    page,
  };
}