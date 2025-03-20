import { generateOpenApi } from '@ts-rest/open-api';
import { contract } from '@/contracts/auth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from "@/utils/logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openApiDocument = generateOpenApi(contract, {
    info: {
        title: 'Memcrypt User Management API',
        version: '1.0.0',
        description: 'Memcrypt User Management API',
    },
    servers: [{ url: 'http://localhost:3000' }],
    security: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
        },
    }

});

const outputPath = path.join(__dirname, '../../../public/openapi.json');
fs.writeFileSync(outputPath, JSON.stringify(openApiDocument, null, 2));

logger.info(`OpenAPI specification generated at ${outputPath}`);