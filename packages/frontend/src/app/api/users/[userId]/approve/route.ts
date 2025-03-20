import { NextRequest, NextResponse } from 'next/server';
import logger from "@/utils/logger";
import { Services } from "@/utils/containerUtils";
import { KeycloakError } from "@/utils/errorHandler";

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
    const userId = params.userId?.trim();
    if (!userId || userId === '' || userId === '/' || decodeURIComponent(userId) === '/') {
        logger.warn({ 
            msg: 'Approve user attempt without valid user ID',
            attemptedUserId: userId 
        });
        return NextResponse.json({ 
            error: 'User ID is required', 
            details: [
                {
                    field: 'userId',
                    message: 'A valid user ID must be provided'
                }
            ]
        }, { status: 400 });
    }

    try {
        await Services.getKeycloakService().approveUser(userId);
        logger.info({ msg: 'User approved successfully', userId: userId });
        return NextResponse.json({ message: 'User approved successfully' });
    } catch (error) {
        if (error instanceof KeycloakError) {
            return NextResponse.json({ 
                error: error.message, 
                details: [
                    {
                        field: 'userId',
                        message: error.message
                    }
                ]
            }, { status: 400 });
        }
        logger.error({ 
            msg: 'Unexpected error in approve route', 
            error: error instanceof Error ? error.message : String(error),
            attemptedUserId: userId
        });
        return NextResponse.json({ error: 'An unexpected error occurred. Please try again later.' }, { status: 500 });
    }
}