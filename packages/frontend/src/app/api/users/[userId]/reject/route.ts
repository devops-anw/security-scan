import { NextRequest, NextResponse } from 'next/server';
import logger from "@/utils/logger";
import { Services } from "@/utils/containerUtils";
import {KeycloakError} from "@/utils/errorHandler";

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
    const userId = params.userId?.trim();
    if (!userId || userId === '' || userId === '/' || decodeURIComponent(userId) === '/') {
        logger.warn({ msg: 'Reject user attempt without valid user ID' });
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
        await Services.getKeycloakService().rejectUser(params.userId);
        logger.info({ 
            msg: 'User rejected successfully', 
            userId: params.userId,
            action: 'rejectUser'
        });
        return NextResponse.json({ message: 'User rejected successfully' });
    } catch (error) {
        if( error instanceof KeycloakError ) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'An error occurred while rejecting the user. Please try again later.' },
            { status: 500 }
        );
    }
}