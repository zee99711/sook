// src/components/UserNotRegisteredError.jsx
import React from 'react';
import { AlertTriangle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserNotRegisteredError = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 px-4">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg border border-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-orange-100">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>

          <h1 className="text-2xl font-bold text-navy mb-3">
            الوصول مقيّد
          </h1>

          <p className="text-slate-600 mb-6 leading-relaxed">
            حسابك غير مُسجّل في هذه المنصة. يرجى التواصل مع الإدارة لطلب الوصول.
          </p>

          <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-600 text-right mb-6">
            <p className="font-medium mb-2">إذا كنت تعتقد أن هذا خطأ:</p>
            <ul className="list-disc list-inside space-y-1 text-right">
              <li>تأكد من تسجيل الدخول بالحساب الصحيح</li>
              <li>تواصل مع إدارة المنصة لإضافة صلاحية</li>
              <li>جرب تسجيل الخروج ثم الدخول مجدداً</li>
            </ul>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl hover:bg-navy/90 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;