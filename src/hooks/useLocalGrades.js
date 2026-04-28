import { useState, useCallback } from "react";

/**
 * useLocalGrades
 * - يحفظ الدرجات تلقائياً في localStorage
 * - مفتاح التخزين يتضمن الكلية + المستوى + التخصص
 *   حتى لا تتداخل درجات تخصصات مختلفة
 * - عند تغيير التخصص يُحمَّل الملف الخاص به
 */
export function useLocalGrades(facKey, levelKey, spKey) {
  // بناء مفتاح فريد لكل تخصص
  const storageKey = facKey && levelKey && spKey
    ? `grades::${facKey}::${levelKey}::${spKey}`
    : null;

  // تحميل الدرجات المحفوظة عند أول تحميل التخصص
  const [grades, setGrades] = useState(() => {
    if (!storageKey) return {};
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // تحديث درجة واحدة + حفظ فوري
  const updateGrade = useCallback((fr, field, val) => {
    setGrades(prev => {
      const next = {
        ...prev,
        [fr]: { ...(prev[fr] || {}), [field]: val },
      };
      // حفظ في localStorage كل مرة يكتب المستخدم
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // localStorage ممتلئ — لا نوقف التطبيق
        }
      }
      return next;
    });
  }, [storageKey]);

  // مسح الدرجات (عند تغيير التخصص)
  const resetGrades = useCallback(() => {
    setGrades({});
    if (storageKey) {
      try { localStorage.removeItem(storageKey); } catch {}
    }
  }, [storageKey]);

  return { grades, updateGrade, resetGrades };
}