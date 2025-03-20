import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authMiddleware } from './middleware/auth';
import { rbacMiddleware } from './middleware/rbac';
 
export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    
    if (path.startsWith('/api/') && (path.includes("approve") || path.includes("reject") || path.includes("users"))) {
        const authResponse = await authMiddleware(request);
 
        if (authResponse.status !== 200) {
            return authResponse;
        }
 
        const rbacResponse = rbacMiddleware(request, authResponse);
 
        if (rbacResponse.status !== 200) {
            return rbacResponse;
        }
 
        return rbacResponse;
    }
 
    return NextResponse.next();
}
 
export const config = {
    matcher: '/api/:path*',
};