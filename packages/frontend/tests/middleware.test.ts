import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';
import { authMiddleware } from '@/middleware/auth';
import { rbacMiddleware } from '@/middleware/rbac';
import { UserRole } from '@/types/auth';

// Mock the auth middleware
vi.mock('@/middleware/auth', () => ({
    authMiddleware: vi.fn(),
}));

// Mock the rbac middleware
vi.mock('@/middleware/rbac', () => ({
    rbacMiddleware: vi.fn(),
}));

// Mock the verifyToken function
vi.mock('@/lib/auth', () => ({
    verifyToken: vi.fn(),
    hasRole: vi.fn(),
}));

describe('Middleware', () => {
    let mockRequest: NextRequest;
    let mockAuthResponse: NextResponse;
    let mockRbacResponse: NextResponse;

    beforeEach(() => {
        // Reset all mocks before each test
        vi.resetAllMocks();

        // Setup mock request
        mockRequest = new NextRequest('http://localhost:3000/api/users', {
            method: 'GET',
            headers: new Headers({ 'Authorization': 'Bearer mockToken' }),
        } as NextRequest);

        // Setup mock responses
        mockAuthResponse = NextResponse.next();
        mockAuthResponse.headers.set('X-User-ID', 'mockUserId');
        mockAuthResponse.headers.set('X-User-Roles', JSON.stringify([UserRole.ORG_ADMIN]));
        mockAuthResponse.headers.set('X-User-Org', 'mockOrgId');

        mockRbacResponse = NextResponse.next();

        // Setup mock implementations
        vi.mocked(authMiddleware).mockResolvedValue(mockAuthResponse);
        vi.mocked(rbacMiddleware).mockReturnValue(mockRbacResponse);
    });

    it('should call authMiddleware and rbacMiddleware for API routes', async () => {
        await middleware(mockRequest);

        expect(authMiddleware).toHaveBeenCalledWith(mockRequest);
        expect(rbacMiddleware).toHaveBeenCalledWith(mockRequest, mockAuthResponse);
    });

    it('should return NextResponse.next() for non-API routes', async () => {
        mockRequest = new NextRequest('http://localhost:3000/about', { method: 'GET' } as NextRequest);
        await middleware(mockRequest);

        expect(authMiddleware).not.toHaveBeenCalled();
        expect(rbacMiddleware).not.toHaveBeenCalled();
    });

    it('should return authMiddleware response if status is not 200', async () => {
        const errorResponse = NextResponse.json({ error: 'Unauthorized' }, { status: 401 } as any);
        vi.mocked(authMiddleware).mockResolvedValue(errorResponse);

        const response = await middleware(mockRequest);

        expect(authMiddleware).toHaveBeenCalledWith(mockRequest);
        expect(rbacMiddleware).not.toHaveBeenCalled();
        expect(response).toBe(errorResponse);
    });

    it('should return rbacMiddleware response if status is not 200', async () => {
        const errorResponse = NextResponse.json({ error: 'Forbidden' }, { status: 403 } as any);
        vi.mocked(rbacMiddleware).mockReturnValue(errorResponse);

        const response = await middleware(mockRequest);

        expect(authMiddleware).toHaveBeenCalledWith(mockRequest);
        expect(rbacMiddleware).toHaveBeenCalledWith(mockRequest, mockAuthResponse);
        expect(response).toBe(errorResponse);
    });
});
