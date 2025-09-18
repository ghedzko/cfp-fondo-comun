'use client';

// Preload functions for better UX - loads components on hover/focus
export const preloadComponents = {
  reports: () => import('@/app/dashboard/reports/page'),
  monthlyReports: () => import('@/app/dashboard/reports/monthly/page'),
  audit: () => import('@/app/dashboard/audit/page'),
  invoices: () => import('@/app/dashboard/invoices/page'),
  students: () => import('@/app/dashboard/estudiantes/page'),
  courses: () => import('@/app/dashboard/cursos/page'),
  contributions: () => import('@/app/dashboard/aportes/page')
};

// Utility hook to preload components on hover/focus for better UX
export function usePreloadOnHover(componentKey: keyof typeof preloadComponents) {
  const preload = () => {
    preloadComponents[componentKey]();
  };

  return {
    onMouseEnter: preload,
    onFocus: preload
  };
}
