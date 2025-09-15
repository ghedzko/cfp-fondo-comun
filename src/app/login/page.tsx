'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

      // Redirect to dashboard on successful login
      router.push('/dashboard');
      router.refresh();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsl(var(--background))', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '28rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'hsl(var(--foreground))', marginBottom: '0.5rem' }}>
            CFP Fondo Común
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>
            Sistema de Gestión Escolar
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ThemeToggle />
          </div>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '0.25rem' }}>
              Iniciar Sesión
            </CardTitle>
            <CardDescription style={{ textAlign: 'center' }}>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="tu@email.com"
                          disabled={isLoading}
                          style={{ 
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.375rem',
                            backgroundColor: 'hsl(var(--background))',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <div style={{ position: 'relative' }}>
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            disabled={isLoading}
                            style={{ 
                              width: '100%',
                              padding: '0.5rem 0.75rem',
                              paddingRight: '2.5rem',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '0.375rem',
                              backgroundColor: 'hsl(var(--background))',
                              color: 'hsl(var(--foreground))'
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            style={{
                              position: 'absolute',
                              right: '0',
                              top: '0',
                              height: '100%',
                              padding: '0 0.75rem',
                              backgroundColor: 'transparent',
                              border: 'none'
                            }}
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff style={{ height: '1rem', width: '1rem' }} />
                            ) : (
                              <Eye style={{ height: '1rem', width: '1rem' }} />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <div style={{ padding: '0.5rem', backgroundColor: 'hsl(var(--error-background))', color: 'hsl(var(--error-foreground))', borderRadius: '0.375rem' }}>
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 style={{ height: '1rem', width: '1rem', animation: 'spin 1s linear infinite' }} />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}>
            CFP Lagopuelo - Sistema de Gestión
          </p>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
            Solo usuarios autorizados pueden acceder
          </p>
        </div>
      </div>
    </div>
  );
}
