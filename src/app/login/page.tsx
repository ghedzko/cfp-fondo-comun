'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ThemeToggle } from '@/components/theme-toggle';
import { Loader2, Eye, EyeOff } from 'lucide-react';

// Login form validation schema
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password requerido'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { refreshAuth } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error en el login');
      }

      // Refresh auth state first
      await refreshAuth();
      
      // Use router.replace for a clean redirect without adding to history
      router.replace('/dashboard');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

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
