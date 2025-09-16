'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Login form validation schema
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password requerido'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const { refreshAuth, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const searchParams = useSearchParams();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log('Form submitted with data:', data);
    setIsLoading(true);
    setError('');

    try {
      console.log('Sending login request...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Error en el login');
      }

      // Try to refresh auth state (ignore failure to allow middleware to handle)
      try {
        console.log('Refreshing auth state...');
        await refreshAuth();
      } catch (authError) {
        console.log('Auth refresh failed:', authError);
      }

      // Redirect to requested path 
      const redirect = searchParams?.get('redirect') || '/dashboard';
      console.log('Redirecting to:', redirect);
      router.replace(redirect);

    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  // If already authenticated, redirect away from login
  // Use effect to avoid calling router in render
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.replace(redirect);
    }
  }, [isAuthenticated, router, searchParams]);

  return (
    <div className="login-page">
      <main className="login-container" role="main">
        <Card className="login-card">
          <CardHeader className="login-header">
            <div className="login-logo">
              <div className="logo-icon" aria-hidden="true">CFP</div>
            </div>
            <h1 className="login-title">Iniciar Sesión</h1>
            <p className="login-description">
              Accede a tu cuenta del CFP Fondo Común
            </p>
          </CardHeader>
          <CardContent className="login-card__content">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="login-form" noValidate>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="form-group">
                      <FormLabel className="form-label">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          {...field}
                          className="form-input"
                          required
                          aria-required="true"
                          aria-describedby={form.formState.errors.email ? "email-error" : undefined}
                        />
                      </FormControl>
                      <FormMessage className="form-error" id="email-error" role="alert" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="form-group">
                      <FormLabel className="form-label">
                        Contraseña
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="form-input"
                          required
                          aria-required="true"
                          aria-describedby={form.formState.errors.password ? "password-error" : undefined}
                        />
                      </FormControl>
                      <FormMessage className="form-error" id="password-error" role="alert" />
                    </FormItem>
                  )}
                />

                {error && (
                  <div className="error-message" role="alert" aria-live="polite">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`submit-button ${isLoading ? 'loading' : ''}`}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="login-footer">
          <p className="footer-text">
            CFP Lago Puelo - Sistema de Gestión
          </p>
          <p className="footer-text" style={{ fontSize: '0.75rem' }}>
            Solo usuarios autorizados pueden acceder
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
