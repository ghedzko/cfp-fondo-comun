import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Student {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  birthDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  enrollments: any[];
  _count: {
    enrollments: number;
  };
}

interface CreateStudentData {
  dni: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
}

interface UpdateStudentData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  isActive?: boolean;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface EstudiantesResponse {
  students: Student[];
  pagination: PaginationInfo;
}

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: Array<{
    row: number;
    dni: string;
    error: string;
  }>;
  duplicates: Array<{
    row: number;
    dni: string;
    existingStudent: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

// Hook para obtener estudiantes con paginación y búsqueda
export function useEstudiantes(searchTerm = '', page = 1, limit = 10) {
  return useQuery({
    queryKey: ['estudiantes', searchTerm, page, limit],
    queryFn: async (): Promise<EstudiantesResponse> => {
      const params = new URLSearchParams({
        search: searchTerm,
        page: page.toString(),
        limit: limit.toString(),
      });
      
      const response = await fetch(`/api/estudiantes?${params}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar estudiantes');
      }
      
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutos - datos más dinámicos
    retry: 3,
  });
}

// Hook para obtener un estudiante específico
export function useEstudiante(id: string) {
  return useQuery({
    queryKey: ['estudiantes', id],
    queryFn: async (): Promise<{ student: Student }> => {
      const response = await fetch(`/api/estudiantes/${id}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar estudiante');
      }
      
      return response.json();
    },
    enabled: !!id, // Solo ejecutar si hay ID
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para crear un nuevo estudiante
export function useCreateEstudiante() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (studentData: CreateStudentData) => {
      const response = await fetch('/api/estudiantes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(studentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear estudiante');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidar todas las queries de estudiantes para refrescar listas
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
  });
}

// Hook para actualizar un estudiante
export function useUpdateEstudiante() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateStudentData }) => {
      const response = await fetch(`/api/estudiantes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar estudiante');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidar tanto las listas como el estudiante específico
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      queryClient.invalidateQueries({ queryKey: ['estudiantes', variables.id] });
    },
  });
}

// Hook para eliminar/desactivar un estudiante
export function useDeleteEstudiante() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/estudiantes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar estudiante');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refrescar todas las listas de estudiantes
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
  });
}

// Hook para importar estudiantes desde CSV
export function useImportEstudiantes() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ csvData, skipDuplicates = true }: { 
      csvData: any[]; 
      skipDuplicates?: boolean; 
    }): Promise<ImportResult> => {
      const response = await fetch('/api/estudiantes/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ csvData, skipDuplicates }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al importar estudiantes');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      // Solo invalidar si se importaron estudiantes exitosamente
      if (result.success && result.imported > 0) {
        queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      }
    },
  });
}

// Hook para descargar plantilla CSV
export function useDownloadTemplate() {
  return useMutation({
    mutationFn: async (): Promise<any[]> => {
      const response = await fetch('/api/estudiantes/import', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error al descargar plantilla');
      }
      
      const data = await response.json();
      return data.template;
    },
  });
}

// Hook para buscar estudiantes (sin paginación, para selects/autocomplete)
export function useSearchEstudiantes(searchTerm: string, enabled = true) {
  return useQuery({
    queryKey: ['estudiantes', 'search', searchTerm],
    queryFn: async (): Promise<Student[]> => {
      if (!searchTerm.trim()) return [];
      
      const params = new URLSearchParams({
        search: searchTerm,
        limit: '20', // Límite para búsquedas
      });
      
      const response = await fetch(`/api/estudiantes?${params}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error al buscar estudiantes');
      }
      
      const data = await response.json();
      return data.students || [];
    },
    enabled: enabled && searchTerm.length >= 2, // Solo buscar con 2+ caracteres
    staleTime: 30 * 1000, // 30 segundos para búsquedas
    retry: 1, // Menos reintentos para búsquedas
  });
}
