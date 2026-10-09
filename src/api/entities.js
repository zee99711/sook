// src/api/entities.js
// عمليات CRUD مباشرة ونظيفة على Supabase
import { supabase } from './supabaseClient';

// ============================================================
// Helper عام
// ============================================================
async function handleResponse({ data, error }) {
  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }
  return data;
}

function buildQuery(table, { conditions = {}, sort = '-created_at', limit = 1000 } = {}) {
  const isDesc = sort.startsWith('-');
  const col = sort.replace(/^-/, '');

  let query = supabase.from(table).select('*');

  Object.entries(conditions).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      query = query.in(key, value);
    } else if (typeof value === 'object' && value.op) {
      // دعم عمليات متقدمة: { op: 'gte', val: 100 }
      query = query[value.op](key, value.val);
    } else {
      query = query.eq(key, value);
    }
  });

  return query.order(col, { ascending: !isDesc }).limit(limit);
}

// ============================================================
// Profiles
// ============================================================
export const profilesAPI = {
  async get(id) {
    return handleResponse(
      await supabase.from('profiles').select('*').eq('id', id).single()
    );
  },
  async list() {
    return handleResponse(await supabase.from('profiles').select('*'));
  },
  async update(id, payload) {
    return handleResponse(
      await supabase.from('profiles').update(payload).eq('id', id).select().single()
    );
  },
  async create(payload) {
    return handleResponse(
      await supabase.from('profiles').insert(payload).select().single()
    );
  },
};

// ============================================================
// Products
// ============================================================
export const productsAPI = {
  async listByMerchant(merchantId, opts = {}) {
    return handleResponse(
      await buildQuery('products', {
        conditions: { merchant_id: merchantId, ...opts.conditions },
        sort: opts.sort || '-created_at',
        limit: opts.limit || 500,
      })
    );
  },
  async get(id) {
    return handleResponse(
      await supabase.from('products').select('*').eq('id', id).single()
    );
  },
  async create(payload) {
    return handleResponse(
      await supabase.from('products').insert(payload).select().single()
    );
  },
  async update(id, payload) {
    return handleResponse(
      await supabase.from('products').update(payload).eq('id', id).select().single()
    );
  },
  async remove(id) {
    return handleResponse(await supabase.from('products').delete().eq('id', id));
  },
  async search({ q, category, minPrice, maxPrice, region, merchantId } = {}) {
    let query = supabase.from('products').select('*');

    if (q) query = query.ilike('name', `%${q}%`);
    if (category) query = query.eq('category', category);
    if (minPrice) query = query.gte('price', minPrice);
    if (maxPrice) query = query.lte('price', maxPrice);
    if (region) query = query.eq('region', region);
    if (merchantId) query = query.eq('merchant_id', merchantId);

    return handleResponse(await query.limit(200));
  },
};

// ============================================================
// Invoices
// ============================================================
export const invoicesAPI = {
  async listByMerchant(merchantId, status) {
    const conditions = { merchant_id: merchantId };
    if (status) conditions.status = status;
    return handleResponse(
      await buildQuery('invoices', { conditions, sort: '-created_at', limit: 500 })
    );
  },
  async listByBuyer(buyerId, status) {
    const conditions = { buyer_id: buyerId };
    if (status) conditions.status = status;
    return handleResponse(
      await buildQuery('invoices', { conditions, sort: '-created_at', limit: 500 })
    );
  },
  async get(id) {
    return handleResponse(
      await supabase.from('invoices').select('*').eq('id', id).single()
    );
  },
  async create(payload) {
    return handleResponse(
      await supabase.from('invoices').insert(payload).select().single()
    );
  },
  async update(id, payload) {
    return handleResponse(
      await supabase.from('invoices').update(payload).eq('id', id).select().single()
    );
  },
  async updateStatus(id, status) {
    return this.update(id, { status, updated_at: new Date().toISOString() });
  },
  async listAll(filters = {}) {
    return handleResponse(
      await buildQuery('invoices', { conditions: filters, sort: '-created_at' })
    );
  },
};

// ============================================================
// Notifications
// ============================================================
export const notificationsAPI = {
  async listForUser(userId, limit = 20) {
    return handleResponse(
      await buildQuery('notifications', {
        conditions: { user_id: userId },
        sort: '-created_at',
        limit,
      })
    );
  },
  async create(payload) {
    return handleResponse(
      await supabase.from('notifications').insert(payload).select().single()
    );
  },
  async markRead(id) {
    return handleResponse(
      await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    );
  },
  async markAllRead(userId) {
    return handleResponse(
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
    );
  },
  async unreadCount(userId) {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    return count || 0;
  },
};

// ============================================================
// Reviews
// ============================================================
export const reviewsAPI = {
  async listForMerchant(merchantId) {
    return handleResponse(
      await buildQuery('reviews', {
        conditions: { merchant_id: merchantId },
        sort: '-created_at',
      })
    );
  },
  async create(payload) {
    return handleResponse(
      await supabase.from('reviews').insert(payload).select().single()
    );
  },
  async averageForMerchant(merchantId) {
    const { data } = await supabase
      .from('reviews')
      .select('rating')
      .eq('merchant_id', merchantId);
    if (!data || data.length === 0) return 0;
    return data.reduce((acc, r) => acc + r.rating, 0) / data.length;
  },
};

// ============================================================
// Chats & Messages
// ============================================================
export const chatsAPI = {
  async listForUser(userId) {
    const { data } = await supabase
      .from('chats')
      .select('*')
      .contains('participants', [userId])
      .order('updated_at', { ascending: false });
    return data || [];
  },
  async create(payload) {
    return handleResponse(
      await supabase.from('chats').insert(payload).select().single()
    );
  },
  async messages(chatId, limit = 100) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(limit);
    return data || [];
  },
  async sendMessage(payload) {
    return handleResponse(
      await supabase.from('messages').insert(payload).select().single()
    );
  },
};

// ============================================================
// Categories
// ============================================================
export const categoriesAPI = {
  async list() {
    return handleResponse(await supabase.from('categories').select('*').order('name'));
  },
  async create(payload) {
    return handleResponse(
      await supabase.from('categories').insert(payload).select().single()
    );
  },
};

// ============================================================
// Audit Logs
// ============================================================
export const auditAPI = {
  async log(payload) {
    return handleResponse(
      await supabase.from('audit_logs').insert(payload).select().single()
    );
  },
  async list(limit = 500) {
    return handleResponse(
      await buildQuery('audit_logs', { sort: '-created_at', limit })
    );
  },
};

// ============================================================
// App Settings
// ============================================================
export const settingsAPI = {
  async get() {
    const { data } = await supabase.from('app_settings').select('*').limit(1).single();
    return data;
  },
  async update(id, payload) {
    return handleResponse(
      await supabase.from('app_settings').update(payload).eq('id', id).select().single()
    );
  },
  async create(payload) {
    return handleResponse(
      await supabase.from('app_settings').insert(payload).select().single()
    );
  },
};

// ============================================================
// تصدير موحد
// ============================================================
export const entities = {
  profiles: profilesAPI,
  products: productsAPI,
  invoices: invoicesAPI,
  notifications: notificationsAPI,
  reviews: reviewsAPI,
  chats: chatsAPI,
  categories: categoriesAPI,
  audit: auditAPI,
  settings: settingsAPI,
};