import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

export async function authMiddleware(request: NextRequest) {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const secret = process.env.NEXTAUTH_SECRET;
    const accessToken = await getToken({ req:request, secret });

    const activeToken = accessToken?.accessToken || token;
    if (!activeToken) {
        return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    
    const payload = await verifyToken(activeToken as string);
    if (!payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 } as any);
    }
 
    const response = NextResponse.next();
    response.headers.set('X-User-ID', payload.sub);
    response.headers.set('X-User-Roles', JSON.stringify(payload.realm_access.roles));
    response.headers.set('X-User-Org', payload.org_id);
 
    return response;
}