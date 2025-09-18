import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { auditHelpers } from '@/lib/audit-log';

interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  newPassword?: string;
}

// GET - Get specific user (ADMIN only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication and admin access
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (authResult.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const user = await db.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            refreshTokens: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT - Update user (ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication and admin access
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (authResult.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Prevent admin from modifying themselves
    if (authResult.user.userId === params.id) {
      return NextResponse.json(
        { error: 'No puedes modificar tu propio usuario' },
        { status: 400 }
      );
    }

    const body: UpdateUserRequest = await request.json();
    const { name, email, role, isActive, newPassword } = body;

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { id: params.id }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    const changes: any = {};

    if (name !== undefined && name !== currentUser.name) {
      updateData.name = name.trim();
      changes.name = { from: currentUser.name, to: name.trim() };
    }

    if (email !== undefined && email !== currentUser.email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Formato de email inválido' },
          { status: 400 }
        );
      }

      // Check if email already exists
      const existingUser = await db.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser && existingUser.id !== params.id) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con este email' },
          { status: 400 }
        );
      }

      updateData.email = email.toLowerCase().trim();
      changes.email = { from: currentUser.email, to: email.toLowerCase().trim() };
    }

    if (role !== undefined && role !== currentUser.role) {
      if (!Object.values(UserRole).includes(role)) {
        return NextResponse.json(
          { error: 'Rol de usuario inválido' },
          { status: 400 }
        );
      }
      updateData.role = role;
      changes.role = { from: currentUser.role, to: role };
    }

    if (isActive !== undefined && isActive !== currentUser.isActive) {
      updateData.isActive = isActive;
      changes.isActive = { from: currentUser.isActive, to: isActive };
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'La contraseña debe tener al menos 6 caracteres' },
          { status: 400 }
        );
      }

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      updateData.password = hashedPassword;
      changes.password = 'changed';

      // Invalidate all refresh tokens for this user
      await db.refreshToken.deleteMany({
        where: { userId: params.id }
      });
    }

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No hay cambios para actualizar' },
        { status: 400 }
      );
    }

    updateData.updatedAt = new Date();

    // Update user
    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Log user update
    await auditHelpers.logUserUpdated(
      authResult.user.userId,
      params.id,
      changes,
      request.headers.get('x-forwarded-for') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user (ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication and admin access
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (authResult.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Prevent admin from deleting themselves
    if (authResult.user.userId === params.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propio usuario' },
        { status: 400 }
      );
    }

    // Get user before deletion
    const userToDelete = await db.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Delete user (cascade will handle refresh tokens)
    await db.user.delete({
      where: { id: params.id }
    });

    // Log user deletion
    await auditHelpers.logUserDeleted(
      authResult.user.userId,
      params.id,
      userToDelete,
      request.headers.get('x-forwarded-for') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
