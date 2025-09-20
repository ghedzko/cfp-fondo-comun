import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface CoursePeriod {
  id: string;
  courseId: string;
  startDate: string;
  endDate: string;
  months: number[];
  year: number;
  maxStudents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  course: {
    id: string;
    name: string;
    areaCode: string;
    profileCode: string;
    duration: number;
  };
  enrollments: Array<{
    id: string;
    studentId: string;
    status: string;
    enrollmentDate: string;
    student: {
      id: string;
      firstName: string;
      lastName: string;
      dni: string;
    };
  }>;
  contributions: Array<{
    id: string;
    amount: number;
    month: number;
    year: number;
    status: string;
    studentId: string;
  }>;
  _count: {
    enrollments: number;
    contributions: number;
  };
}

interface CreatePeriodData {
  courseId: string;
  startDate: string;
  endDate: string;
  months: number[];
  year: number;
  maxStudents: number;
}

interface UpdatePeriodData {
  startDate?: string;
  endDate?: string;
  months?: number[];
  year?: number;
  maxStudents?: number;
  isActive?: boolean;
}

interface PeriodosResponse {
  periods: CoursePeriod[];
  total: number;
}

// Hook para obtener períodos de un curso específico
export function usePeriodos(courseId: string) {
  return useQuery({
    queryKey: ['periodos', courseId],
    queryFn: async (): Promise<PeriodosResponse> => {
      const response = await fetch(`/api/cursos/${courseId}/periodos`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar períodos del curso');
      }
      
      return response.json();
    },
    enabled: !!courseId, // Solo ejecutar si hay courseId
    staleTime: 3 * 60 * 1000, // 3 minutos - datos moderadamente dinámicos
    retry: 3,
  });
}

// Hook para obtener un período específico
export function usePeriodo(courseId: string, periodoId: string) {
  return useQuery({
    queryKey: ['periodos', courseId, periodoId],
    queryFn: async (): Promise<{ period: CoursePeriod }> => {
      const response = await fetch(`/api/cursos/${courseId}/periodos/${periodoId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar período');
      }
      
      return response.json();
    },
    enabled: !!(courseId && periodoId), // Solo ejecutar si hay ambos IDs
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obtener todos los períodos activos (para selects/autocomplete)
export function usePeriodosActivos() {
  return useQuery({
    queryKey: ['periodos', 'activos'],
    queryFn: async (): Promise<CoursePeriod[]> => {
      const response = await fetch('/api/cursos/periodos/activos', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar períodos activos');
      }
      
      const data = await response.json();
      return data.periods || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
}

// Hook para crear un nuevo período
export function useCreatePeriodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (periodData: CreatePeriodData) => {
      const response = await fetch(`/api/cursos/${periodData.courseId}/periodos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(periodData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear período');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidar períodos del curso específico
      queryClient.invalidateQueries({ queryKey: ['periodos', variables.courseId] });
      // Invalidar períodos activos
      queryClient.invalidateQueries({ queryKey: ['periodos', 'activos'] });
      // Invalidar el curso para actualizar contadores
      queryClient.invalidateQueries({ queryKey: ['cursos', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
    },
  });
}

// Hook para actualizar un período
export function useUpdatePeriodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      courseId, 
      periodoId, 
      data 
    }: { 
      courseId: string; 
      periodoId: string; 
      data: UpdatePeriodData; 
    }) => {
      const response = await fetch(`/api/cursos/${courseId}/periodos/${periodoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar período');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidar múltiples queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['periodos', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['periodos', variables.courseId, variables.periodoId] });
      queryClient.invalidateQueries({ queryKey: ['periodos', 'activos'] });
      queryClient.invalidateQueries({ queryKey: ['cursos', variables.courseId] });
    },
  });
}

// Hook para eliminar/desactivar un período
export function useDeletePeriodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ courseId, periodoId }: { courseId: string; periodoId: string }) => {
      const response = await fetch(`/api/cursos/${courseId}/periodos/${periodoId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar período');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Refrescar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['periodos', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['periodos', 'activos'] });
      queryClient.invalidateQueries({ queryKey: ['cursos', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
    },
  });
}

// Hook para obtener estadísticas de un período
export function usePeriodoStats(courseId: string, periodoId: string) {
  return useQuery({
    queryKey: ['periodos', courseId, periodoId, 'stats'],
    queryFn: async () => {
      const response = await fetch(`/api/cursos/${courseId}/periodos/${periodoId}/stats`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas del período');
      }
      
      return response.json();
    },
    enabled: !!(courseId && periodoId),
    staleTime: 2 * 60 * 1000, // 2 minutos - stats pueden cambiar frecuentemente
  });
}

// Hook para obtener aportes de un período
export function usePeriodoAportes(courseId: string, periodoId: string) {
  return useQuery({
    queryKey: ['periodos', courseId, periodoId, 'aportes'],
    queryFn: async () => {
      const response = await fetch(`/api/cursos/${courseId}/periodos/${periodoId}/aportes`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar aportes del período');
      }
      
      return response.json();
    },
    enabled: !!(courseId && periodoId),
    staleTime: 1 * 60 * 1000, // 1 minuto - aportes cambian frecuentemente
  });
}

// Hook para matricular estudiante en período
export function useMatricularEstudiante() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      courseId, 
      periodoId, 
      studentId 
    }: { 
      courseId: string; 
      periodoId: string; 
      studentId: string; 
    }) => {
      const response = await fetch(`/api/cursos/${courseId}/periodos/${periodoId}/matricular`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ studentId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al matricular estudiante');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas con el período y estudiante
      queryClient.invalidateQueries({ queryKey: ['periodos', variables.courseId, variables.periodoId] });
      queryClient.invalidateQueries({ queryKey: ['periodos', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['estudiantes', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
  });
}
