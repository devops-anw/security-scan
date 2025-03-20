import { NextRequest, NextResponse } from 'next/server';
import { contract } from '@/contracts/auth';
import { KeycloakError } from '@/utils/errorHandler';
import { ZodError } from "zod";
import logger from '@/utils/logger';
import { Services } from "@/utils/containerUtils";

const signUpRoute = contract.signup;

export async function POST(request: NextRequest) {
    try {
        const parsedBody = signUpRoute.body.parse(await request.json());

        const result = await Services.getKeycloakService().createOrganizationAndUser(parsedBody);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        if (error instanceof KeycloakError) {
            logger.error({
                msg: 'Keycloak error during signup',
                error: error.message,
                code: error.code,
                details: error.details
            });
            
            return NextResponse.json({ 
                error: error.message, 
                code: error.code || 'OTHER',
                details: error.details 
            }, { status: 400 });
        }
        if (error instanceof ZodError) {
            logger.error({
                msg: 'Validation error during signup',
                error: error.errors
            });
            return NextResponse.json({ 
                error: 'Invalid input data', 
                code: 'INVALID_INPUT',
                details: error.errors 
            }, { status: 400 });
        }
        if (error instanceof SyntaxError) {
            logger.error({
                msg: 'Invalid JSON in signup request',
                error: error.message,
                stack: error.stack
            });
            return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }
        logger.error({
            msg: 'Unexpected error during signup',
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ error: 'An unexpected error occurred. Please try again later.' }, { status: 500 });
    }
}