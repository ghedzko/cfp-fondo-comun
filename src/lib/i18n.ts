/**
 * Internationalization utilities for CFP Fondo Común
 * Currently supports Spanish (es-AR) with structure for future expansion
 */

// Language type for future expansion
export type Language = 'es-AR' | 'en-US';

// Supported languages (currently only es-AR)
export type SupportedLanguage = 'es-AR';

// Default language
export const DEFAULT_LANGUAGE: SupportedLanguage = 'es-AR';

// Accessibility labels and messages
export const a11yLabels = {
  'es-AR': {
    // Form labels
    required: 'requerido',
    optional: 'opcional',
    
    // Loading states
    loading: 'Cargando...',
    
    // Form validation
    singleError: 'Hay 1 error en el formulario',
    multipleErrors: (count: number) => `Hay ${count} errores en el formulario`,
    
    // Navigation
    skipToContent: 'Saltar al contenido principal',
    goBack: 'Volver',
    close: 'Cerrar',
    
    // Actions
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    view: 'Ver',
    export: 'Exportar',
    
    // Status
    success: 'Éxito',
    error: 'Error',
    warning: 'Advertencia',
    info: 'Información',
    
    // Pagination
    previous: 'Anterior',
    next: 'Siguiente',
    page: 'Página',
    of: 'de',
    
    // Search and filters
    search: 'Buscar',
    filter: 'Filtrar',
    clearFilters: 'Limpiar filtros',
    noResults: 'No se encontraron resultados',
    
    // Dates
    today: 'Hoy',
    yesterday: 'Ayer',
    tomorrow: 'Mañana',
    
    // File operations
    upload: 'Subir',
    download: 'Descargar',
    
    // Confirmation
    areYouSure: '¿Estás seguro?',
    confirmDelete: '¿Estás seguro de que quieres eliminar este elemento?',
    unsavedChanges: 'Tienes cambios sin guardar. ¿Quieres continuar?'
  },
  
  // Future English support
  'en-US': {
    required: 'required',
    optional: 'optional',
    loading: 'Loading...',
    singleError: 'There is 1 error in the form',
    multipleErrors: (count: number) => `There are ${count} errors in the form`,
    skipToContent: 'Skip to main content',
    goBack: 'Go back',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    export: 'Export',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    search: 'Search',
    filter: 'Filter',
    clearFilters: 'Clear filters',
    noResults: 'No results found',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    upload: 'Upload',
    download: 'Download',
    areYouSure: 'Are you sure?',
    confirmDelete: 'Are you sure you want to delete this item?',
    unsavedChanges: 'You have unsaved changes. Do you want to continue?'
  }
} as const;

// Get label by key and language
export function getA11yLabel(key: keyof typeof a11yLabels['es-AR'], language: Language = DEFAULT_LANGUAGE): string {
  const labels = a11yLabels[language];
  const label = labels[key];
  
  if (typeof label === 'function') {
    // For functions like multipleErrors, return a wrapper function
    return label as any;
  }
  
  return label || a11yLabels[DEFAULT_LANGUAGE][key] as string;
}

// Hook for using i18n in components (future expansion)
export function useI18n(language: Language = DEFAULT_LANGUAGE) {
  return {
    language,
    t: (key: keyof typeof a11yLabels['es-AR']) => getA11yLabel(key, language),
    labels: a11yLabels[language]
  };
}

// Utility to get multiple errors text function
export function getMultipleErrorsText(language: Language = DEFAULT_LANGUAGE) {
  return a11yLabels[language].multipleErrors;
}

// Common form field labels in Spanish (Argentina)
export const formLabels = {
  'es-AR': {
    // User fields
    name: 'Nombre',
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    address: 'Dirección',
    birthDate: 'Fecha de nacimiento',
    dni: 'DNI',
    
    // Course fields
    courseName: 'Nombre del curso',
    courseDescription: 'Descripción del curso',
    duration: 'Duración',
    price: 'Precio',
    startDate: 'Fecha de inicio',
    endDate: 'Fecha de fin',
    
    // Contribution fields
    amount: 'Monto',
    month: 'Mes',
    year: 'Año',
    paymentDate: 'Fecha de pago',
    paymentMethod: 'Método de pago',
    concept: 'Concepto',
    notes: 'Observaciones',
    
    // Common fields
    status: 'Estado',
    createdAt: 'Fecha de creación',
    updatedAt: 'Última actualización',
    isActive: 'Activo'
  }
} as const;

// Get form label
export function getFormLabel(key: keyof typeof formLabels['es-AR'], language: Language = DEFAULT_LANGUAGE): string {
  // For now, only es-AR is supported, fallback to default
  if (language === 'es-AR') {
    return formLabels['es-AR'][key];
  }
  // Fallback to default for unsupported languages
  return formLabels[DEFAULT_LANGUAGE][key];
}
