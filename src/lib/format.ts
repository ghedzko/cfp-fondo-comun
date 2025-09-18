/**
 * Utilidades de formateo para Argentina
 * Formato argentino: "," para decimales y "." para separador de miles
 */

// Formatear moneda argentina (ARS)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Formatear números enteros con separador de miles
export function formatNumber(number: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}

// Formatear números decimales
export function formatDecimal(number: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
}

// Formatear porcentajes
export function formatPercentage(number: number, decimals: number = 1): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number / 100);
}

// Formatear fechas argentinas (DD/MM/YYYY)
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Formatear fecha y hora argentinas
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Formatear solo la hora
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Formatear números de teléfono argentinos
export function formatPhone(phone: string): string {
  // Remover todos los caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Formato para números argentinos (ej: +54 294 123-4567)
  if (cleaned.length === 13 && cleaned.startsWith('54')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
  }
  
  // Formato para números locales (ej: 294 123-4567)
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Si no coincide con formatos conocidos, devolver tal como está
  return phone;
}

// Formatear DNI argentino (ej: 12.345.678)
export function formatDNI(dni: string | number): string {
  const dniStr = dni.toString().replace(/\D/g, '');
  
  if (dniStr.length <= 8) {
    return dniStr.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  }
  
  return dniStr;
}

// Parsear moneda argentina a número
export function parseCurrency(currencyStr: string): number {
  // Remover símbolo de moneda y espacios
  const cleaned = currencyStr.replace(/[^\d,.-]/g, '');
  
  // Reemplazar coma por punto para decimales
  const normalized = cleaned.replace(',', '.');
  
  return parseFloat(normalized) || 0;
}

// Parsear número argentino a número
export function parseNumber(numberStr: string): number {
  // Remover puntos (separadores de miles) y reemplazar coma por punto (decimales)
  const cleaned = numberStr.replace(/\./g, '').replace(',', '.');
  
  return parseFloat(cleaned) || 0;
}
