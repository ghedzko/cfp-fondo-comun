import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Course {
  id: string;
  areaCode: string;
  profileCode: string;
  name: string;
  description: string | null;
  duration: number;
  requirements: string | null;
  certificateLevel: string | null;
  certification: string | null;
  isActive: boolean;
  periods: any[];
  _count: {
    periods: number;
  };
}

interface CreateCourseData {
  areaCode: string;
  profileCode: string;
  name: string;
  duration: number;
  requirements?: string;
  certificateLevel?: string;
  certification?: string;
  description?: string;
}

// Hook para obtener todos los cursos
export function useCursos() {
  return useQuery({
    queryKey: ['cursos'],
    queryFn: async (): Promise<{ cursos: Course[] }> => {
      const response = await fetch('/api/cursos', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar cursos');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
  });
}

// Hook para obtener un curso específico
export function useCurso(id: string) {
  return useQuery({
    queryKey: ['cursos', id],
    queryFn: async (): Promise<{ course: Course }> => {
      const response = await fetch(`/api/cursos/${id}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar curso');
      }
      
      return response.json();
    },
    enabled: !!id, // Solo ejecutar si hay ID
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para crear un nuevo curso
export function useCreateCurso() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (courseData: CreateCourseData) => {
      const response = await fetch('/api/cursos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(courseData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear curso');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidar cache para refrescar la lista de cursos
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
    },
  });
}

// Hook para actualizar un curso
export function useUpdateCurso() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Course> }) => {
      const response = await fetch(`/api/cursos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar curso');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidar tanto la lista como el curso específico
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      queryClient.invalidateQueries({ queryKey: ['cursos', variables.id] });
    },
  });
}

// Hook para eliminar/desactivar un curso
export function useDeleteCurso() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/cursos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar curso');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refrescar la lista de cursos
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
    },
  });
}
