'use client';

import { useEffect } from 'react';

interface KeyboardNavigationProps {
  children: React.ReactNode;
  className?: string;
}

export function KeyboardNavigation({ children, className = '' }: KeyboardNavigationProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip navigation if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }

      // Handle keyboard navigation
      switch (event.key) {
        case 'Tab':
          // Let browser handle tab navigation naturally
          break;
        
        case 'Enter':
        case ' ':
          // Activate focused element if it's a button or link
          const activeElement = document.activeElement as HTMLElement;
          if (
            activeElement &&
            (activeElement.tagName === 'BUTTON' || 
             activeElement.tagName === 'A' ||
             activeElement.getAttribute('role') === 'button')
          ) {
            event.preventDefault();
            activeElement.click();
          }
          break;

        case 'Escape':
          // Close modals, dropdowns, etc.
          const escapeEvent = new CustomEvent('keyboard-escape');
          document.dispatchEvent(escapeEvent);
          break;

        case 'ArrowDown':
        case 'ArrowUp':
          // Handle arrow navigation in lists and menus
          const focusableElements = getFocusableElements();
          const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
          
          if (currentIndex !== -1) {
            event.preventDefault();
            const nextIndex = event.key === 'ArrowDown' 
              ? Math.min(currentIndex + 1, focusableElements.length - 1)
              : Math.max(currentIndex - 1, 0);
            
            focusableElements[nextIndex]?.focus();
          }
          break;

        case 'Home':
          // Focus first focusable element
          event.preventDefault();
          const firstElement = getFocusableElements()[0];
          firstElement?.focus();
          break;

        case 'End':
          // Focus last focusable element
          event.preventDefault();
          const focusableEls = getFocusableElements();
          const lastElement = focusableEls[focusableEls.length - 1];
          lastElement?.focus();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`keyboard-navigation ${className}`}>
      {children}
    </div>
  );
}

function getFocusableElements(): HTMLElement[] {
  const selector = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([disabled])',
    '[role="link"]',
    '[role="menuitem"]',
    '[role="option"]'
  ].join(', ');

  return Array.from(document.querySelectorAll(selector)) as HTMLElement[];
}

// Hook for managing focus trapping in modals
export function useFocusTrap(isActive: boolean, containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when trap activates
    firstElement?.focus();

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Dispatch custom event for parent to handle
        const escapeEvent = new CustomEvent('modal-escape');
        container.dispatchEvent(escapeEvent);
      }
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isActive, containerRef]);
}

// Skip link component for screen readers
export function SkipLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {children}
    </a>
  );
}

// Announce changes to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
