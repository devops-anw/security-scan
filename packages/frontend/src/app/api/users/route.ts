import { NextRequest, NextResponse } from 'next/server';
import { UserWithOrg } from '@/types/keycloak';
import { KeycloakError } from "@/utils/errorHandler";
import { PaginatedResult } from "@/types/pagination";
import logger from "@/utils/logger";
import { Services } from "@/utils/containerUtils";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '1000', 10);

    logger.info('Received GET request for users with org info', { page, pageSize });

    try {
        const result = await Services.getKeycloakService().getUsersWithOrgInfo({ page, pageSize });

        logger.info('Successfully retrieved users with org info', {
            page,
            pageSize,
            totalUsers: result.totalCount,
            totalPages: result.totalPages
        });

        return NextResponse.json<PaginatedResult<UserWithOrg>>(result, { status: 200 });
    } catch (error) {
        if (error instanceof KeycloakError) {
            logger.warn('Keycloak error while fetching users with org info', {
                error: error.message,
                page,
                pageSize
            });
            return NextResponse.json<{ error: string }>(
                { error: error.message },
                { status: 400 }
            );
        }
        logger.error('Unexpected error while fetching users with org info', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            page,
            pageSize
        });
        return NextResponse.json<{ error: string }>(
            { error: 'An unexpected error occurred while fetching users. Please try again later.' },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    return NextResponse.json<{ message: string }>({ message: 'DELETE method not implemented' }, { status: 501 });
}