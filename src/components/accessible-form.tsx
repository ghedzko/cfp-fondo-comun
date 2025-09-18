'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

// Accessible Input Component
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  requiredLabel?: string; // Customizable required label for i18n
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ label, error, helperText, required, requiredLabel = 'requerido', className, id, ...props }, ref) => {
    const inputId = useId();
    const finalId = id || inputId;
    const errorId = `${finalId}-error`;
    const helperId = `${finalId}-helper`;

    return (
      <div className="space-y-2">
        <label 
          htmlFor={finalId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label={requiredLabel}>*</span>
          )}
        </label>
        
        <input
          ref={ref}
          id={finalId}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={cn(
            error && errorId,
            helperText && helperId
          )}
          className={cn(
            "w-full px-3 py-2 border rounded-md shadow-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            error 
              ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
              : "border-gray-300 dark:border-gray-600",
            "dark:bg-gray-800 dark:text-white",
            className
          )}
          {...props}
        />
        
        {helperText && (
          <p id={helperId} className="text-sm text-gray-600 dark:text-gray-400">
            {helperText}
          </p>
        )}
        
        {error && (
          <p 
            id={errorId} 
            className="text-sm text-red-600 dark:text-red-400"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';

// Accessible Select Component
interface AccessibleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  requiredLabel?: string; // Customizable required label for i18n
}

export const AccessibleSelect = forwardRef<HTMLSelectElement, AccessibleSelectProps>(
  ({ label, error, helperText, options, placeholder, required, requiredLabel = 'requerido', className, id, ...props }, ref) => {
    const selectId = useId();
    const finalId = id || selectId;
    const errorId = `${finalId}-error`;
    const helperId = `${finalId}-helper`;

    return (
      <div className="space-y-2">
        <label 
          htmlFor={finalId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label={requiredLabel}>*</span>
          )}
        </label>
        
        <select
          ref={ref}
          id={finalId}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={cn(
            error && errorId,
            helperText && helperId
          )}
          className={cn(
            "w-full px-3 py-2 border rounded-md shadow-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            error 
              ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
              : "border-gray-300 dark:border-gray-600",
            "dark:bg-gray-800 dark:text-white",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {helperText && (
          <p id={helperId} className="text-sm text-gray-600 dark:text-gray-400">
            {helperText}
          </p>
        )}
        
        {error && (
          <p 
            id={errorId} 
            className="text-sm text-red-600 dark:text-red-400"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleSelect.displayName = 'AccessibleSelect';

// Accessible Textarea Component
interface AccessibleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  requiredLabel?: string; // Customizable required label for i18n
}

export const AccessibleTextarea = forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(
  ({ label, error, helperText, required, requiredLabel = 'requerido', className, id, ...props }, ref) => {
    const textareaId = useId();
    const finalId = id || textareaId;
    const errorId = `${finalId}-error`;
    const helperId = `${finalId}-helper`;

    return (
      <div className="space-y-2">
        <label 
          htmlFor={finalId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label={requiredLabel}>*</span>
          )}
        </label>
        
        <textarea
          ref={ref}
          id={finalId}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={cn(
            error && errorId,
            helperText && helperId
          )}
          className={cn(
            "w-full px-3 py-2 border rounded-md shadow-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            "resize-vertical min-h-[100px]",
            error 
              ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
              : "border-gray-300 dark:border-gray-600",
            "dark:bg-gray-800 dark:text-white",
            className
          )}
          {...props}
        />
        
        {helperText && (
          <p id={helperId} className="text-sm text-gray-600 dark:text-gray-400">
            {helperText}
          </p>
        )}
        
        {error && (
          <p 
            id={errorId} 
            className="text-sm text-red-600 dark:text-red-400"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleTextarea.displayName = 'AccessibleTextarea';

// Accessible Button Component
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string; // Customizable loading text for i18n
  children: React.ReactNode;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    loadingText = 'Cargando...', 
    children, 
    className, 
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
      outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700",
      ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800",
      destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base"
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        <span className={loading ? 'sr-only' : ''}>
          {children}
        </span>
        {loading && (
          <span aria-live="polite">
            {loadingText}
          </span>
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

// Form validation announcer with i18n support
interface FormValidationAnnouncerProps {
  errors: Record<string, string>;
  singleErrorText?: string; // Customizable text for i18n
  multipleErrorsText?: (count: number) => string; // Customizable text function for i18n
}

export function FormValidationAnnouncer({ 
  errors, 
  singleErrorText = "Hay 1 error en el formulario",
  multipleErrorsText = (count: number) => `Hay ${count} errores en el formulario`
}: FormValidationAnnouncerProps) {
  const errorCount = Object.keys(errors).length;
  
  if (errorCount === 0) return null;

  return (
    <div 
      role="alert" 
      aria-live="assertive" 
      className="sr-only"
    >
      {errorCount === 1 
        ? singleErrorText
        : multipleErrorsText(errorCount)
      }
    </div>
  );
}
