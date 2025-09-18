'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AccessibleInput, AccessibleButton } from '@/components/accessible-form';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ChangePasswordForm({ onSuccess, onCancel }: ChangePasswordFormProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return {
      score: strength,
      label: strength < 2 ? 'Débil' : strength < 4 ? 'Media' : strength < 5 ? 'Fuerte' : 'Muy fuerte',
      color: strength < 2 ? 'text-red-500' : strength < 4 ? 'text-yellow-500' : strength < 5 ? 'text-blue-500' : 'text-green-500'
    };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);
  const passwordsMatch = formData.newPassword === formData.confirmPassword;

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    setError(null);
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar la contraseña');
      }

      setSuccess(true);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Call success callback after a delay to show success message
      setTimeout(() => {
        onSuccess?.();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            ¡Contraseña actualizada!
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Tu contraseña ha sido cambiada exitosamente. Por favor, inicia sesión nuevamente.
          </p>
          <Button onClick={onSuccess} className="w-full">
            Continuar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lock className="w-5 h-5" />
          <span>Cambiar Contraseña</span>
        </CardTitle>
        <CardDescription>
          Actualiza tu contraseña para mantener tu cuenta segura
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Current Password */}
          <div className="relative">
            <AccessibleInput
              label="Contraseña actual"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={handleInputChange('currentPassword')}
              required
              placeholder="Ingresa tu contraseña actual"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              tabIndex={-1}
            >
              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <AccessibleInput
              label="Nueva contraseña"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleInputChange('newPassword')}
              required
              placeholder="Ingresa tu nueva contraseña"
              helperText={formData.newPassword ? `Fortaleza: ${passwordStrength.label}` : 'Mínimo 6 caracteres'}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              tabIndex={-1}
            >
              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            
            {/* Password strength indicator */}
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5, 6].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded ${
                        level <= passwordStrength.score
                          ? passwordStrength.score < 2
                            ? 'bg-red-500'
                            : passwordStrength.score < 4
                            ? 'bg-yellow-500'
                            : passwordStrength.score < 5
                            ? 'bg-blue-500'
                            : 'bg-green-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs mt-1 ${passwordStrength.color}`}>
                  {passwordStrength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <AccessibleInput
              label="Confirmar nueva contraseña"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              required
              placeholder="Confirma tu nueva contraseña"
              error={formData.confirmPassword && !passwordsMatch ? 'Las contraseñas no coinciden' : undefined}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              tabIndex={-1}
            >
              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            
            {/* Match indicator */}
            {formData.confirmPassword && (
              <div className="mt-1 flex items-center space-x-1">
                {passwordsMatch ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400">Las contraseñas coinciden</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600 dark:text-red-400">Las contraseñas no coinciden</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <AccessibleButton
              type="submit"
              loading={loading}
              loadingText="Cambiando..."
              disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword || !passwordsMatch}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Cambiar Contraseña
            </AccessibleButton>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>

        {/* Security Tips */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Consejos de seguridad:
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Usa al menos 8 caracteres</li>
            <li>• Incluye mayúsculas, minúsculas y números</li>
            <li>• Agrega símbolos especiales</li>
            <li>• No uses información personal</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
