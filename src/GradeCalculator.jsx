import { useState, useCallback } from "react";
import { useLocalGrades } from "./hooks/useLocalGrades";


// ─── LABELS BILINGUES ─────────────────────────────────────────────────────────
const T = {
  appTitle:    { fr: "Calculateur de Moyenne",    ar: "حاسبة المعدل" },
  lmd:         { fr: "Système LMD — Algérie",     ar: "نظام LMD — الجزائر" },
  chooseFac:   { fr: "Choisissez votre faculté",  ar: "اختر كليتك" },
  chooseSp:    { fr: "Choisissez votre spécialité", ar: "اختر تخصصك" },
  chooseLevel: { fr: "Choisissez votre niveau",   ar: "اختر مستواك" },
  back:        { fr: "← Retour",                  ar: "← رجوع" },
  change:      { fr: "← Changer",                 ar: "← تغيير" },
  s1:          { fr: "Semestre 1",                ar: "السداسي 1" },
  s2:          { fr: "Semestre 2",                ar: "السداسي 2" },
  full:        { fr: "Vue complète",              ar: "العرض الكامل" },
  annuelle:    { fr: "Annuelle",                  ar: "المعدل السنوي" },
  credits:     { fr: "Crédits",                   ar: "الأرصدة" },
  coef:        { fr: "Coef",                      ar: "المعامل" },
  matiere:     { fr: "Matière",                   ar: "المادة" },
  ue:          { fr: "UE",                        ar: "الوحدة" },
  moyMat:      { fr: "Moy. Matière",              ar: "معدل المادة" },
  moyUE:       { fr: "Moy. UE",                   ar: "معدل الوحدة" },
  moySem:      { fr: "Moyenne semestrielle",      ar: "معدل السداسي" },
  incomplete:  { fr: "incomplet",                 ar: "ناقص" },
  specialties: { fr: "spécialité(s)",             ar: "تخصص" },
  validated:   { fr: "Crédits validés",           ar: "الأرصدة المكتسبة" },
  levels: {
    "L1": { fr: "1ère Année Licence",    ar: "السنة الأولى ليسانس" },
    "L2": { fr: "2ème Année Licence",    ar: "السنة الثانية ليسانس" },
    "L3": { fr: "3ème Année Licence",    ar: "السنة الثالثة ليسانس" },
    "M1": { fr: "1ère Année Master",     ar: "السنة الأولى ماستر" },
    "M2": { fr: "2ème Année Master",     ar: "السنة الثانية ماستر" },
  },
  ueLabels: {
    UEF: { fr: "Fondamentale",    ar: "أساسية" },
    UEM: { fr: "Méthodologique",  ar: "منهجية" },
    UED: { fr: "Découverte",      ar: "اكتشاف" },
    UET: { fr: "Transversal",     ar: "عرضية" },
  },
  facNames: {
    "ECO":  { fr: "Faculté des Sciences Économiques", ar: "كلية العلوم الاقتصادية" },
    "LANG": { fr: "Faculté des Langues",               ar: "كلية اللغات" },
    "DROIT":{ fr: "Faculté de Droit",                  ar: "كلية الحقوق" },
    "SH":   { fr: "Faculté des Sciences Humaines",     ar: "كلية العلوم الإنسانية" },
  },
  semLabels: {
    "Semestre 1": { fr: "Semestre 1", ar: "السداسي الأول" },
    "Semestre 2": { fr: "Semestre 2", ar: "السداسي الثاني" },
    "Semestre 3": { fr: "Semestre 3", ar: "السداسي الثالث" },
    "Semestre 4": { fr: "Semestre 4", ar: "السداسي الرابع" },
    "Semestre 5": { fr: "Semestre 5", ar: "السداسي الخامس" },
    "Semestre 6": { fr: "Semestre 6", ar: "السداسي السادس" },
  },
};

const bil = (obj) => (
  <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
    <span>{obj.fr}</span>
    <span style={{ opacity: 0.45, fontSize: "0.9em" }}>|</span>
    <span style={{ direction: "rtl", fontFamily: "serif" }}>{obj.ar}</span>
  </span>
);
const bilStr = (obj) => `${obj.fr} | ${obj.ar}`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
// Structure: FACULTIES[facKey].levels[levelKey].specialties[spKey].semesters[semKey].units[]
const FACULTIES = {
  "ECO": {
    emoji: "🎓",
    levels: {
      "L1": {
        specialties: {
          "Sciences Économiques (Socle commun)": {
            spAr: "علوم اقتصادية (جذع مشترك)",
            semesters: {
              "Semestre 1": { units: [
                { code: "UET", subjects: [
                  { fr: "Anglais académique", ar: "الإنجليزية الأكاديمية", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Introduction au droit", ar: "مدخل للقانون", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                  { fr: "Programmation Python 1", ar: "برمجة بالبايثون 1", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Mathématiques 1", ar: "رياضيات 1", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Statistiques 1", ar: "إحصاء 1", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Sociologie des Org.", ar: "سوسيولوجيا المنظمات", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Micro-économie 1", ar: "اقتصاد جزئي 1", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Introduction à l'économie", ar: "مدخل للاقتصاد", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comptabilité financière 1", ar: "محاسبة مالية 1", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 2": { units: [
                { code: "UET", subjects: [
                  { fr: "Terminologie écon. anglais", ar: "مصطلحات اقتصادية", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit commercial", ar: "قانون تجاري", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                  { fr: "Programmation Python 2", ar: "برمجة بالبايثون 2", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Mathématiques 2", ar: "رياضيات 2", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Statistiques 2", ar: "إحصاء 2", coef: 3, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Économie de l'entreprise", ar: "اقتصاد المؤسسة", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Histoire de la pensée écon.", ar: "تاريخ الفكر الاقتصادي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Micro-économie 2", ar: "اقتصاد جزئي 2", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comptabilité financière 2", ar: "محاسبة مالية 2", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
        },
      },
      "L2": {
        specialties: {
          "Sciences Commerciales": {
            spAr: "علوم تجارية",
            semesters: {
              "Semestre 3": { units: [
                { code: "UET", subjects: [
                  { fr: "Informatique 2", ar: "لغة أجنبية 3", coef: 1, credits: 1, hasTD: false, hasCM: false, hasTP: true },
                ]},
                { code: "UED", subjects: [
                  { fr: "Méthodologie", ar: "منهجية", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Mathématiques financières", ar: "رياضيات مالية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Economie monétaire", ar: "اقتصاد نقدي", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                  { fr: "Statistique 3", ar: "إحصاء 3", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Principes de marketing 1", ar: "أساسيات التسويق 1", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Macroéconomie 1", ar: "إقتصاد كلي 1", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comptabilité de gestion", ar: "محاسبة التسيير", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Introduction au management", ar: "مدخل لإدارة الأعمال", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 4": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère 3", ar: "لغة أجنبية 3", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Ethique des affaires", ar: "أخلاقيات الأعمال", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                  { fr: "Entreprenariat", ar: "ريادة الأعمال", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Statistiques 4", ar: "إحصاء 4", coef: 3, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Fondements de recherche opérationnelle", ar: "أساسيات بحوث العمليات", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Principes de marketing 2", ar: "أساسيات التسويق 2", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Finance et commerce international", ar: "مالية وتجارة دولية", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Macroéconomie 2", ar: "إقتصاد كلي 2", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Gestion de l'entreprise", ar: "تسيير المؤسسة", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Sciences Financières et Comptabilité": {
            spAr: "علوم مالية ومحاسبة",
            semesters: {
              "Semestre 3": { units: [
                { code: "UET", subjects: [
                  { fr: "Informatique 2", ar: "إعلام آلي 2", coef: 1, credits: 1, hasTD: false, hasCM: false, hasTP: true },
                ]},
                { code: "UED", subjects: [
                  { fr: "Méthodologie", ar: "منهجية", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Statistique 3", ar: "إحصاء 3", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Introduction au management", ar: "مدخل لإدارة الأعمال", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                  { fr: "Mathématiques financières", ar: "رياضيات مالية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Economie monétaire", ar: "اقتصاد نقدي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Finance publique", ar: "مالية عمومية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Macro économie 1", ar: "إقتصاد كلي 1", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comptabilité de gestion", ar: "محاسبة التسيير", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 4": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère 3", ar: "لغة أجنبية 3", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Entreprenariat", ar: "ريادة الأعمال", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                  { fr: "Ethique des affaires", ar: "أخلاقيات الأعمال", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Statistiques 4", ar: "إحصاء 4", coef: 3, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Fondements de recherche opérationnelle", ar: "أساسيات بحوث العمليات", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Normes comptables internationales", ar: "المعايير المحاسبية الدولية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Macro économie 2", ar: "إقتصاد كلي 2", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Gestion de l'entreprise", ar: "تسيير المؤسسة", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Finance de l'entreprise", ar: "مالية المؤسسة", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Sciences Économiques": {
            spAr: "علوم اقتصادية",
            semesters: {
              "Semestre 3": { units: [
                { code: "UET", subjects: [
                  { fr: "Informatique 2", ar: "إعلام آلي 2", coef: 1, credits: 1, hasTD: false, hasCM: false, hasTP: true },
                ]},
                { code: "UED", subjects: [
                  { fr: "Méthodologie", ar: "منهجية", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Introduction au management", ar: "مدخل لإدارة الأعمال", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                  { fr: "Comptabilité de gestion", ar: "محاسبة التسيير", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Statistique 3", ar: "إحصاء 3", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Finance publique", ar: "مالية عمومية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Histoire des faits économiques", ar: "تاريخ الوقائع الاقتصادية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Economie monétaire", ar: "اقتصاد نقدي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Macro economie 1", ar: "إقتصاد كلي 1", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 4": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère 3", ar: "لغة أجنبية 3", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Ethique des affaires", ar: "أخلاقيات الأعمال", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                  { fr: "Entreprenariat", ar: "ريادة الأعمال", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Statistiques 4", ar: "إحصاء 4", coef: 3, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Fondements de recherche opérationnelle", ar: "أساسيات بحوث العمليات", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Economie international", ar: "الاقتصاد الدولي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Gestion de l'entreprise", ar: "تسيير المؤسسة", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Economie algérienne", ar: "الاقتصاد الجزائري", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "macro économie 2", ar: "اقتصاد كلي 2", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Sciences de Gestion": {
            spAr: "علوم التسيير",
            semesters: {
              "Semestre 3": { units: [
                { code: "UET", subjects: [
                  { fr: "Informatique 2", ar: "إعلام آلي 2", coef: 1, credits: 1, hasTD: false, hasCM: false, hasTP: true },
                ]},
                { code: "UED", subjects: [
                  { fr: "Méthodologie", ar: "منهجية", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Mathematique Financiere", ar: "رياضيات مالية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Economie monétaire", ar: "اقتصاد نقدي", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                  { fr: "Statistique 3", ar: "إحصاء 3", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Finance Publique", ar: "مالية عمومية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Introduction en management", ar: "مدخل لإدارة الأعمال", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Compatabilite de gestion", ar: "محاسبة التسيير", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Macro économie 1", ar: "إقتصاد كلي 1", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 4": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangere 3", ar: "لغة أجنبية 3", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Ethique des affaires", ar: "أخلاقيات الأعمال", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                  { fr: "entreprenariat", ar: "ريادة الأعمال", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "les bases de la recherche operationnelle", ar: "أساسيات بحوث العمليات", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Statistique 4", ar: "إحصاء 4", coef: 3, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Marketing", ar: "التسويق", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Systèmes d'informations administratives", ar: "نظم المعلومات الإدارية", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Macro économie 2", ar: "إقتصاد كلي 2", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Gestion d'entreprise", ar: "تسيير المؤسسة", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
        },
      },
      "L3": {
        specialties: {
          "Économie Monétaire et Financière": {
            spAr: "اقتصاد نقدي ومالي",
            semesters: {
              "Semestre 5": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 1", ar: "لغة أجنبية متخصصة 1", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Analyse des données", ar: "تحليل البيانات", coef: 2, credits: 2, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Comptabilité banque et assurance", ar: "محاسبة البنوك و التأمينات", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Mathématiques financières", ar: "رياضيات مالية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Droit des affaires", ar: "قانون الأعمال", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Economie bancaire", ar: "اقتصاد بنكي", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Théories et politiques monétaires", ar: "النظريات و السياسات النقدية", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Gestion financière", ar: "التسيير المالي", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 6": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 2", ar: "لغة أجنبية متخصصة 2", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Fiscalité d'entreprise", ar: "جباية المؤسسة", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Économétrie", ar: "اقتصاد قياسي", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Projet de fin d'études de licence", ar: "مشروع التخرج ليسانس", coef: 2, credits: 4, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Techniques et opérations bancaires", ar: "تقنيات و أعمال البنوك", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marchés financiers", ar: "الأسواق المالية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Banque islamique", ar: "الصيرفة الاسلامية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Le système financier et bancaire algérien", ar: "النظام المالي و البنكي الجزائري", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Économie Quantitative": {
            spAr: "اقتصاد كمي",
            semesters: {
              "Semestre 5": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 1", ar: "لغة أجنبية متخصصة 1", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit des affaires", ar: "قانون الأعمال", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Logiciel statistique 1", ar: "برمجيات احصائية 1", coef: 2, credits: 5, hasTD: false, hasCM: true, hasTP: true },
                  { fr: "Evaluation du projet", ar: "تقييم مشاريع", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Économétrie 1", ar: "اقتصاد قياسي 1", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Analyse des séries chronologiques", ar: "تحليل السلاسل الزمنية 1", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Recherche opérationnelle 1", ar: "بحوث العمليات 1", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Analyse des données 1", ar: "تحليل البيانات 1", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 6": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 2", ar: "لغة أجنبية متخصصة 2", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Projet de fin d'études de licence", ar: "مشروع التخرج ليسانس", coef: 2, credits: 4, hasTD: true, hasCM: false, hasTP: false },
                  { fr: "Logiciel statistique 2", ar: "برمجيات احصائية 2", coef: 2, credits: 5, hasTD: false, hasCM: true, hasTP: true },
                  { fr: "Comptabilité nationale", ar: "محاسبة وطنية", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Analyse des séries chronologiques 2", ar: "تحليل السلاسل الزمنية 2", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Recherche opérationnelle 2", ar: "بحوث العمليات 2", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Analyse des données 2", ar: "تحليل البيانات 2", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Économétrie 2", ar: "اقتصاد قياسي 2", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Économie et Gestion des Entreprises": {
            spAr: "اقتصاد وتسيير المؤسسات",
            semesters: {
              "Semestre 5": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 1", ar: "لغة أجنبية متخصصة 1", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit de la concurrence", ar: "قانون المنافسة و حماية المستهلك", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Marketing Digital", ar: "التسويق الرقمي", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Analyse des données marketing", ar: "تحليل البيانات التسويقية", coef: 2, credits: 4, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Recherche Marketing 1", ar: "بحوث التسويق 1", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comportement du consommateur", ar: "سلوك المستهلك", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Communications marketing intégrées", ar: "الاتصالات التسويقية المتكاملة", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marketing des services", ar: "تسويق الخدمات", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 6": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 2", ar: "لغة أجنبية متخصصة 2", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Logiciels de statistiques", ar: "برمجيات احصائية 1", coef: 2, credits: 2, hasTD: false, hasCM: true, hasTP: true },
                  { fr: "Négociations commerciale", ar: "التفاوض التجاري", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Projet de fin d'études", ar: "مشروع التخرج ليسانس", coef: 2, credits: 4, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Recherche Marketing 2", ar: "بحوث التسويق 2", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marketing Stratégique", ar: "التسويق الاستراتيجي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marketing opérationnel", ar: "التسويق العملياتي", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marketing International", ar: "التسويق الدولي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Entreprenariat": {
            spAr: "ريادة الأعمال",
            semesters: {
              "Semestre 5": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère", ar: "لغة أجنبية", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Applications initiales d'analyse de données", ar: "التطبيقات الأولية لتحليل المعطيات", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                  { fr: "Marketing stratégique", ar: "التسويق الاستراتيجي", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Etude du marché", ar: "دراسة السوق", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Dispositifs de soutien et d'accompagnement des entreprises", ar: "أجهزة دعم ومرافقة المؤسسات", coef: 1, credits: 4, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Evaluation des projets et étude de faisabilité", ar: "تقييم المشاريع ودراسة الجدوى", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Management de l'innovation et de la créativité", ar: "ادارة الابداع والابتكار", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Financement des entreprises", ar: "تمويل المؤسسات", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 6": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère", ar: "لغة أجنبية", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Code du travail et des relations sociales", ar: "قانون العمل و العلاقات الإجتماعية", coef: 1, credits: 2, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Conférence en entrepreneuriat", ar: "ندوة المشاريع المقاولاتية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Projet de fin d'étude", ar: "تقرير تربص", coef: 1, credits: 4, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Création et Management des projets", ar: "إنشاء وإدارة المشاريع", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comptabilité des sociétés", ar: "محاسبة الشركات", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Fiscalité des entreprises", ar: "جباية المؤسسات", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Management": {
            spAr: "تسيير",
            semesters: {
              "Semestre 5": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 1", ar: "لغة أجنبية متخصصة 1", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit des affaires", ar: "قانون الأعمال", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Management financier", ar: "ادارة مالية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Technique de sondage", ar: "تقنيات الاستقصاء", coef: 2, credits: 4, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Structure et organisation de l'entreprise", ar: "هياكل وتنظيم المؤسسة", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Management de la technologie de l'information", ar: "إدارة تكنولوجيا المعلومات", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "management des projets", ar: "إدارة المشاريع", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Gestion des ressources humaines", ar: "إدارة الموارد البشرية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 6": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 2", ar: "لغة أجنبية متخصصة 2", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Analyse des données", ar: "تحليل البيانات", coef: 2, credits: 2, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Contrôle de gestion", ar: "مراقبة التسيير", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Projet de fin d'études", ar: "مشروع التخرج ليسانس", coef: 2, credits: 4, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Management stratégique", ar: "إدارة استراتيجية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Management de la production et des opérations", ar: "إدارة الانتاج والعمليات", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Management de la qualité totale", ar: "إدارة الجودة الشاملة", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Management de la chaine logistique", ar: "إدارة سلسلة الامداد", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Comptabilité": {
            spAr: "محاسبة",
            semesters: {
              "Semestre 5": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 1", ar: "لغة أجنبية متخصصة 1", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit des sociétés", ar: "قانون الشركات", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Gestion financière", ar: "التسيير المالي", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Techniques d'enquête", ar: "تقنيات الاستقصاء", coef: 2, credits: 4, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Comptabilité financière avancée 1", ar: "المحاسبة المالية المعمقة 1", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Théorie comptable", ar: "نظرية المحاسبة", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comptabilité d'entreprise", ar: "محاسبة الشركات", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Fiscalité de l'entreprise 1", ar: "جباية المؤسسة 1", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 6": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 2", ar: "لغة أجنبية متخصصة 2", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Analyse des données", ar: "تحليل البيانات", coef: 2, credits: 2, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Comptabilité publique", ar: "محاسبة عمومية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Projet de fin d'études de licence", ar: "مشروع التخرج ليسانس", coef: 2, credits: 4, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Comptabilité financière avancée 2", ar: "المحاسبة المالية المعمقة 2", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Fiscalité de l'entreprise 2", ar: "جباية المؤسسة 2", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Audit comptable", ar: "تدقيق محاسبي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Contrôle de gestion", ar: "مراقبة التسيير", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Finance": {
            spAr: "مالية",
            semesters: {
              "Semestre 5": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 1", ar: "لغة أجنبية متخصصة 1", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit des affaires", ar: "قانون الأعمال", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Contrôle de gestion", ar: "مراقبة التسيير", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Techniques bancaires", ar: "تقنيات بنكية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Gestion financière 1", ar: "التسيير المالي 1", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comptabilité financière avancée 1", ar: "المحاسبة المالية المعمقة 1", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marchés financiers", ar: "أسواق مالية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Fiscalité de l'entreprise", ar: "جباية المؤسسة", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 6": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 2", ar: "لغة أجنبية متخصصة 2", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Analyse des données", ar: "تحليل البيانات", coef: 2, credits: 2, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Évaluation du projet", ar: "تقييم المشاريع", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Projet de fin d'études de License", ar: "مشروع التخرج ليسانس", coef: 2, credits: 4, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Gestion financière 2", ar: "التسيير المالي 2", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comptabilité financière avancée 2", ar: "المحاسبة المالية المعمقة 2", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Théorie financière", ar: "النظرية المالية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Commerce et finances internationales", ar: "تجارة ومالية دولية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Finance et Commerce International": {
            spAr: "مالية وتجارة دولية",
            semesters: {
              "Semestre 5": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 1", ar: "لغة أجنبية متخصصة 1", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit du commerce international", ar: "قانون التجارة الدولية", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Géographie économique", ar: "الجغرافيا الاقتصادية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Analyse des données", ar: "تحليل البيانات", coef: 2, credits: 4, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Les Théories du Commerce International", ar: "نظريات التجارة الدولية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Techniques du Commerce International", ar: "تقنيات التجارة الدولية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Management International", ar: "إدارة الأعمال الدولية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Stratégies des entreprises multinationales", ar: "استراتيجيات الشركات المتعددة الجنسيات", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 6": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 2", ar: "لغة أجنبية متخصصة 2", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Logiciels statistiques 1", ar: "برمجيات إحصائية 1", coef: 2, credits: 2, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Econométrie", ar: "اقتصاد قياسي", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Projet de fin d'études", ar: "مشروع التخرج ليسانس", coef: 2, credits: 4, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Les politiques du commerce international", ar: "السياسات التجارية الدولية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "E-Commerce", ar: "التجارة الالكترونية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marketing international", ar: "التسويق الدولي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Finance internationale", ar: "مالية دولية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Marketing": {
            spAr: "تسويق",
            semesters: {
              "Semestre 5": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 1", ar: "لغة أجنبية متخصصة 1", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit de la concurrence et protection du consommateur", ar: "قانون المنافسة و حماية المستهلك", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Marketing Digital", ar: "التسويق الرقمي", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Analyse des données marketing", ar: "تحليل البيانات التسويقية", coef: 2, credits: 4, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Recherche Marketing 1", ar: "بحوث التسويق 1", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comportement du consommateur", ar: "سلوك المستهلك", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Communications marketing intégrées", ar: "الاتصالات التسويقية المتكاملة", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marketing des services", ar: "تسويق الخدمات", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 6": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 2", ar: "لغة أجنبية متخصصة 2", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Logiciels de statistiques 01", ar: "برمجيات احصائية 1", coef: 2, credits: 2, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Négociations commerciale", ar: "التفاوض التجاري", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Projet de fin d'études", ar: "مشروع التخرج ليسانس", coef: 2, credits: 4, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Recherche Marketing 02", ar: "بحوث التسويق 2", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marketing Stratégique", ar: "التسويق الاستراتيجي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marketing opérationnel", ar: "التسويق العملياتي", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marketing International", ar: "التسويق الدولي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },

          },
          "Finance Bancaire Islamique": {
            spAr: "مالية بنكية إسلامية",
            semesters: {
              "Semestre 1": { units: [
                { code: "UET", subjects: [
                  { fr: "Anglais 1", ar: "اللغة الأجنبية 1", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Introduction fiqhique et juridique aux contrats des sociétés", ar: "مدخل فقهي و قانوني لعقود الشركات", coef: 1, credits: 2, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Communication et rédaction administratif", ar: "الإنصال و التحرير الإداري", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                  { fr: "Gouvernance et contrôles chaiques sur les banques islamiques", ar: "الحوكمة و الرقابة الشرعية على المصارف الإسلامية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Les économies de zaket et elwkaf", ar: "اقتصاديات الزكاة و الوقف", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Introduction à l'économie islamique", ar: "مدخل إلى الإقتصاد الإسلامي", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Les institutions financières islamiques", ar: "مؤسسات المالية الإسلامية", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Les fondamentaux des transactions financières islamiques", ar: "أساسيات المعاملات المالية الإسلامية", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 2": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère 2", ar: "اللغة الأجنبية 2", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit bancaire", ar: "قانون البنوك", coef: 1, credits: 2, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Méthodologie", ar: "منهجية البحث العلمي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Entrepreneuriat", ar: "المقاولاتية", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                  { fr: "Assurance et Assurance Takaful", ar: "التأمين و التأمين التكافلي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "L'étude de faisabilité économique", ar: "دراسة الجدوى الإقتصادية", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marché des financement islamique", ar: "السوق المالية الإسلامية", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Les formules de financement islamique", ar: "صيغ التمويل الإسلامية", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Comptabilité et Audit": {
            spAr: "محاسبة ومراجعة",
            semesters: {
              "Semestre 1": { units: [
                { code: "UET", subjects: [
                  { fr: "Rédaction et présentation Plans D'affaires en anglais", ar: "كتابة وعرض خطط الاعمال باللغة الانجليزية", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Applications du Deep Learning", ar: "تطبيقات التعلم العميق", coef: 2, credits: 2, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Gestion financière approfondie", ar: "التسيير المالي المعمق", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Communication et rédaction administrative", ar: "الاتصال والتحرير الإداري", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Normes internationales d'audit 1", ar: "المعايير الدولية للتدقيق 1", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Normes internationales d'information financière IFRS 1", ar: "معايير إعداد التقارير المالية الدولية IFRS 1", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comptabilité des Sociétés approfondie 1", ar: "محاسبة الشركات المعمقة 1", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Audit interne", ar: "التدقيق الداخلي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 2": { units: [
                { code: "UET", subjects: [
                  { fr: "Anglais pour la recherche et la rédaction de mémoires", ar: "اللغة الانجليزية للأبحاث وكتابة المذكرات", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Logiciels statistiques Libres", ar: "برمجيات إحصائية حرة", coef: 2, credits: 2, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Méthodologie de préparation d'un mémoire de master", ar: "منهجية إعداد مذكرة الماستر", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Organisation et déontologie de la profession comptable", ar: "تنظيم وأخلاقيات مهنة المحاسبة", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Normes internationales d'audit 2", ar: "المعايير الدولية للتدقيق 2", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Normes internationales d'information financière IFRS 2", ar: "معايير إعداد التقارير المالية الدولية IFRS 2", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comptabilité des Sociétés approfondie 2", ar: "محاسبة الشركات المعمقة 2", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comptabilité sectorielle 1", ar: "المحاسبة القطاعية 1", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Comptabilité et Fiscalité": {
            spAr: "محاسبة وجباية",
            semesters: {
              "Semestre 1": { units: [
                { code: "UET", subjects: [
                  { fr: "Rédaction et présentation Plans D'affaires en anglais", ar: "كتابة وعرض خطط الاعمال باللغة الانجليزية", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Applications du Deep Learning", ar: "تطبيقات التعلم العميق", coef: 2, credits: 2, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Gouvernance des sociétés", ar: "حوكمة الشركات", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Communication et rédaction administrative", ar: "الاتصال والتحرير الإداري", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Gestion financière approfondie", ar: "التسيير المالي المعمق", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Fiscalité approfondie 1", ar: "الجباية المعمقة 1", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Normes internationales d'information financière IFRS 1", ar: "معايير إعداد التقارير المالية الدولية IFRS 1", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comptabilité des Sociétés approfondie 1", ar: "محاسبة الشركات المعمقة 1", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 2": { units: [
                { code: "UET", subjects: [
                  { fr: "Anglais pour la recherche et la rédaction de mémoires", ar: "اللغة الانجليزية للأبحاث وكتابة المذكرات", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Logiciels statistiques Libres", ar: "برمجيات إحصائية حرة", coef: 2, credits: 2, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Organisation et déontologie de la profession comptable", ar: "تنظيم وأخلاقيات مهنة المحاسبة", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Méthodologie de préparation d'un mémoire de master", ar: "منهجية إعداد مذكرة الماستر", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Comptabilité sectorielle 1", ar: "المحاسبة القطاعية 1", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Fiscalité approfondie 2", ar: "الجباية المعمقة 2", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Normes internationales d'information financière IFRS 2", ar: "معايير إعداد التقارير المالية الدولية IFRS 2", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comptabilité des Sociétés approfondie 2", ar: "محاسبة الشركات المعمقة 2", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Contrôle de Gestion": {
            spAr: "مراقبة التسيير",
            semesters: {
              "Semestre 1": { units: [
                { code: "UET", subjects: [
                  { fr: "Anglais des affaires 1", ar: "انجليزية الأعمال 1", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit des affaires", ar: "قانون الاعمال", coef: 1, credits: 2, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Réussir son insertion professionnelle", ar: "انجاح الادماج المهني", coef: 2, credits: 5, hasTD: false, hasCM: true, hasTP: false },
                  { fr: "Entrepreneuriat", ar: "مقاولاتية", coef: 1, credits: 4, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Budget et contrôle budgétaire", ar: "موازنة و مراقبة موازنية", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Gestion de la production", ar: "تسيير الانتاج", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Contrôle de gestion 1", ar: "مراقبة التسيير 1", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 2": { units: [
                { code: "UET", subjects: [
                  { fr: "Anglais des affaires 2", ar: "انجليزية الأعمال 2", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Informatique appliquée à la gestion", ar: "اعلام آلي مطبق في التسيير", coef: 1, credits: 2, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Système d'information et pilotage de la performance", ar: "نظام المعلومات وقيادة الأداء", coef: 2, credits: 5, hasTD: false, hasCM: true, hasTP: false },
                  { fr: "Séminaire en contrôle de gestion", ar: "ندوة في مراقبة التسيير", coef: 1, credits: 4, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Contrôle de gestion 2", ar: "مراقبة التسيير 2", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Étude financière d'un projet", ar: "دراسة مالية لمشروع", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Management de la masse salariale et pilotage de la productivité", ar: "تسيير كتلة الاجور وقيادة الانتاحية", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          "Management des Ressources Humaines": {
            spAr: "إدارة الموارد البشرية",
            semesters: {
              "Semestre 5": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 1", ar: "لغة أجنبية متخصصة 1", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit des affaires", ar: "قانون الأعمال", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Management de la technologie de l'information", ar: "إدارة تكنولوجيا المعلومات", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Technique de sondage", ar: "تقنيات الاستقصاء", coef: 2, credits: 4, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Management stratégique", ar: "ادارة استراتيجية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Principes du management des ressources humaines", ar: "أسس إدارة الموارد البشرية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Management des carrières", ar: "إدارة المسارات المهنية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Communication organisationnelle", ar: "الاتصال التنظيمي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 6": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 2", ar: "لغة أجنبية متخصصة 2", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Analyse des données", ar: "تحليل البيانات", coef: 2, credits: 2, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Contrôle de gestion", ar: "مراقبة التسيير", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Projet de fin d'études", ar: "مشروع التخرج ليسانس", coef: 2, credits: 4, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Management stratégique des ressources humaines", ar: "الإدارة الاستراتيجية للموارد البشرية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Ingénierie de formation", ar: "هندسة التكوين", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Management électronique des ressources humaines", ar: "الإدارة الالكترونية للموارد البشرية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Santé et sécurité au travail", ar: "الصحة و السلامة المهنية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Comptabilité": {
            spAr: "محاسبة",
            semesters: {
              "Semestre 5": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 1", ar: "لغة أجنبية متخصصة 1", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit des sociétés", ar: "قانون الشركات", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Gestion financière", ar: "التسيير المالي", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Techniques d'enquête", ar: "تقنيات الاستقصاء", coef: 2, credits: 4, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Comptabilité financière avancée 1", ar: "المحاسبة المالية المعمقة 1", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Théorie comptable", ar: "نظرية المحاسبة", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comptabilité d'entreprise", ar: "محاسبة الشركات", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Fiscalité de l'entreprise 1", ar: "جباية المؤسسة 1", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 6": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 2", ar: "لغة أجنبية متخصصة 2", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Analyse des données", ar: "تحليل البيانات", coef: 2, credits: 2, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Comptabilité publique", ar: "محاسبة عمومية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Projet de fin d'études de licence", ar: "مشروع التخرج ليسانس", coef: 2, credits: 4, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Comptabilité financière avancée 2", ar: "المحاسبة المالية المعمقة 2", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Fiscalité de l'entreprise 2", ar: "جباية المؤسسة 2", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Audit comptable", ar: "تدقيق محاسبي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Contrôle de gestion", ar: "مراقبة التسيير", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Finance": {
            spAr: "مالية",
            semesters: {
              "Semestre 5": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 1", ar: "لغة أجنبية متخصصة 1", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit des affaires", ar: "قانون الأعمال", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Contrôle de gestion", ar: "مراقبة التسيير", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Techniques bancaires", ar: "تقنيات بنكية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Gestion financière 1", ar: "التسيير المالي 1", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comptabilité financière avancée 1", ar: "المحاسبة المالية المعمقة 1", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marchés financiers", ar: "أسواق مالية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Fiscalité de l'entreprise", ar: "جباية المؤسسة", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 6": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 2", ar: "لغة أجنبية متخصصة 2", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Analyse des données", ar: "تحليل البيانات", coef: 2, credits: 2, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Évaluation du projet", ar: "تقييم المشاريع", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Projet de fin d'études de License", ar: "مشروع التخرج ليسانس", coef: 2, credits: 4, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Gestion financière 2", ar: "التسيير المالي 2", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comptabilité financière avancée 2", ar: "المحاسبة المالية المعمقة 2", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Théorie financière", ar: "النظرية المالية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Commerce et finances internationales", ar: "تجارة ومالية دولية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Finance et Commerce International": {
            spAr: "مالية وتجارة دولية",
            semesters: {
              "Semestre 5": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 1", ar: "لغة أجنبية متخصصة 1", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit du commerce international", ar: "قانون التجارة الدولية", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Géographie économique", ar: "الجغرافيا الاقتصادية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Analyse des données", ar: "تحليل البيانات", coef: 2, credits: 4, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Les Théories du Commerce International", ar: "نظريات التجارة الدولية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Techniques du Commerce International", ar: "تقنيات التجارة الدولية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Management International", ar: "إدارة الأعمال الدولية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Stratégies des entreprises multinationales", ar: "استراتيجيات الشركات المتعددة الجنسيات", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 6": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 2", ar: "لغة أجنبية متخصصة 2", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Logiciels statistiques 1", ar: "برمجيات إحصائية 1", coef: 2, credits: 2, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Econométrie", ar: "اقتصاد قياسي", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Projet de fin d'études", ar: "مشروع التخرج ليسانس", coef: 2, credits: 4, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Les politiques du commerce international", ar: "السياسات التجارية الدولية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "E-Commerce", ar: "التجارة الالكترونية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marketing international", ar: "التسويق الدولي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Finance internationale", ar: "مالية دولية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Marketing": {
            spAr: "تسويق",
            semesters: {
              "Semestre 5": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 1", ar: "لغة أجنبية متخصصة 1", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit de la concurrence et protection du consommateur", ar: "قانون المنافسة و حماية المستهلك", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Marketing Digital", ar: "التسويق الرقمي", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Analyse des données marketing", ar: "تحليل البيانات التسويقية", coef: 2, credits: 4, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Recherche Marketing 1", ar: "بحوث التسويق 1", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comportement du consommateur", ar: "سلوك المستهلك", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Communications marketing intégrées", ar: "الاتصالات التسويقية المتكاملة", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marketing des services", ar: "تسويق الخدمات", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 6": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 2", ar: "لغة أجنبية متخصصة 2", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Logiciels de statistiques 01", ar: "برمجيات احصائية 1", coef: 2, credits: 2, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Négociations commerciale", ar: "التفاوض التجاري", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Projet de fin d'études", ar: "مشروع التخرج ليسانس", coef: 2, credits: 4, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Recherche Marketing 02", ar: "بحوث التسويق 2", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marketing Stratégique", ar: "التسويق الاستراتيجي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marketing opérationnel", ar: "التسويق العملياتي", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marketing International", ar: "التسويق الدولي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
        },
      },
      "M1": {
        specialties: {
          "Analyse Économique et Prospective": {
            spAr: "التحليل الاقتصادي والاستشراف",
            semesters: {
              "Semestre 1": { units: [
                { code: "UET", subjects: [
                  { fr: "Anglais 1", ar: "لغة أجنبية 1", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                  { fr: "Informatique", ar: "اعلام الي", coef: 1, credits: 2, hasTD: false, hasCM: false, hasTP: true },
                ]},
                { code: "UED", subjects: [
                  { fr: "Analyse marchés des travail", ar: "تحليل سوق العمل", coef: 1, credits: 4, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Théorie de décision", ar: "نظرية اتخاذ القرار", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Analyse des séries temporelles", ar: "تحليل السلاسل الزمنية", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Économétrie appliqué", ar: "الاقتصاد القياسي المطبق", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Perspective économique", ar: "الاستشراف الاقتصادي", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 2": { units: [
                { code: "UET", subjects: [
                  { fr: "Anglais 2", ar: "انجليزية 2", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Séminaire politiques économiques", ar: "ندوة السياسات الاقتصادية لتمويل المشاريع", coef: 1, credits: 2, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Méthodes de prédiction", ar: "طرق التنبؤ", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Entrepreneuriat", ar: "المقاولاتية", coef: 1, credits: 4, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Économétrie appliquée 2", ar: "الاقتصاد القياسي المطبق 2", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Analyse des données approfondie", ar: "تحليل معطيات معمق", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Modalisation des phénomènes économiques", ar: "نمذجة الظواهر الاقتصادية", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Économie et Gestion des Entreprises": {
            spAr: "اقتصاد وتسيير المؤسسات",
            semesters: {
              "Semestre 1": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 1", ar: "كتابة وتقديم خطط الاعمال باللغة الانجليزية", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit des Affaires", ar: "قانون الاعمال", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Analyse des Séries temporelles", ar: "تحليل السلاسل الزمنية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Communication et Rédaction Administrative", ar: "الاتصال والتحرير الإداري", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Microéconomie Approfondie", ar: "الاقتصاد الجزئي المعمق", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Evaluation des Projets", ar: "تقييم المشاريع", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marketing Stratégique", ar: "التسويق الإستراتيجي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Financement d'entreprise", ar: "تمويل المؤسسة", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 2": { units: [
                { code: "UET", subjects: [
                  { fr: "Anglais pour la recherche et la rédaction mémoires", ar: "اللغة الإنجليزية للأبحاث وكتابة المذكرات", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Applications du Deep Learning", ar: "تطبيقات التعلم العميق", coef: 2, credits: 2, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Méthodologie de préparation d'un mémoire de master", ar: "منهجية إعداد مذكرة الماستر", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Econométrie Avancée", ar: "اقتصاد قياسي متقدم", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Diagnostic de l'entreprise", ar: "تشخيص المؤسسة", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Macroéconomie Approfondie", ar: "اقتصاد كلي معمق", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Contrôle de Gestion", ar: "مراقبة التسيير", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Management des performances et compétences", ar: "إدارة الاداء و الكفاءات", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Économie Internationale": {
            spAr: "اقتصاد دولي",
            semesters: {
              "Semestre 1": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 1", ar: "لغة أجنبية متخصصة 1", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit douanier", ar: "قانون الجمارك", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Analyse des séries chronologiques", ar: "تحليل السلاسل الزمنية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Communication et rédaction administrative", ar: "الاتصال و التحرير الاداري", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Théories modernes du commerce international", ar: "نظريات التجارة الدولية الحديثة", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Macroéconomie", ar: "اقتصاد كلي معمق", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Géographie économique", ar: "الجغرافيا الاقتصادية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Echange de marchandises", ar: "بورصة البضائع", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 2": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 2", ar: "لغة أجنبية متخصصة 2", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Négociation et diplomatie économique", ar: "التفاوض و الديبلوماسية الاقتصادية", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Econométrie avancée", ar: "اقتصاد قياسي متقدم", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Méthodologie de préparation du mémoire de master", ar: "منهجية اعداد مدكرة الماستر", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Finance internationale approfondie", ar: "المالية الدولية المعمقة", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Marketing international", ar: "التسويق الدولي", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Production internationale et entreprises multinationales", ar: "الانتاج الدولي و الشركات المتعددة الجنسيات", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Input and output analysis", ar: "تحليل المدخلات و المخرجات", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Économie Monétaire et Financière": {
            spAr: "اقتصاد نقدي ومالي",
            semesters: {
              "Semestre 1": { units: [
                { code: "UET", subjects: [
                  { fr: "Rédaction et présentation plans d'affaires en anglais", ar: "كتابة وتقديم خطط الاعمال باللغة الانجليزية", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Analyse des séries temporelles", ar: "تحليل السلاسل الزمنية", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Economie des assurances", ar: "اقتصاد التأمينات", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Communication et rédaction administrative", ar: "الاتصال والتحرير الإداري", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Finance international", ar: "مالية دولية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Technique de gestion de la bourse", ar: "تقنيات تسيير البورصة", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comptabilité publique", ar: "محاسبة عمومية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Economie bancaire approfondie", ar: "اقتصاد بنكي معمق", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 2": { units: [
                { code: "UET", subjects: [
                  { fr: "Anglais pour la recherche et la rédaction de mémoires", ar: "اللغة الانجليزية للابحاث وكتابة المذكرات", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Marketing des services financiers et bancaires", ar: "تسويق الخدمات المالية والبنكية", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Économétrie financière", ar: "اقتصاد قياسي مالي", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Méthodologie de préparation d'un mémoire de master", ar: "منهجية اعداد مذكرة ماستر", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Management bancaire", ar: "التسيير البنكي", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Management des portefeuilles financiers", ar: "تسيير المحافظ المالية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Macroéconomie approfondie", ar: "اقتصاد كلي معمق", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Evaluation des projets", ar: "تقييم المشاريع", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Économie Numérique": {
            spAr: "اقتصاد رقمي",
            semesters: {
              "Semestre 1": { units: [
                { code: "UET", subjects: [
                  { fr: "Anglais 1", ar: "انجلزية 1", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Contrats électroniques", ar: "العقود الالكترونية", coef: 1, credits: 2, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Méthodologie de recherche", ar: "منهجية البحث العلمي 1", coef: 1, credits: 4, hasTD: false, hasCM: true, hasTP: false },
                  { fr: "Gestion de document numérique", ar: "إدارة المستند الرقمي", coef: 2, credits: 5, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Réseaux informatique", ar: "شبكات الكمبيوتر", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "TIC", ar: "تكنولوجيا المعلومات والاتصال", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Renaissance digitale", ar: "النهضة الرقمية", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 2": { units: [
                { code: "UET", subjects: [
                  { fr: "Anglais 2", ar: "انجلزية 2", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit commerce électronique", ar: "قانون التجارة الالكترونية", coef: 1, credits: 2, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Incubateurs technologiques", ar: "الحاضنات التكنولوجية", coef: 2, credits: 5, hasTD: false, hasCM: true, hasTP: false },
                  { fr: "Technique étude de terrain", ar: "تقنيات الدراسة الميدانية", coef: 1, credits: 4, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Commerce électronique", ar: "التجارة الالكترونية", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Développement web", ar: "تطوير الواب", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Système d'information", ar: "نظام المعلومات", coef: 2, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Économie Quantitative": {
            spAr: "اقتصاد كمي",
            semesters: {
              "Semestre 1": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 1", ar: "لغة أجنبية متخصصة 1", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Marchés financiers", ar: "الأسواق المالية", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Théorie de la prise de décision", ar: "نظرية اتخاذ القرار", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Techniques d'Enquête", ar: "تقنيات الاستقصاء", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Communication et rédaction administrative", ar: "الاتصال و التحرير الاداري", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Économétrie dynamique", ar: "اقتصاد قياسي ديناميكي", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Macroéconomique approfondie", ar: "اقتصاد كلي معمق", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Microéconomie approfondie", ar: "اقتصاد جزئي معمق", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 2": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère spécialisée 2", ar: "لغة أجنبية متخصصة 2", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Logiciel R", ar: "برمجية R", coef: 2, credits: 2, hasTD: false, hasCM: true, hasTP: true },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Méthodes optimales", ar: "الطرق الأمثلية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Méthodologie de préparation du mémoire de fin d'études", ar: "منهجية إعداد مذكرة الماستر", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Econométrie financière", ar: "اقتصاد قياسي مالي", coef: 3, credits: 6, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Théories et modèles de croissance économique", ar: "نظريات و نماذج النمو الاقتصادي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Analyse des entrées et des sorties", ar: "تحليل المدخلات و المخرجات", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Science des données et apprentissage automatique", ar: "علم البيانات و تعلم الآلة", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Entrepreneuriat et Innovation": {
            spAr: "ريادة الأعمال والابتكار",
            semesters: {
              "Semestre 1": { units: [
                { code: "UET", subjects: [
                  { fr: "Rédaction et présentation plans d'affaires en anglais", ar: "كتابة و عرض خطط الأعمال باللغة الانجليزية", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit de la concurrence et protection du consommateur", ar: "قانون المنافسة و حماية المستهلك", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Applications de Deep Learning", ar: "تطبيقات التعلم العميق", coef: 2, credits: 5, hasTD: false, hasCM: true, hasTP: true },
                  { fr: "Communication et Rédaction Administrative", ar: "الاتصال و التحرير الاداري", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Stratégie internationale", ar: "الاستراتيجية الدولية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Ingénierie financière pour les institutions entrepreneuriales", ar: "الهندسة المالية للمؤسسات الريادية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Contrôle de gestion des institutions entrepreneuriales", ar: "مراقبة التسيير للمؤسسات الريادية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Veille numérique", ar: "اليقضة الرقمية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 2": { units: [
                { code: "UET", subjects: [
                  { fr: "Anglais pour la recherche et la rédaction de mémoires", ar: "اللغة الانجليزية للأبحاث و كتابة المذكرات", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit des affaires", ar: "قانون الأعمال", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Méthodes quantitatives de management", ar: "الأساليب الكمية في الإدارة", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Méthodologie de préparation d'un mémoire de master", ar: "منهجية إعداد مذكرة الماستر", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Reprise et rachat d'entreprise", ar: "استحواذ و استرداد المؤسسات", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Systèmes de planification des ressources", ar: "نظم تخطيط الموارد", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Design Thinking", ar: "التفكير التصميمي", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Analyse de l'écosystème de l'entrepreneuriat", ar: "تحليل النظام البيئي لريادة الأعمال", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Gestion Publique": {
            spAr: "تسيير عمومي",
            semesters: {
              "Semestre 1": { units: [
                { code: "UET", subjects: [
                  { fr: "Rédaction et présentation plans d'affaires en anglais", ar: "كتابة و عرض خطط الأعمال باللغة الانجليزية", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit administratif", ar: "القانون الإداري", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Applications du Deep Learning", ar: "تطبيقات التعلم العميق", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Communication et rédaction administrative", ar: "الإتصال والتحرير الإداري", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Management public moderne", ar: "التسيير العمومي الحديث", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comptabilité publique", ar: "المحاسبة العمومية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Management budget des communautés locales", ar: "إدارة ميزانية الجماعات المحلية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Les marchés publics", ar: "الصفقات العمومية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 2": { units: [
                { code: "UET", subjects: [
                  { fr: "Anglais pour la recherche et la rédaction de mémoires", ar: "اللغة الانجليزية للأبحاث و كتابة المذكرات", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Droit de la fonction publique", ar: "قانون الوظيفة العمومية", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Méthodes quantitatives en management", ar: "الأساليب الكمية في الإدارة", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Méthodologie de la préparation d'un mémoire de master", ar: "منهجية إعداد مذكرة الماستر", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Management des ressources humaines dans le secteur public", ar: "ادارة الموارد البشرية في القطاع العمومي", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Evaluation des projets publics", ar: "تقييم المشاريع العمومية", coef: 2, credits: 5, hasTD: false, hasCM: true, hasTP: true },
                  { fr: "Finance publique approfondie", ar: "المالية العمومية المعمقة", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Contrôle et audit dans le secteur public", ar: "الرقابة والتدقيق في القطاع العمومي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Management": {
            spAr: "تسيير",
            semesters: {
              "Semestre 1": { units: [
                { code: "UET", subjects: [
                  { fr: "Rédaction et présentation plans d'affaires en anglais", ar: "كتابة و عرض مخطط الأعمال باللغة الانجليزية", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Applications du Deep Learning", ar: "تطبيقات التعلم العميق", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Communication et rédaction administrative", ar: "الاتصال و التحرير الإداري", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Management de la connaissance", ar: "إدارة المعرفة", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Management des affaires internationales", ar: "إدارة الأعمال الدولية", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comportement organisationnel", ar: "السلوك التنظيمي", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Analyse stratégique et concurrentielle", ar: "التحليل الاستراتيجي و التنافسي", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Culture de l'organisation", ar: "ثقافة المنظمة", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 2": { units: [
                { code: "UET", subjects: [
                  { fr: "Anglais pour la recherche et la rédaction de mémoires", ar: "اللغة الانجليزية للأبحاث و كتابة المذكرات", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Marketing stratégique", ar: "التسويق الاستراتيجي", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Méthodologie de la préparation d'un mémoire de master", ar: "منهجية إعداد مذكرة الماستر", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Méthodes quantitatives en management", ar: "الأساليب الكمية في الإدارة", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Intelligence des affaires et compétitivité de l'organisation", ar: "ذكاء الأعمال و تنافسية المنظمة", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Théorie de l'organisation", ar: "نظرية المنظمة", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Management de la créativité et de l'innovation", ar: "إدارة الإبداع و الإبتكار", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Planification des ressources de l'entreprise ERP", ar: "تخطيط موارد المؤسسة ERP", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
          "Management des Ressources Humaines": {
            spAr: "إدارة الموارد البشرية",
            semesters: {
              "Semestre 1": { units: [
                { code: "UET", subjects: [
                  { fr: "Rédaction et présentation plans d'affaires en anglais", ar: "كتابة و عرض خطط الأعمال باللغة الانجليزية", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Applications du Deep Learning", ar: "تطبيقات التعلم العميق", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Communication et rédaction administrative", ar: "الاتصال والتحرير الإداري", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Contrôle de la gestion sociale", ar: "مراقبة التسيير الاجتماعي", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Management des salaires et des motivations 1", ar: "إدارة الأجور والحوافز 1", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Ingénierie fonctionnelle", ar: "الهندسة الوظيفية", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Culture de l'organisation", ar: "ثقافة المنظمة", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Comportement organisationnel", ar: "السلوك التنظيمي", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 2": { units: [
                { code: "UET", subjects: [
                  { fr: "Anglais pour la recherche et la rédaction de mémoires", ar: "اللغة الانجليزية للأبحاث و كتابة المذكرات", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Audit social", ar: "التدقيق الاجتماعي", coef: 2, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Méthodes quantitatives en management", ar: "الأساليب الكمية في الإدارة", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Méthodologie de la préparation d'une mémoire de master", ar: "منهجية إعداد مذكرة الماستر", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Management de la connaissance", ar: "إدارة المعرفة", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Management des salaires et des motivations 2", ar: "إدارة الأجور والحوافز 2", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Théorie de l'organisation", ar: "نظرية المنظمة", coef: 2, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Planification des ressources de l'entreprise ERP", ar: "تخطيط موارد المؤسسة ERP", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
        },
      },
      "M2": { specialties: {} },
    },
  },
  "LANG": {
    emoji: "📚",
    levels: {
      "L1": {
        specialties: {
          "Langue Française": {
            spAr: "اللغة الفرنسية",
            semesters: {
              "Semestre 1": { units: [
                { code: "UET", subjects: [
                  { fr: "Informatique", ar: "إعلام آلي", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Langue Arabe", ar: "اللغة العربية", coef: 1, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Linguistique générale", ar: "لسانيات عامة", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Phonétique", ar: "صوتيات", coef: 2, credits: 3, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Expression écrite", ar: "تعبير كتابي", coef: 3, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Compréhension de texte", ar: "فهم النص", coef: 3, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 2": { units: [
                { code: "UET", subjects: [
                  { fr: "Informatique 2", ar: "إعلام آلي 2", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Langue Arabe 2", ar: "اللغة العربية 2", coef: 1, credits: 2, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Morphologie", ar: "صرف", coef: 2, credits: 3, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Syntaxe", ar: "نحو", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Expression orale", ar: "تعبير شفهي", coef: 3, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Littérature française", ar: "الأدب الفرنسي", coef: 3, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
        },
      },
      "L2": { specialties: {} }, "L3": { specialties: {} }, "M1": { specialties: {} }, "M2": { specialties: {} },
    },
  },
  "DROIT": {
    emoji: "⚖️",
    levels: {
      "L1": {
        specialties: {
          "Droit": {
            spAr: "الحقوق",
            semesters: {
              "Semestre 1": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère", ar: "لغة أجنبية", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Économie politique", ar: "اقتصاد سياسي", coef: 1, credits: 2, hasTD: false, hasCM: true, hasTP: false },
                  { fr: "Informatique juridique", ar: "إعلام آلي قانوني", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Introduction au droit", ar: "مدخل للقانون", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Droit constitutionnel", ar: "القانون الدستوري", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Théorie générale du droit", ar: "النظرية العامة للقانون", coef: 3, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Droit civil (biens)", ar: "القانون المدني (الأموال)", coef: 3, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 2": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère 2", ar: "لغة أجنبية 2", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Science politique", ar: "علم السياسة", coef: 1, credits: 2, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Droit administratif", ar: "القانون الإداري", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Droit international public", ar: "القانون الدولي العام", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Droit civil (obligations)", ar: "القانون المدني (الالتزامات)", coef: 3, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Droit pénal général", ar: "قانون العقوبات العام", coef: 3, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
        },
      },
      "L2": { specialties: {} }, "L3": { specialties: {} }, "M1": { specialties: {} }, "M2": { specialties: {} },
    },
  },
  "SH": {
    emoji: "🧠",
    levels: {
      "L1": {
        specialties: {
          "Psychologie": {
            spAr: "علم النفس",
            semesters: {
              "Semestre 1": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère", ar: "لغة أجنبية", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                  { fr: "Informatique", ar: "إعلام آلي", coef: 1, credits: 1, hasTD: true, hasCM: false, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Sociologie générale", ar: "علم الاجتماع العام", coef: 1, credits: 2, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Biologie et comportement", ar: "بيولوجيا والسلوك", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Statistiques appliquées", ar: "إحصاء تطبيقي", coef: 2, credits: 3, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Introduction à la psychologie", ar: "مدخل لعلم النفس", coef: 3, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Psychologie du développement", ar: "علم نفس النمو", coef: 3, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
              "Semestre 2": { units: [
                { code: "UET", subjects: [
                  { fr: "Langue étrangère 2", ar: "لغة أجنبية 2", coef: 1, credits: 1, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UED", subjects: [
                  { fr: "Anthropologie", ar: "أنثروبولوجيا", coef: 1, credits: 2, hasTD: false, hasCM: true, hasTP: false },
                ]},
                { code: "UEM", subjects: [
                  { fr: "Méthodes de recherche", ar: "مناهج البحث", coef: 2, credits: 3, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Neuropsychologie", ar: "علم الأعصاب النفسي", coef: 2, credits: 4, hasTD: true, hasCM: true, hasTP: false },
                ]},
                { code: "UEF", subjects: [
                  { fr: "Psychologie sociale", ar: "علم النفس الاجتماعي", coef: 3, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                  { fr: "Psychologie clinique", ar: "علم النفس الإكلينيكي", coef: 3, credits: 5, hasTD: true, hasCM: true, hasTP: false },
                ]},
              ]},
            },
          },
        },
      },
      "L2": { specialties: {} }, "L3": { specialties: {} }, "M1": { specialties: {} }, "M2": { specialties: {} },
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toNum = (v) => { const n = parseFloat(v); return isNaN(n) ? null : Math.min(20, Math.max(0, n)); };

const calcGrade = (subject, g) => {
  const { hasTD, hasCM, hasTP } = subject;
  const tdVal = toNum(g.td), tpVal = toNum(g.tp);
  // For CM: use max(cm, ratrapage) if ratrapage entered, else cm
  const cmRaw = toNum(g.cm);
  const ratVal = hasCM ? toNum(g.rat) : null;
  const cmVal = (cmRaw !== null && ratVal !== null) ? Math.max(cmRaw, ratVal)
              : (ratVal !== null) ? ratVal
              : cmRaw;
  if (hasCM && hasTD) { if (cmVal === null || tdVal === null) return null; return tdVal * 0.4 + cmVal * 0.6; }
  if (hasCM && hasTP) { if (cmVal === null || tpVal === null) return null; return tpVal * 0.4 + cmVal * 0.6; }
  if (hasCM) return cmVal;
  if (hasTD) return tdVal;
  if (hasTP) return tpVal;
  return null;
};

const hasAnyEntry = (g) => (g.td !== undefined && g.td !== "") || (g.cm !== undefined && g.cm !== "") || (g.tp !== undefined && g.tp !== "") || (g.rat !== undefined && g.rat !== "");

const mention = (n) => {
  if (n === null || n === undefined) return null;
  if (n >= 16) return { label: "Très bien / ممتاز",  bg: "#d1fae5", txt: "#065f46", bar: "#10b981" };
  if (n >= 14) return { label: "Bien / جيد جداً",    bg: "#dbeafe", txt: "#1e3a8a", bar: "#3b82f6" };
  if (n >= 12) return { label: "Assez bien / جيد",   bg: "#ede9fe", txt: "#4c1d95", bar: "#8b5cf6" };
  if (n >= 10) return { label: "Passable / مقبول",   bg: "#fef3c7", txt: "#78350f", bar: "#f59e0b" };
  return             { label: "Insuffisant / راسب", bg: "#fee2e2", txt: "#7f1d1d", bar: "#ef4444" };
};

const UE_COLORS = {
  UEF: { bg: "#ede9fe", txt: "#4c1d95", border: "#a78bfa" },
  UEM: { bg: "#dbeafe", txt: "#1e3a8a", border: "#93c5fd" },
  UED: { bg: "#fef3c7", txt: "#78350f", border: "#fcd34d" },
  UET: { bg: "#d1fae5", txt: "#065f46", border: "#6ee7b7" },
};

// UE avg: divides by totalCoef of the unit
const calcUnitAvg = (unit, grades) => {
  const totalCoef = unit.subjects.reduce((a, s) => a + s.coef, 0);
  const totalCredits = unit.subjects.reduce((a, s) => a + s.credits, 0);
  let sumW = 0, entered = 0;
  unit.subjects.forEach(s => {
    const note = calcGrade(s, grades[s.fr] || {});
    if (note === null) return;
    sumW += note * s.coef; entered += s.coef;
  });
  if (entered === 0) return null;
  return { avg: sumW / totalCoef, totalCoef, totalCredits, enteredCoef: entered };
};

// Semester stats: avg = Σ(note×coef) / totalCoefAll
const calcSemStats = (sem, grades) => {
  if (!sem) return null;
  const totalCoefAll = sem.units.flatMap(u => u.subjects).reduce((a, s) => a + s.coef, 0);
  const totalCredits = sem.units.flatMap(u => u.subjects).reduce((a, s) => a + s.credits, 0);
  let sumW = 0, entered = 0, passedCoef = 0;
  sem.units.forEach(u => {
    u.subjects.forEach(s => {
      const note = calcGrade(s, grades[s.fr] || {});
      if (note === null) return;
      sumW += note * s.coef; entered += s.coef;
      if (note >= 10) passedCoef += s.coef;
    });
  });
  if (entered === 0) return null;
  const avg = sumW / totalCoefAll;
  // Credits priority: semAvg>=10 → all; else UE avg>=10 → UE credits; else individual
  let passedCredits = 0;
  if (avg >= 10) {
    passedCredits = totalCredits;
  } else {
    sem.units.forEach(u => {
      const unitStats = calcUnitAvg(u, grades);
      if (unitStats && unitStats.avg >= 10) {
        passedCredits += unitStats.totalCredits;
      } else {
        u.subjects.forEach(s => {
          const note = calcGrade(s, grades[s.fr] || {});
          if (note !== null && note >= 10) passedCredits += s.credits;
        });
      }
    });
  }
  return { avg, sumW, totalCoefAll, totalCredits, enteredCoef: entered, passedCoef, passedCredits };
};

// ─── UI Components ────────────────────────────────────────────────────────────

function BilLabel({ obj, size = 12, bold = false }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
      <span style={{ fontSize: size, fontWeight: bold ? 500 : 400, color: "var(--color-text-primary)" }}>{obj.fr}</span>
      <span style={{ fontSize: size - 1, opacity: 0.35 }}>|</span>
      <span style={{ fontSize: size, fontWeight: bold ? 500 : 400, color: "var(--color-text-secondary)", direction: "rtl" }}>{obj.ar}</span>
    </span>
  );
}

function NoteInput({ value, onChange, label }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <span style={{ fontSize: 10, color: "var(--color-text-tertiary)", fontWeight: 600, letterSpacing: "0.05em" }}>{label}</span>
      <input
        type="number" min="0" max="20" step="0.25" value={value}
        onChange={(e) => { const v = e.target.value; if (v === "") { onChange(""); return; } const n = parseFloat(v); if (isNaN(n)) { onChange(""); return; } onChange(String(Math.min(20, Math.max(0, n)))); }}
        onBlur={() => setFocus(false)} onFocus={() => setFocus(true)}
        placeholder="—"
        style={{ width: 54, textAlign: "center", fontSize: 14, fontWeight: 500, padding: "5px 2px", borderRadius: 7, border: `2px solid ${focus ? "#6366f1" : "var(--color-border-secondary)"}`, background: "var(--color-background-primary)", color: "var(--color-text-primary)", outline: "none", transition: "border-color 0.15s" }}
      />
    </div>
  );
}

// Ratrapage input — orange column, shows which is higher
function RatInput({ value, onChange, cmVal }) {
  const [focus, setFocus] = useState(false);
  const hasVal = value !== "" && value !== undefined;
  const ratNum = parseFloat(value);
  const cmNum = parseFloat(cmVal);
  const ratWins = hasVal && !isNaN(ratNum) && !isNaN(cmNum) && ratNum > cmNum;
  const cmWins = hasVal && !isNaN(ratNum) && !isNaN(cmNum) && cmNum >= ratNum;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <input
        type="number" min="0" max="20" step="0.25" value={value}
        onChange={(e) => { const v = e.target.value; if (v === "") { onChange(""); return; } const n = parseFloat(v); if (isNaN(n)) { onChange(""); return; } onChange(String(Math.min(20, Math.max(0, n)))); }}
        onBlur={() => setFocus(false)} onFocus={() => setFocus(true)}
        placeholder="—"
        style={{ width: 54, textAlign: "center", fontSize: 14, fontWeight: 500, padding: "5px 2px", borderRadius: 7,
          border: `2px solid ${focus ? "#d97706" : hasVal ? "#d97706" : "var(--color-border-tertiary)"}`,
          background: ratWins ? "#fef3c7" : cmWins ? "#f1f5f9" : "var(--color-background-primary)",
          color: hasVal ? "#92400e" : "var(--color-text-primary)",
          outline: "none", transition: "all 0.15s" }}
      />
      {hasVal && !isNaN(ratNum) && !isNaN(cmNum) && (
        <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 20, fontWeight: 700,
          background: ratWins ? "#d97706" : "#94a3b8", color: "#fff" }}>
          {ratWins ? "✓ max" : "CM>R"}
        </span>
      )}
    </div>
  );
}

function NoField() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <span style={{ fontSize: 10, color: "transparent" }}>__</span>
      <div title="Non applicable / لا ينطبق" style={{ width: 54, height: 31, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, border: "1.5px dashed var(--color-border-tertiary)", color: "var(--color-text-tertiary)", fontSize: 13, fontWeight: 500 }}>✕</div>
    </div>
  );
}

function MBadge({ val, small }) {
  const m = mention(val);
  if (!m) return null;
  return <span style={{ fontSize: small ? 9 : 10, padding: "1px 6px", borderRadius: 20, background: m.bg, color: m.txt, fontWeight: 500, whiteSpace: "nowrap", lineHeight: 1.6 }}>{m.label}</span>;
}

// ─── Semester Table ───────────────────────────────────────────────────────────

function SemTable({ semKey, specialty, grades, onGradeChange }) {
  const sem = specialty?.semesters[semKey];
  if (!sem) return null;
  const [showRat, setShowRat] = useState(false);

  const stats = calcSemStats(sem, grades);
  const { avg, sumW, totalCoefAll, totalCredits, passedCoef, passedCredits } = stats || {};
  const m = mention(avg);

  // Check if any rat value entered (to show active state)
  const hasAnyRat = sem.units.flatMap(u => u.subjects).some(s => {
    const g = grades[s.fr] || {};
    return s.hasCM && g.rat !== undefined && g.rat !== "";
  });

  const semLabel = T.semLabels[semKey] || { fr: semKey, ar: semKey };

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Sem header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 15, fontWeight: 500, margin: 0, color: "var(--color-text-primary)" }}>
          <BilLabel obj={semLabel} size={15} bold />
        </h2>
        {avg != null && m && <>
          <span style={{ fontSize: 16, fontWeight: 500, color: m.txt }}>{avg.toFixed(2)} / 20</span>
          <MBadge val={avg} />
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#d1fae5", color: "#065f46", fontWeight: 500 }}>
            ✓ {passedCoef} coef · {passedCredits}/{totalCredits} cr.
          </span>
        </>}
        {/* Toggle Rattrapage */}
        <button
          onClick={() => setShowRat(v => !v)}
          style={{
            marginLeft: "auto", display: "flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600,
            border: `2px solid ${showRat || hasAnyRat ? "#d97706" : "var(--color-border-secondary)"}`,
            background: showRat ? "#fef3c7" : hasAnyRat ? "#fff7ed" : "var(--color-background-primary)",
            color: showRat || hasAnyRat ? "#92400e" : "var(--color-text-secondary)",
            transition: "all 0.2s",
          }}>
          <span style={{ fontSize: 14 }}>🔄</span>
          <span>Rattrapage</span>
          <span style={{ direction: "rtl", fontSize: 11, opacity: 0.8 }}>استدراكي</span>
          {hasAnyRat && !showRat && (
            <span style={{ background: "#d97706", color: "#fff", borderRadius: 20, fontSize: 9, padding: "1px 6px", fontWeight: 700 }}>●</span>
          )}
        </button>
      </div>

      <div style={{ overflowX: "auto", borderRadius: 12, border: "0.5px solid var(--color-border-tertiary)", WebkitOverflowScrolling: "touch" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
          <thead>
            <tr>
              {(showRat
                ? [
                    [{ fr: "Matière", ar: "المادة" }, "left", "25%"],
                    [{ fr: "UE", ar: "الوحدة" }, "center", "6%"],
                    [{ fr: "Coef", ar: "المعامل" }, "center", "5%"],
                    [{ fr: "Crédits", ar: "الأرصدة" }, "center", "6%"],
                    [{ fr: "TD/TP", ar: "" }, "center", "9%"],
                    [{ fr: "CM/Exam", ar: "الامتحان" }, "center", "9%"],
                    [{ fr: "Rattrapage", ar: "استدراكي" }, "center", "9%"],
                    [{ fr: "Moy. Matière", ar: "معدل المادة" }, "center", "13%"],
                    [{ fr: "Moy. UE", ar: "معدل الوحدة" }, "center", "13%"],
                  ]
                : [
                    [{ fr: "Matière", ar: "المادة" }, "left", "28%"],
                    [{ fr: "UE", ar: "الوحدة" }, "center", "7%"],
                    [{ fr: "Coef", ar: "المعامل" }, "center", "6%"],
                    [{ fr: "Crédits", ar: "الأرصدة" }, "center", "7%"],
                    [{ fr: "TD/TP", ar: "" }, "center", "10%"],
                    [{ fr: "CM/Exam", ar: "الامتحان" }, "center", "10%"],
                    [{ fr: "Moy. Matière", ar: "معدل المادة" }, "center", "14%"],
                    [{ fr: "Moy. UE", ar: "معدل الوحدة" }, "center", "18%"],
                  ]
              ).map(([h, align, w], i) => (
                <th key={i} style={{ padding: "9px 8px", fontWeight: 500, fontSize: 10, background: (showRat && i === 6) ? "#d97706" : "#4f46e5", color: "#fff", textAlign: align, width: w, borderRight: "0.5px solid rgba(255,255,255,0.15)", whiteSpace: "nowrap" }}>
                  <span style={{ display: "block" }}>{h.fr}</span>
                  {h.ar && <span style={{ display: "block", opacity: 0.75, fontSize: 9, direction: "rtl" }}>{h.ar}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sem.units.map((unit, ui) => {
              const ue = UE_COLORS[unit.code] || { bg: "#f1f5f9", txt: "#475569", border: "#cbd5e1" };
              const ueLabel = T.ueLabels[unit.code] || { fr: unit.code, ar: unit.code };
              const unitStats = calcUnitAvg(unit, grades);
              const unitPassing = unitStats && unitStats.avg >= 10;
              const unitM = mention(unitStats?.avg ?? null);
              const unitRowspan = unit.subjects.length;

              return unit.subjects.map((s, si) => {
                const g = grades[s.fr] || {};
                const note = calcGrade(s, g);
                const subPassing = note !== null && note >= 10;
                // Credits validated if: semAvg>=10 OR unitAvg>=10 OR subject>=10
                const semPassing = avg != null && avg >= 10;
                const creditsByUE = unitPassing || semPassing;
                const incomplete = hasAnyEntry(g) && note === null;
                const sm = mention(note);
                const rowBg = subPassing ? "rgba(16,185,129,0.07)" : (note !== null && note < 10) ? "rgba(239,68,68,0.05)" : si % 2 === 0 ? "var(--color-background-primary)" : "var(--color-background-secondary)";
                const isFirst = si === 0;

                return (
                  <tr key={s.fr} style={{ borderTop: isFirst && ui > 0 ? `2px solid ${ue.border}` : "0.5px solid var(--color-border-tertiary)", background: rowBg }}>
                    {/* Matière */}
                    <td style={{ padding: "8px 10px" }}>
                      {isFirst && (
                        <div style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: ue.bg, color: ue.txt }}>{unit.code}</span>
                          <span style={{ fontSize: 10, color: ue.txt, opacity: 0.8 }}>{ueLabel.fr}</span>
                          <span style={{ fontSize: 9, color: ue.txt, opacity: 0.6, direction: "rtl" }}>{ueLabel.ar}</span>
                        </div>
                      )}
                      <div style={{ fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1.3, fontSize: 13 }}>{s.fr}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-secondary)", direction: "rtl", marginTop: 1 }}>{s.ar}</div>
                    </td>
                    {/* UE badge */}
                    <td style={{ padding: "8px 5px", textAlign: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 20, background: ue.bg, color: ue.txt }}>{unit.code}</span>
                    </td>
                    {/* Coef */}
                    <td style={{ padding: "8px 5px", textAlign: "center", fontWeight: 500, color: "var(--color-text-primary)" }}>{s.coef}</td>
                    {/* Crédits — green if subject passes OR UE passes */}
                    <td style={{ padding: "8px 5px", textAlign: "center" }}>
                      <span style={{
                        fontWeight: 500, fontSize: 13,
                        color: (subPassing || creditsByUE) ? "#065f46" : "var(--color-text-secondary)",
                        background: (subPassing || creditsByUE) ? "#d1fae5" : "transparent",
                        padding: (subPassing || creditsByUE) ? "1px 7px" : "0",
                        borderRadius: 20,
                      }}>
                        {s.credits}{(subPassing || creditsByUE) ? " ✓" : ""}
                      </span>
                    </td>
                    {/* TD/TP */}
                    <td style={{ padding: "6px 5px", textAlign: "center" }}>
                      {(s.hasTD || s.hasTP)
                        ? <NoteInput value={s.hasTD ? (g.td ?? "") : (g.tp ?? "")} onChange={(v) => onGradeChange(s.fr, s.hasTD ? "td" : "tp", v)} label={s.hasTD ? "TD" : "TP"} />
                        : <NoField />}
                    </td>
                    {/* CM */}
                    <td style={{ padding: "6px 5px", textAlign: "center" }}>
                      {s.hasCM
                        ? <NoteInput value={g.cm ?? ""} onChange={(v) => onGradeChange(s.fr, "cm", v)} label="CM" />
                        : <NoField />}
                    </td>
                    {/* Rattrapage column — only visible when showRat=true */}
                    {showRat && (() => {
                      // 3-level exemption logic
                      const semExempt  = avg != null && avg >= 10;          // semAvg >= 10 → all exempt
                      const ueExempt   = unitPassing;                        // UE avg >= 10 → this UE exempt
                      const subExempt  = note !== null && note >= 10;        // subject >= 10 → this subject exempt
                      const exempt     = semExempt || ueExempt || subExempt;
                      const exemptReason = semExempt ? { label: "Moy.Sem ≥ 10", ar: "المعدل ≥ 10" }
                                        : ueExempt  ? { label: "Moy.UE ≥ 10",  ar: "الوحدة ≥ 10" }
                                        : subExempt ? { label: "Moy. ≥ 10",     ar: "المقياس ≥ 10" }
                                        : null;
                      return (
                        <td style={{ padding: "5px 4px", textAlign: "center",
                          background: exempt ? "#f0fdf4" : "#fffbeb",
                          borderLeft: `2px solid ${exempt ? "#86efac" : "#fed7aa"}` }}>
                          {exempt ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                              <span style={{ fontSize: 13 }}>✅</span>
                              <span style={{ fontSize: 8, color: "#065f46", fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>{exemptReason.label}</span>
                              <span style={{ fontSize: 8, color: "#065f46", opacity: 0.75, direction: "rtl" }}>{exemptReason.ar}</span>
                            </div>
                          ) : s.hasCM ? (
                            <RatInput value={g.rat ?? ""} onChange={(v) => onGradeChange(s.fr, "rat", v)} cmVal={g.cm} />
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                              <span style={{ fontSize: 10, color: "#d97706", opacity: 0.5 }}>—</span>
                              <span style={{ fontSize: 8, color: "#d97706", opacity: 0.4 }}>pas de CM</span>
                            </div>
                          )}
                        </td>
                      );
                    })()}
                    {/* Moyenne matière */}
                    <td style={{ padding: "8px 8px", textAlign: "center" }}>
                      {note !== null && sm ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                          <span style={{ fontSize: 15, fontWeight: 500, color: sm.txt }}>{note.toFixed(2)}</span>
                          <div style={{ width: 58, height: 4, borderRadius: 2, background: "var(--color-border-tertiary)" }}>
                            <div style={{ height: "100%", width: `${(note / 20) * 100}%`, background: sm.bar, borderRadius: 2 }} />
                          </div>
                          <MBadge val={note} small />
                        </div>
                      ) : incomplete ? (
                        <span style={{ fontSize: 10, color: "#d97706", background: "#fef3c7", padding: "2px 6px", borderRadius: 20 }}>ناقص / incomplet</span>
                      ) : <span style={{ color: "var(--color-text-tertiary)" }}>—</span>}
                    </td>
                    {/* Moyenne UE — rowspan on first row */}
                    {isFirst && (
                      <td rowSpan={unitRowspan} style={{ padding: "8px 8px", textAlign: "center", borderLeft: `2px solid ${ue.border}`, background: ue.bg + "55", verticalAlign: "middle" }}>
                        {unitStats ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 15, fontWeight: 500, color: unitM?.txt }}>{unitStats.avg.toFixed(2)}</span>
                            <div style={{ width: 52, height: 3, borderRadius: 2, background: "rgba(0,0,0,0.1)" }}>
                              <div style={{ height: "100%", width: `${(unitStats.avg / 20) * 100}%`, background: unitM?.bar, borderRadius: 2 }} />
                            </div>
                            <MBadge val={unitStats.avg} small />
                            {unitPassing && (
                              <span style={{ fontSize: 9, color: "#065f46", background: "#d1fae5", padding: "1px 6px", borderRadius: 20, fontWeight: 500 }}>
                                {unitStats.totalCredits} cr. ✓
                              </span>
                            )}
                            <span style={{ fontSize: 9, color: ue.txt, opacity: 0.65 }}>{unitStats.enteredCoef}/{unitStats.totalCoef} coef</span>
                          </div>
                        ) : <span style={{ color: ue.txt, opacity: 0.4, fontSize: 12 }}>—</span>}
                      </td>
                    )}
                  </tr>
                );
              });
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: "#4f46e5", borderTop: "2px solid #4338ca" }}>
              <td colSpan={2} style={{ padding: "9px 10px", color: "#fff", fontWeight: 500, fontSize: 12 }}>
                <span>{T.moySem.fr}</span>
                <span style={{ display: "block", fontSize: 9, opacity: 0.65, direction: "rtl" }}>{T.moySem.ar} — Σ(n×c)/{totalCoefAll ?? "?"}</span>
              </td>
              <td style={{ padding: "9px 5px", textAlign: "center", color: "#fff", fontWeight: 500 }}>{totalCoefAll ?? "—"}</td>
              <td style={{ padding: "9px 5px", textAlign: "center" }}>
                {(passedCredits ?? 0) > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <span style={{ fontSize: 11, background: "#d1fae5", color: "#065f46", padding: "2px 7px", borderRadius: 20, fontWeight: 500 }}>{passedCredits}/{totalCredits} ✓</span>
                    {avg != null && avg >= 10 && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.7)" }}>Moy.sem ≥ 10</span>}
                  </div>
                ) : <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{totalCredits ?? "—"}</span>}
              </td>
              <td colSpan={2} />
              <td style={{ padding: "9px 8px", textAlign: "center" }}>
                {avg != null ? (
                  <div>
                    <span style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>{avg.toFixed(2)} / 20</span>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>{sumW?.toFixed(2)} ÷ {totalCoefAll}</div>
                  </div>
                ) : <span style={{ color: "rgba(255,255,255,0.4)" }}>—</span>}
              </td>
              <td style={{ padding: "9px 8px", textAlign: "center", borderLeft: "2px solid rgba(255,255,255,0.2)" }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>{T.moyUE.fr} / {T.moyUE.ar}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── Selection Screens ────────────────────────────────────────────────────────

function SelectionCard({ emoji, titleFr, titleAr, subFr, subAr, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? "#ede9fe" : "var(--color-background-primary)", border: `1.5px solid ${hov ? "#6366f1" : "var(--color-border-secondary)"}`, borderRadius: 14, padding: "18px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      {emoji && <span style={{ fontSize: 26 }}>{emoji}</span>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1.3, flex: 1 }}>{titleFr}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", direction: "rtl", flex: 1, textAlign: "right", lineHeight: 1.3 }}>{titleAr}</span>
      </div>
      {(subFr || subAr) && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{subFr}</span>
          <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", direction: "rtl" }}>{subAr}</span>
        </div>
      )}
    </button>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", color: "#6366f1", fontSize: 13, fontWeight: 500, marginBottom: 20, padding: 0, display: "flex", alignItems: "center", gap: 8 }}>
      <span>{T.back.fr}</span><span style={{ opacity: 0.5 }}>|</span><span style={{ direction: "rtl" }}>{T.back.ar}</span>
    </button>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App({ onBack }) {
  const [facKey, setFacKey] = useState(null);
  const [levelKey, setLevelKey] = useState(null);
  const [spKey, setSpKey] = useState(null);
 const { grades, updateGrade, resetGrades } = useLocalGrades(facKey, levelKey, spKey);
  const [tab, setTab] = useState("s1");

  const facData = facKey ? FACULTIES[facKey] : null;
  const levelData = facData && levelKey ? facData.levels[levelKey] : null;
  const spData = levelData && spKey ? levelData.specialties[spKey] : null;

 const onChange = updateGrade;

  const getStats = (semKey) => spData ? calcSemStats(spData.semesters[semKey], grades) : null;
  // Detect which semester keys this specialty uses (S1/S2 or S3/S4)
  const semKeys = spData ? Object.keys(spData.semesters) : ["Semestre 1", "Semestre 2"];
  const semKey1 = semKeys[0] || "Semestre 1";
  const semKey2 = semKeys[1] || "Semestre 2";
  const s1 = getStats(semKey1);
  const s2 = getStats(semKey2);

  // Annual avg requires BOTH semesters to have entered grades
  const annual = (() => {
    if (!s1 || !s2) return null;
    const coefA = s1.totalCoefAll, coefB = s2.totalCoefAll;
    const t = coefA + coefB;
    if (t === 0) return null;
    return (s1.avg * coefA + s2.avg * coefB) / t;
  })();

  // Tab config: each tab has its own color scheme
  const sl1 = T.semLabels[semKey1] || { fr: semKey1, ar: semKey1 };
  const sl2 = T.semLabels[semKey2] || { fr: semKey2, ar: semKey2 };
  const TAB_CONFIG = {
    s1:   { fr: sl1.fr, ar: sl1.ar, icon: "①", active: { bg: "#4f46e5", border: "#4338ca", txt: "#fff", shadow: "0 4px 14px rgba(79,70,229,0.4)" }, hover: { bg: "#ede9fe", border: "#6366f1", txt: "#4f46e5" } },
    s2:   { fr: sl2.fr, ar: sl2.ar, icon: "②", active: { bg: "#0891b2", border: "#0e7490", txt: "#fff", shadow: "0 4px 14px rgba(8,145,178,0.4)" }, hover: { bg: "#cffafe", border: "#0891b2", txt: "#0e7490" } },
    both: { fr: T.full.fr, ar: T.full.ar, icon: "⊞", active: { bg: "#059669", border: "#047857", txt: "#fff", shadow: "0 4px 14px rgba(5,150,105,0.4)" }, hover: { bg: "#d1fae5", border: "#059669", txt: "#047857" } },
  };
  const [hovTab, setHovTab] = useState(null);

  const wrap = (children) => (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "1.5rem 1rem 3rem", fontFamily: "var(--font-sans)", overflowY: "auto", WebkitOverflowScrolling: "touch", height: "100%", boxSizing: "border-box" }}>
      {children}
    </div>
  );

  const header = (
    <div style={{ textAlign: "center", marginBottom: 28, position: "relative" }}>
      {onBack && (
        <button onClick={onBack} title="الواجهة الترحيبية" style={{
          position: "absolute", top: 0, left: 0,
          background: "rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.18)",
          borderRadius: 10, padding: "6px 10px", cursor: "pointer",
          color: "#6366f1", fontSize: 11, fontWeight: 600, display: "flex",
          alignItems: "center", gap: 5, transition: "all 0.15s",
          fontFamily: "var(--font-sans)",
        }}>
          <span style={{ fontSize: 14 }}>🏠</span>
          <span style={{ direction: "rtl" }}>الرئيسية</span>
        </button>
      )}
      <div style={{ width: 52, height: 52, borderRadius: 14, background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontSize: 24 }}>🎓</div>
      <BilLabel obj={T.appTitle} size={20} bold />
      <div style={{ marginTop: 4 }}><BilLabel obj={T.lmd} size={12} /></div>
    </div>
  );

  // ── Screen 1: Faculty
  if (!facKey) return wrap(
    <>
      {header}
      <div style={{ marginBottom: 16, textAlign: "center" }}><BilLabel obj={T.chooseFac} size={14} bold /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {Object.entries(FACULTIES).map(([key, fac]) => {
          const name = T.facNames[key];
          const levelsWithSp = Object.entries(fac.levels).filter(([, l]) => Object.keys(l.specialties).length > 0);
          return (
            <SelectionCard key={key} emoji={fac.emoji} titleFr={name.fr} titleAr={name.ar}
              subFr={`${levelsWithSp.length} niveau(x)`} subAr={`${levelsWithSp.length} مستوى`}
              onClick={() => setFacKey(key)} />
          );
        })}
      </div>
    </>
  );

  // ── Screen 2: Level
  if (!levelKey) {
    const fac = FACULTIES[facKey];
    const facName = T.facNames[facKey];
    return wrap(
      <>
        <BackBtn onClick={() => setFacKey(null)} />
        <div style={{ display: "flex", gap: 10, marginBottom: 20, padding: "14px 16px", borderRadius: 12, background: "var(--color-background-secondary)", alignItems: "center" }}>
          <span style={{ fontSize: 26 }}>{fac.emoji}</span>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{facName.fr}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", direction: "rtl" }}>{facName.ar}</span>
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 14, textAlign: "center" }}><BilLabel obj={T.chooseLevel} size={14} bold /></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 40 }}>
          {Object.entries(fac.levels).map(([lk, lv]) => {
            const lb = T.levels[lk];
            const spCount = Object.keys(lv.specialties).length;
            return (
              <SelectionCard key={lk} emoji={null} titleFr={`${lk} — ${lb.fr}`} titleAr={lb.ar}
                subFr={spCount > 0 ? `${spCount} spécialité(s)` : "Bientôt disponible"}
                subAr={spCount > 0 ? `${spCount} تخصص` : "قريباً"}
                onClick={spCount > 0 ? () => setLevelKey(lk) : undefined} />
            );
          })}
        </div>
      </>
    );
  }

  // ── Screen 3: Specialty
  if (!spKey) {
    const fac = FACULTIES[facKey];
    const facName = T.facNames[facKey];
    const lv = fac.levels[levelKey];
    const lb = T.levels[levelKey];
    return wrap(
      <>
        <BackBtn onClick={() => setLevelKey(null)} />
        <div style={{ marginBottom: 20, padding: "14px 16px", borderRadius: 12, background: "var(--color-background-secondary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{facName.fr}</span>
            <span style={{ fontSize: 12, color: "var(--color-text-secondary)", direction: "rtl" }}>{facName.ar}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{levelKey} — {lb.fr}</span>
            <span style={{ fontSize: 14, fontWeight: 500, direction: "rtl" }}>{lb.ar}</span>
          </div>
        </div>
        <div style={{ marginBottom: 14, textAlign: "center" }}><BilLabel obj={T.chooseSp} size={14} bold /></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 40 }}>
          {Object.entries(lv.specialties).map(([sk, sv]) => (
            <SelectionCard key={sk} emoji={null} titleFr={sk} titleAr={sv.spAr}
              onClick={() => { setSpKey(sk); resetGrades(); setTab("s1"); }} />
          ))}
          <div style={{ textAlign: "center", paddingTop: 8, fontSize: 12, color: "var(--color-text-tertiary)" }}>
            {Object.keys(lv.specialties).length} تخصص متاح · {Object.keys(lv.specialties).length} spécialités
          </div>
        </div>
      </>
    );
  }

  // ── Screen 4: Calculator
  const fac = FACULTIES[facKey];
  const facName = T.facNames[facKey];
  const lb = T.levels[levelKey];

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "1rem", fontFamily: "var(--font-sans)", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      {/* Header bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10, padding: "12px 16px", borderRadius: 12, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{fac.emoji}</span>
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{spKey}</span>
              <span style={{ fontSize: 11, opacity: 0.45 }}>|</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", direction: "rtl" }}>{spData?.spAr}</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
              <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{facName.fr} · {levelKey} – {lb.fr}</span>
              <span style={{ fontSize: 10, opacity: 0.35 }}>|</span>
              <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", direction: "rtl" }}>{facName.ar} · {lb.ar}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {onBack && (
            <button onClick={onBack}
              style={{ fontSize: 12, color: "#6366f1", background: "#ede9fe", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
              <span>🏠</span>
            </button>
          )}
          <button onClick={() => { setFacKey(null); setLevelKey(null); setSpKey(null); setGrades({}); }}
            style={{ fontSize: 12, color: "#6366f1", background: "#ede9fe", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 500 }}>
            {T.change.fr} / {T.change.ar}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {(s1 || s2 || annual !== null) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
          {[
            { semKey: semKey1, stats: s1 },
            { semKey: semKey2, stats: s2 },
            { semKey: null, val: annual },
          ].map(({ semKey: sk, stats, val }, idx) => {
            const v = val !== undefined ? val : stats?.avg;
            const semLb = sk ? (T.semLabels[sk] || { fr: sk, ar: sk }) : null;
            const labFr = sk ? semLb.fr : T.annuelle.fr;
            const labAr = sk ? semLb.ar : T.annuelle.ar;
            if (v == null) return (
              <div key={idx} style={{ background: "var(--color-background-secondary)", borderRadius: 12, padding: "12px 14px", border: "0.5px solid var(--color-border-tertiary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontWeight: 500 }}>{labFr}</span>
                  <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", direction: "rtl" }}>{labAr}</span>
                </div>
                <p style={{ margin: "8px 0 0", fontSize: 22, color: "var(--color-text-tertiary)" }}>—</p>
              </div>
            );
            const cm = mention(v);
            return (
              <div key={idx} style={{ background: cm.bg, borderRadius: 12, padding: "12px 14px", border: `1px solid ${cm.bar}33` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: cm.txt }}>{labFr}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: cm.txt, direction: "rtl" }}>{labAr}</span>
                </div>
                {stats && <p style={{ margin: "1px 0", fontSize: 10, color: cm.txt, opacity: 0.85 }}>✓ {stats.passedCoef} coef · {stats.passedCredits} cr.</p>}
                {!sk && s1 && s2 && <p style={{ margin: "1px 0", fontSize: 9, color: cm.txt, opacity: 0.65 }}>({s1.avg.toFixed(2)}×{s1.totalCoefAll}+{s2.avg.toFixed(2)}×{s2.totalCoefAll})÷{s1.totalCoefAll+s2.totalCoefAll}</p>}
                <p style={{ margin: "6px 0 2px", fontSize: 24, fontWeight: 500, color: cm.txt }}>{v.toFixed(2)}</p>
                <MBadge val={v} />
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {Object.entries(TAB_CONFIG).map(([t, cfg]) => {
          const isActive = tab === t;
          const isHov = hovTab === t && !isActive;
          const accentColor = cfg.active.bg;
          const borderColor = cfg.active.border;
          return (
            <button key={t}
              onClick={() => setTab(t)}
              onMouseEnter={() => setHovTab(t)}
              onMouseLeave={() => setHovTab(null)}
              style={{
                padding: 0, cursor: "pointer", outline: "none", flex: "1 1 0", minWidth: 130,
                borderRadius: 14, transition: "all 0.2s",
                background: isActive ? accentColor : isHov ? cfg.hover.bg : "var(--color-background-primary)",
                border: `2px solid ${isActive ? borderColor : isHov ? cfg.hover.border : "var(--color-border-secondary)"}`,
                boxShadow: isActive ? cfg.active.shadow : isHov ? `0 2px 8px ${accentColor}33` : "0 1px 3px rgba(0,0,0,0.07)",
                transform: isActive ? "translateY(-3px) scale(1.02)" : isHov ? "translateY(-1px)" : "none",
                overflow: "hidden",
              }}>
              {/* Bottom underline bar — thicker when active */}
              <div style={{ height: 0 }} />
              <div style={{ padding: "14px 18px 12px", display: "flex", flexDirection: "column", gap: 6, position: "relative" }}>
                {/* Icon + FR label */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                    background: isActive ? "rgba(255,255,255,0.2)" : isHov ? cfg.hover.border + "22" : accentColor + "15",
                    fontSize: 14, fontWeight: 700,
                    color: isActive ? "#fff" : isHov ? cfg.hover.txt : accentColor,
                    transition: "all 0.2s",
                  }}>{cfg.icon}</div>
                  <span style={{
                    fontSize: 14, fontWeight: 600,
                    color: isActive ? "#fff" : isHov ? cfg.hover.txt : accentColor,
                    letterSpacing: "0.01em",
                    textDecoration: !isActive ? "underline" : "none",
                    textDecorationColor: !isActive ? accentColor + "88" : "transparent",
                    textUnderlineOffset: "3px",
                    transition: "all 0.2s",
                  }}>{cfg.fr}</span>
                </div>
                {/* AR label */}
                <span style={{
                  fontSize: 12, fontWeight: 500,
                  color: isActive ? "rgba(255,255,255,0.88)" : isHov ? cfg.hover.txt : "var(--color-text-secondary)",
                  direction: "rtl", textAlign: "right",
                  borderBottom: !isActive ? `1.5px solid ${accentColor}55` : "none",
                  paddingBottom: !isActive ? 2 : 0,
                  transition: "all 0.2s",
                }}>{cfg.ar}</span>
                {/* Active indicator pill */}
                {isActive && (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ background: "rgba(255,255,255,0.3)", borderRadius: 20, padding: "1px 8px", fontSize: 9, color: "#fff", fontWeight: 600, letterSpacing: "0.05em" }}>
                      ACTIF ✓
                    </div>
                  </div>
                )}
              </div>
              {/* Bottom highlight bar */}
              <div style={{ height: 3, background: isActive ? "rgba(255,255,255,0.35)" : isHov ? borderColor : "transparent", transition: "background 0.2s" }} />
            </button>
          );
        })}
      </div>

      {(tab === "s1" || tab === "both") && <SemTable semKey={semKey1} specialty={spData} grades={grades} onGradeChange={onChange} />}
      {(tab === "s2" || tab === "both") && <SemTable semKey={semKey2} specialty={spData} grades={grades} onGradeChange={onChange} />}

      {/* Annual banner */}
      {tab === "both" && annual !== null && (() => {
        const am = mention(annual);
        return (
          <div style={{ background: am.bg, border: `1px solid ${am.bar}44`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: am.txt }}>{T.annuelle.fr}</span>
                <span style={{ opacity: 0.4 }}>|</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: am.txt, direction: "rtl" }}>{T.annuelle.ar}</span>
              </div>
              <p style={{ margin: "3px 0 0", fontSize: 10, color: am.txt, opacity: 0.7 }}>
                ({sl1.fr}: {s1?.avg.toFixed(2)}×{s1?.totalCoefAll} + {sl2.fr}: {s2?.avg.toFixed(2)}×{s2?.totalCoefAll}) ÷ {(s1?.totalCoefAll ?? 0)+(s2?.totalCoefAll ?? 0)}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: 32, fontWeight: 500, color: am.txt }}>{annual.toFixed(2)}</p>
              <MBadge val={annual} />
            </div>
          </div>
        );
      })()}

      {/* Legend */}
      <div style={{ padding: "9px 12px", borderRadius: 10, background: "var(--color-background-secondary)", fontSize: 10, color: "var(--color-text-secondary)", display: "flex", flexWrap: "wrap", gap: 10 }}>
        <span>TD/TP × 0.4 + CM × 0.6</span><span style={{ opacity: 0.4 }}>|</span>
        <span>Moy. sem = Σ(n×c) / Σcoef total</span><span style={{ opacity: 0.4 }}>|</span>
        <span style={{ color: "#065f46" }}>✓ Crédits UE si Moy.UE ≥ 10 (même si matière &lt; 10)</span><span style={{ opacity: 0.4 }}>|</span>
        <span>✕ = non applicable</span>
        <span style={{ opacity: 0.4 }}>|</span>
        <span style={{ color: "#d97706" }}>🔄 Rattrapage = max(CM, R) — activer avec le bouton par sémestre</span>
      </div>
    </div>
  );
}
