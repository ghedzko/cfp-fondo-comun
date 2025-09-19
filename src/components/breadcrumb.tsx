'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const pathname = usePathname();
  
  // Generate breadcrumb items from pathname if not provided
  const breadcrumbItems = items || generateBreadcrumbItems(pathname);

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300 ${className}`}
    >
      <Link 
        href="/dashboard" 
        className="flex items-center hover:text-gray-900 dark:hover:text-white transition-colors"
        aria-label="Ir al dashboard"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {item.href && index < breadcrumbItems.length - 1 ? (
            <Link 
              href={item.href}
              className="hover:text-gray-900 dark:hover:text-white transition-colors flex items-center"
            >
              {item.icon && <item.icon className="w-4 h-4 mr-1" />}
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium flex items-center">
              {item.icon && <item.icon className="w-4 h-4 mr-1" />}
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];
  
  // Skip 'dashboard' as it's handled by the Home icon
  const relevantSegments = segments.slice(1);
  
  for (let i = 0; i < relevantSegments.length; i++) {
    const segment = relevantSegments[i];
    const href = i < relevantSegments.length - 1 
      ? `/dashboard/${relevantSegments.slice(0, i + 1).join('/')}`
      : undefined;
    
    // Handle dynamic segments and special cases
    let label = segment;
    
    switch (segment) {
      case 'cursos':
        label = 'Cursos';
        break;
      case 'estudiantes':
        label = 'Estudiantes';
        break;
      case 'users':
        label = 'Usuarios';
        break;
      case 'aportes':
        label = 'Aportes';
        break;
      case 'reports':
        label = 'Reportes';
        break;
      case 'audit':
        label = 'Auditoría';
        break;
      case 'invoices':
        label = 'Facturas';
        break;
      case 'profile':
        label = 'Perfil';
        break;
      case 'nuevo':
        label = 'Nuevo';
        break;
      case 'nuevo-periodo':
        label = 'Nuevo Período';
        break;
      case 'matricular':
        label = 'Matricular';
        break;
      case 'periodos':
        label = 'Períodos';
        break;
      case 'generate':
        label = 'Generar';
        break;
      case 'monthly':
        label = 'Mensual';
        break;
      default:
        // For dynamic segments (IDs), keep them as is but truncate if too long
        if (segment.length > 20) {
          label = segment.substring(0, 20) + '...';
        }
        break;
    }
    
    items.push({ label, href });
  }
  
  return items;
}

// Hook for custom breadcrumb management
export function useBreadcrumb() {
  const [customItems, setCustomItems] = React.useState<BreadcrumbItem[]>([]);
  
  const setBreadcrumb = React.useCallback((items: BreadcrumbItem[]) => {
    setCustomItems(items);
  }, []);
  
  const clearBreadcrumb = React.useCallback(() => {
    setCustomItems([]);
  }, []);
  
  return {
    items: customItems,
    setBreadcrumb,
    clearBreadcrumb
  };
}
