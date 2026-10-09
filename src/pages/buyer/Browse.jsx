// src/pages/buyer/Browse.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, Grid, List } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { productsAPI, categoriesAPI } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function BuyerBrowse() {
  const [products, setProducts] = useState([]);
  const [merchantsMap, setMerchantsMap] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [view, setView] = useState('grid');

  useEffect(() => {
    const load = async () => {
      try {
        const [prods, cats] = await Promise.all([
          productsAPI.search({}),
          categoriesAPI.list(),
        ]);
        setProducts(prods);
        setCategories(cats);

        // جلب بيانات التجار
        const merchantIds = [...new Set(prods.map((p) => p.merchant_id).filter(Boolean))];
        if (merchantIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, display_name, full_name')
            .in('id', merchantIds);

          const { data: mps } = await supabase
            .from('merchant_profiles')
            .select('user_id, business_name, region')
            .in('user_id', merchantIds);

          const map = {};
          (profiles || []).forEach((p) => {
            map[p.id] = { ...p };
          });
          (mps || []).forEach((mp) => {
            map[mp.user_id] = { ...map[mp.user_id], business_name: mp.business_name, region: mp.region };
          });
          setMerchantsMap(map);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const regions = useMemo(() => {
    const set = new Set();
    Object.values(merchantsMap).forEach((m) => m.region && set.add(m.region));
    return [...set];
  }, [merchantsMap]);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCat && p.category !== filterCat) return false;
      if (filterRegion && merchantsMap[p.merchant_id]?.region !== filterRegion) return false;
      if (minPrice && Number(p.price) < Number(minPrice)) return false;
      if (maxPrice && Number(p.price) > Number(maxPrice)) return false;
      return true;
    });

    // ترتيب
    if (sortBy === 'price-asc') result.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortBy === 'price-desc') result.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    else result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return result;
  }, [products, search, filterCat, filterRegion, minPrice, maxPrice, sortBy, merchantsMap]);

  return (
    <div>
      <PageHeader
        icon={Search}
        title="تصفّح المنتجات"
        subtitle={`${filtered.length} منتج متاح`}
        action={
          <div className="flex gap-2">
            <Button
              variant={view === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* الفلاتر */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4 sticky top-24">
            <h3 className="font-bold text-navy">الفلاتر</h3>

            <div>
              <label className="text-xs text-muted-foreground">بحث</label>
              <Input
                placeholder="ابحث..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">الفئة</label>
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">الكل</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">المنطقة</label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">الكل</option>
                {regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">السعر</label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="من"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  dir="ltr"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="إلى"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">الترتيب</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="newest">الأحدث</option>
                <option value="price-asc">الأقل سعراً</option>
                <option value="price-desc">الأعلى سعراً</option>
                <option value="name">الاسم</option>
              </select>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSearch('');
                setFilterCat('');
                setFilterRegion('');
                setMinPrice('');
                setMaxPrice('');
              }}
            >
              مسح الفلاتر
            </Button>
          </div>
        </div>

        {/* المنتجات */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد منتجات مطابقة</p>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <Link
                  key={p.id}
                  to={`/buyer/product/${p.id}`}
                  className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-secondary">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-navy line-clamp-2 text-sm mb-1">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate mb-2">
                      {merchantsMap[p.merchant_id]?.business_name || 'تاجر'}
                    </p>
                    <p className="font-bold text-gold">{Number(p.price).toFixed(2)} ر.س</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <Link
                  key={p.id}
                  to={`/buyer/product/${p.id}`}
                  className="bg-card rounded-2xl border border-border p-4 flex gap-4 hover:shadow-lg transition-shadow"
                >
                  <div className="w-24 h-24 bg-secondary rounded-xl overflow-hidden shrink-0">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy mb-1">{p.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {merchantsMap[p.merchant_id]?.business_name || 'تاجر'}
                    </p>
                    {p.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {p.description}
                      </p>
                    )}
                    <p className="font-bold text-gold">{Number(p.price).toFixed(2)} ر.س</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}