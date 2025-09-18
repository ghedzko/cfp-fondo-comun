import { db } from './db';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT'
}

export enum AuditEntity {
  USER = 'USER',
  STUDENT = 'STUDENT',
  COURSE = 'COURSE',
  COURSE_PERIOD = 'COURSE_PERIOD',
  ENROLLMENT = 'ENROLLMENT',
  CONTRIBUTION = 'CONTRIBUTION',
  COURSE_INVOICE = 'COURSE_INVOICE',
  REPORT = 'REPORT'
}

interface AuditLogData {
  userId: number;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: number | string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Create audit log entry
export async function createAuditLog({
  userId,
  action,
  entity,
  entityId,
  details,
  ipAddress,
  userAgent
}: AuditLogData) {
  try {
    // First, let's add the AuditLog model to Prisma schema if it doesn't exist
    // For now, we'll store in a simple format that can be added to the schema later
    
    const auditEntry = {
      userId,
      action,
      entity,
      entityId: entityId?.toString(),
      details: details ? JSON.stringify(details) : null,
      ipAddress,
      userAgent,
      timestamp: new Date()
    };

    // Log to console for now (in production, this would go to database)
    console.log('AUDIT LOG:', auditEntry);

    // TODO: Implement database storage when AuditLog model is added to schema
    // await db.auditLog.create({
    //   data: auditEntry
    // });

    return auditEntry;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to avoid breaking main functionality
  }
}

// Helper functions for common audit scenarios
export const auditHelpers = {
  // Authentication events
  async logLogin(userId: number, ipAddress?: string, userAgent?: string) {
    return createAuditLog({
      userId,
      action: AuditAction.LOGIN,
      entity: AuditEntity.USER,
      entityId: userId,
      ipAddress,
      userAgent
    });
  },

  async logLogout(userId: number, ipAddress?: string, userAgent?: string) {
    return createAuditLog({
      userId,
      action: AuditAction.LOGOUT,
      entity: AuditEntity.USER,
      entityId: userId,
      ipAddress,
      userAgent
    });
  },

  // Student management
  async logStudentCreated(userId: number, studentId: number, studentData: any, ipAddress?: string) {
    return createAuditLog({
      userId,
      action: AuditAction.CREATE,
      entity: AuditEntity.STUDENT,
      entityId: studentId,
      details: {
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        dni: studentData.dni
      },
      ipAddress
    });
  },

  async logStudentUpdated(userId: number, studentId: number, changes: any, ipAddress?: string) {
    return createAuditLog({
      userId,
      action: AuditAction.UPDATE,
      entity: AuditEntity.STUDENT,
      entityId: studentId,
      details: { changes },
      ipAddress
    });
  },

  // Course management
  async logCourseCreated(userId: number, courseId: number, courseData: any, ipAddress?: string) {
    return createAuditLog({
      userId,
      action: AuditAction.CREATE,
      entity: AuditEntity.COURSE,
      entityId: courseId,
      details: {
        name: courseData.name,
        description: courseData.description
      },
      ipAddress
    });
  },

  async logCoursePeriodCreated(userId: number, periodId: number, periodData: any, ipAddress?: string) {
    return createAuditLog({
      userId,
      action: AuditAction.CREATE,
      entity: AuditEntity.COURSE_PERIOD,
      entityId: periodId,
      details: {
        name: periodData.name,
        courseId: periodData.courseId,
        year: periodData.year,
        enabledMonths: periodData.enabledMonths
      },
      ipAddress
    });
  },

  // Contribution management
  async logContributionCreated(userId: number, contributionId: number, contributionData: any, ipAddress?: string) {
    return createAuditLog({
      userId,
      action: AuditAction.CREATE,
      entity: AuditEntity.CONTRIBUTION,
      entityId: contributionId,
      details: {
        studentId: contributionData.studentId,
        coursePeriodId: contributionData.coursePeriodId,
        amount: contributionData.amount,
        month: contributionData.month,
        year: contributionData.year
      },
      ipAddress
    });
  },

  async logContributionUpdated(userId: number, contributionId: number, changes: any, ipAddress?: string) {
    return createAuditLog({
      userId,
      action: AuditAction.UPDATE,
      entity: AuditEntity.CONTRIBUTION,
      entityId: contributionId,
      details: { changes },
      ipAddress
    });
  },

  async logContributionDeleted(userId: number, contributionId: number, contributionData: any, ipAddress?: string) {
    return createAuditLog({
      userId,
      action: AuditAction.DELETE,
      entity: AuditEntity.CONTRIBUTION,
      entityId: contributionId,
      details: {
        deletedData: contributionData
      },
      ipAddress
    });
  },

  // Enrollment management
  async logEnrollmentCreated(userId: number, enrollmentId: number, enrollmentData: any, ipAddress?: string) {
    return createAuditLog({
      userId,
      action: AuditAction.CREATE,
      entity: AuditEntity.ENROLLMENT,
      entityId: enrollmentId,
      details: {
        studentId: enrollmentData.studentId,
        coursePeriodId: enrollmentData.coursePeriodId,
        status: enrollmentData.status
      },
      ipAddress
    });
  },

  // Invoice management
  async logInvoiceGenerated(userId: number, invoiceId: number, invoiceData: any, ipAddress?: string) {
    return createAuditLog({
      userId,
      action: AuditAction.CREATE,
      entity: AuditEntity.COURSE_INVOICE,
      entityId: invoiceId,
      details: {
        coursePeriodId: invoiceData.coursePeriodId,
        month: invoiceData.month,
        year: invoiceData.year,
        totalAmount: invoiceData.totalAmount
      },
      ipAddress
    });
  },

  async logInvoiceStatusChanged(userId: number, invoiceId: number, oldStatus: string, newStatus: string, ipAddress?: string) {
    return createAuditLog({
      userId,
      action: AuditAction.UPDATE,
      entity: AuditEntity.COURSE_INVOICE,
      entityId: invoiceId,
      details: {
        statusChange: {
          from: oldStatus,
          to: newStatus
        }
      },
      ipAddress
    });
  },

  // Report access
  async logReportAccessed(userId: number, reportType: string, filters: any, ipAddress?: string) {
    return createAuditLog({
      userId,
      action: AuditAction.VIEW,
      entity: AuditEntity.REPORT,
      entityId: reportType,
      details: {
        reportType,
        filters
      },
      ipAddress
    });
  },

  async logReportExported(userId: number, reportType: string, format: string, filters: any, ipAddress?: string) {
    return createAuditLog({
      userId,
      action: AuditAction.EXPORT,
      entity: AuditEntity.REPORT,
      entityId: `${reportType}-${format}`,
      details: {
        reportType,
        format,
        filters
      },
      ipAddress
    });
  }
};

// Utility to extract IP and User Agent from request
export function getRequestInfo(request: Request) {
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return { ipAddress, userAgent };
}

// Middleware helper for audit logging
export function withAuditLog<T extends any[]>(
  fn: (...args: T) => Promise<any>,
  auditFn: (result: any, ...args: T) => Promise<void>
) {
  return async (...args: T) => {
    const result = await fn(...args);
    try {
      await auditFn(result, ...args);
    } catch (error) {
      console.error('Audit logging failed:', error);
      // Don't throw - audit failure shouldn't break main functionality
    }
    return result;
  };
}
