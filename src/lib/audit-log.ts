import { db } from './db';
import { AuditAction, AuditEntity } from '@prisma/client';

interface AuditLogData {
  userId: string; // Changed to string to match Prisma User.id type
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
    const auditEntry = {
      userId,
      action,
      entity,
      entityId: entityId?.toString(),
      details: details || null,
      ipAddress,
      userAgent
    };

    // Persist audit log entry to database for accountability and compliance
    const savedEntry = await db.auditLog.create({
      data: auditEntry
    });

    // Also log to console for development debugging
    console.log('AUDIT LOG SAVED:', {
      id: savedEntry.id,
      userId: savedEntry.userId,
      action: savedEntry.action,
      entity: savedEntry.entity,
      entityId: savedEntry.entityId,
      timestamp: savedEntry.timestamp
    });

    return savedEntry;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to avoid breaking main functionality
    // But log the failure for monitoring
    console.error('AUDIT LOG FAILURE - This is a security concern:', {
      userId,
      action,
      entity,
      entityId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper functions for common audit scenarios
export const auditHelpers = {
  // Authentication events
  async logLogin(userId: string, ipAddress?: string, userAgent?: string) {
    return createAuditLog({
      userId,
      action: AuditAction.LOGIN,
      entity: AuditEntity.USER,
      entityId: userId,
      ipAddress,
      userAgent
    });
  },

  async logLogout(userId: string, ipAddress?: string, userAgent?: string) {
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
  async logStudentCreated(userId: string, studentId: string, studentData: any, ipAddress?: string) {
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

  async logStudentUpdated(userId: string, studentId: string, changes: any, ipAddress?: string) {
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
  async logCourseCreated(userId: string, courseId: string, courseData: any, ipAddress?: string) {
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

  async logCoursePeriodCreated(userId: string, periodId: string, periodData: any, ipAddress?: string) {
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
  async logContributionCreated(userId: string, contributionId: string, contributionData: any, ipAddress?: string) {
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

  async logContributionUpdated(userId: string, contributionId: string, changes: any, ipAddress?: string) {
    return createAuditLog({
      userId,
      action: AuditAction.UPDATE,
      entity: AuditEntity.CONTRIBUTION,
      entityId: contributionId,
      details: { changes },
      ipAddress
    });
  },

  async logContributionDeleted(userId: string, contributionId: string, contributionData: any, ipAddress?: string) {
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
  async logEnrollmentCreated(userId: string, enrollmentId: string, enrollmentData: any, ipAddress?: string) {
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
  async logInvoiceGenerated(userId: string, invoiceId: string, invoiceData: any, ipAddress?: string) {
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

  async logInvoiceStatusChanged(userId: string, invoiceId: string, oldStatus: string, newStatus: string, ipAddress?: string) {
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
  async logReportAccessed(userId: string, reportType: string, filters: any, ipAddress?: string) {
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

  async logReportExported(userId: string, reportType: string, format: string, filters: any, ipAddress?: string) {
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
