import { NextRequest, NextResponse } from "next/server";
import logger from '@/utils/logger';
import { Services } from "@/utils/containerUtils";
import { KeycloakError } from '@/utils/errorHandler';

export async function POST(request: NextRequest) {
    const requestBody = await request.json();
    const { token } = requestBody;

    try {
        if (!token) {
            logger.warn({ msg: 'Email verification attempted without token' });
            return NextResponse.json(
                { 
                    error: 'Verification token is required', 
                    code: 'MISSING_TOKEN',
                    details: [
                        {
                            field: 'token',
                            message: 'A verification token must be provided'
                        }
                    ]
                }, 
                { status: 400 }
            );
        }

        await Services.getKeycloakService().verifyEmail(token);
        logger.info({ msg: 'User email verified successfully', token });
        return NextResponse.json({ message: "Email verified successfully" });
    } catch (error) {
        if (error instanceof KeycloakError) {
            logger.error({
                msg: 'Failed to verify email',
                error,
                token
            });
            return NextResponse.json(
                { 
                    error: 'Invalid or expired verification token', 
                    code: 'INVALID_TOKEN',
                    details: [
                        {
                            field: 'token',
                            message: 'The provided verification token is invalid or has expired'
                        }
                    ]
                }, 
                { status: 400 }
            );
        }
        if (error instanceof SyntaxError) {
            logger.error({ msg: 'Invalid JSON in email verification request', error });
            return NextResponse.json(
                { 
                    error: 'Invalid request format', 
                    code: 'INVALID_INPUT',
                    details: [
                        {
                            field: 'token',
                            message: 'The request body is not in a valid JSON format'
                        }
                    ]
                }, 
                { status: 400 }
            );
        }
        logger.error({
            msg: 'Unexpected error during email verification',
            error,
            token
        });
        return NextResponse.json(
            { 
                error: 'An unexpected error occurred during email verification', 
                code: 'OTHER' 
            }, 
            { status: 500 }
        );
    }
}