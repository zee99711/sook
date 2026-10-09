// src/api/base44Client.js
// ⚠️ هذا الملف أصبح Wrapper لـ Supabase عشان نتوافق مع الكود القديم
import { supabase } from './supabaseClient';

// ============================================================
// Entity Wrapper - يحاكي base44.entities.X
// ============================================================
function createEntityAPI(tableName, idField = 'id') {
  return {
    // قراءة الكل
    async list(sort = '-created_at', limit = 1000) {
      const isDesc = sort.startsWith('-');
      const col = sort.replace(/^-/, '');
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order(col, { ascending: !isDesc })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },

    // فلترة
    async filter(conditions = {}, sort = '-created_at', limit = 1000) {
      const isDesc = sort.startsWith('-');
      const col = sort.replace(/^-/, '');
      let query = supabase.from(tableName).select('*');
      Object.entries(conditions).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
      const { data, error } = await query
        .order(col, { ascending: !isDesc })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },

    // قراءة عنصر واحد بالمعرف
    async get(id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(idField, id)
        .single();
      if (error) throw error;
      return data;
    },

    // إنشاء
    async create(payload) {
      const { data, error } = await supabase
        .from(tableName)
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // تحديث
    async update(id, payload) {
      const { data, error } = await supabase
        .from(tableName)
        .update(payload)
        .eq(idField, id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // حذف
    async delete(id) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq(idField, id);
      if (error) throw error;
      return true;
    },

    // Realtime subscription
    subscribe(callback) {
      const channel = supabase
        .channel(`${tableName}-changes`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: tableName },
          (payload) => callback(payload)
        )
        .subscribe();
      return () => supabase.removeChannel(channel);
    },

    // Bulk create
    async bulkCreate(items) {
      const { data, error } = await supabase
        .from(tableName)
        .insert(items)
        .select();
      if (error) throw error;
      return data;
    },
  };
}

// ============================================================
// Auth Wrapper - يحاكي base44.auth
// ============================================================
const authAPI = {
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      const err = new Error('Not authenticated');
      err.status = 401;
      throw err;
    }
    // جلب profile الإضافي
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name || '',
      display_name: profile?.display_name || profile?.full_name || '',
      account_type: profile?.account_type || 'buyer',
      status: profile?.status || 'active',
      role: profile?.account_type === 'admin' ? 'admin' : 'user',
      ...profile,
    };
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async register(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;
    return data;
  },

  async logout(redirectUrl) {
    await supabase.auth.signOut();
    if (redirectUrl) {
      window.location.href = '/login';
    }
  },

  redirectToLogin(returnTo) {
    const url = returnTo
      ? `/login?returnTo=${encodeURIComponent(returnTo)}`
      : '/login';
    window.location.href = url;
  },

  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return true;
  },

  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return true;
  },

  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => callback(event, session)
    );
    return () => subscription.unsubscribe();
  },
};

// ============================================================
// App Wrapper - يحاكي base44.app
// ============================================================
const appAPI = {
  async getPublicSettings() {
    // نرجع إعدادات افتراضية لأننا ما عدنا بحاجة لـ Base44 settings
    return {
      id: 'sook-market',
      public_settings: {
        app_name: 'سوق الوسيط',
        version: '1.0.0',
      },
    };
  },
};

// ============================================================
// Integrations Wrapper - يحاكي base44.integrations
// ============================================================
const integrationsAPI = {
  Core: {
    async UploadPublicFile({ file }) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      return { file_url: publicUrl };
    },

    async UploadFile({ file }) {
      return this.UploadPublicFile({ file });
    },
  },
};

// ============================================================
// الكائن الرئيسي - نفس الشكل القديم
// ============================================================
export const base44 = {
  entities: {
    // جداول المشروع
    Profile: createEntityAPI('profiles', 'id'),
    MerchantProfile: createEntityAPI('merchant_profiles', 'id'),
    Product: createEntityAPI('products', 'id'),
    Category: createEntityAPI('categories', 'id'),
    Invoice: createEntityAPI('invoices', 'id'),
    InvoiceItem: createEntityAPI('invoice_items', 'id'),
    Notification: createEntityAPI('notifications', 'id'),
    Review: createEntityAPI('reviews', 'id'),
    Chat: createEntityAPI('chats', 'id'),
    Message: createEntityAPI('messages', 'id'),
    AuditLog: createEntityAPI('audit_logs', 'id'),
    AppSetting: createEntityAPI('app_settings', 'id'),

    // أسماء بديلة (توافق مع الكود القديم)
    User: createEntityAPI('profiles', 'id'),
    BuyerProfile: createEntityAPI('profiles', 'id'),
  },

  auth: authAPI,
  app: appAPI,
  integrations: integrationsAPI,

  // معلومات
  _supabase: supabase,
};

// تصدير مباشر للـ supabase للاستخدامات الجديدة
export { supabase };