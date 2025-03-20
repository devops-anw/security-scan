import { NextRequest, NextResponse } from 'next/server';
import { KeycloakError } from "@/utils/errorHandler";
import logger from "@/utils/logger";
import { Services } from "@/utils/containerUtils";

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
    try {
        await Services.getKeycloakService().rejectUser(params.userId);
        logger.info({ msg: 'User rejected successfully', userId: params.userId });
        return NextResponse.json({ message: 'User rejected successfully' });
    } catch (error) {
        logger.error({
            msg: 'Error rejecting user',
            userId: params.userId,
            error: error instanceof Error ? error.message : String(error)
        });
        if (error instanceof KeycloakError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'An unexpected error occurred while rejecting the user' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const pendingUsers = await Services.getKeycloakService().getPendingUsers();
        logger.info({ msg: 'Pending users fetched successfully', count: pendingUsers.length });
        return NextResponse.json(pendingUsers, { status: 200 });
    } catch (error) {
        logger.error({
            msg: 'Error fetching pending users',
            error: error instanceof Error ? error.message : String(error)
        });
        if (error instanceof KeycloakError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'An unexpected error occurred while fetching pending users' }, { status: 500 });
    }
}