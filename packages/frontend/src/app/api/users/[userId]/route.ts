import { NextRequest, NextResponse } from 'next/server';
import { User } from "@/types/keycloak";
import { KeycloakError } from "@/utils/errorHandler";
import logger from "@/utils/logger";
import { Services } from "@/utils/containerUtils";

export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const user = await Services.getKeycloakService().getUser(params.userId);
        return NextResponse.json(user);
    } catch (error) {
        if (error instanceof KeycloakError) {
            logger.error({
                msg: 'Failed to fetch user',
                error: error.message,
                userId: params.userId
            });
            return NextResponse.json({ error: 'User not found or inaccessible' }, { status: 404 });
        }
        logger.error({
            msg: 'Unexpected error while fetching user',
            error: error instanceof Error ? error.message : 'Unknown error',
            userId: params.userId
        });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const body = await request.json();

        // Validate that only firstName and lastName are present in the request body
        const allowedFields = ['firstName', 'lastName'];
        const invalidFields = Object.keys(body).filter(key => !allowedFields.includes(key));

        if (invalidFields.length > 0) {
            logger.warn({
                msg: 'Invalid fields in user update request',
                invalidFields,
                userId: params.userId
            });
            return NextResponse.json(
                { error: `Invalid fields: ${invalidFields.join(', ')}. Only firstName and lastName can be updated.` },
                { status: 400 }
            );
        }

        // Validate firstName and lastName
        if (body.firstName !== undefined && (typeof body.firstName !== 'string' || body.firstName.trim() === '')) {
            logger.warn({
                msg: 'Invalid firstName in user update request',
                userId: params.userId
            });
            return NextResponse.json({ error: 'firstName must be a non-empty string' }, { status: 400 });
        }
        if (body.lastName !== undefined && (typeof body.lastName !== 'string' || body.lastName.trim() === '')) {
            logger.warn({
                msg: 'Invalid lastName in user update request',
                userId: params.userId
            });
            return NextResponse.json({ error: 'lastName must be a non-empty string' }, { status: 400 });
        }

        // Proceed with the update
        const updateData: Partial<User> = {
            firstName: body.firstName,
            lastName: body.lastName
        };

        const updatedUser = await Services.getKeycloakService().updateUser(params.userId, updateData);
        logger.info({
            msg: 'User updated successfully',
            userId: params.userId,
            updatedFields: Object.keys(updateData)
        });
        return NextResponse.json(updatedUser);
    } catch (error) {
        if (error instanceof KeycloakError) {
            logger.error({
                msg: 'Failed to update user',
                error: error.message,
                userId: params.userId
            });
            return NextResponse.json({ error: 'Failed to update user' }, { status: 400 });
        }
        logger.error({
            msg: 'Unexpected error while updating user',
            error: error instanceof Error ? error.message : 'Unknown error',
            userId: params.userId
        });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}