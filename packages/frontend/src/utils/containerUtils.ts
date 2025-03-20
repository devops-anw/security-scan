import 'reflect-metadata';
import { Container, interfaces } from 'inversify';
import { KeycloakService } from '@/services/keycloakService';
import {KeycloakAdminClientManager} from "@/lib/keycloakAdminClient";
import {EmailTemplateService} from "@/services/emailTemplateService";
import {EmailService} from "@/services/emailService";
import {UserService} from "@/services/userService";
import {OrganizationService} from "@/services/organizationService";
import {NotificationService} from "@/services/notificationService";
import logger from "@/utils/logger";
import path from 'path';

let container: Container;

export function getContainer(): Container {
    if (!container) {
        container = new Container();
        configureContainer(container);
        logger.info('Container initialized');
    }
    return container;
}

export function configureContainer(container: Container): void {
    container.bind<KeycloakService>(KeycloakService).toSelf().inSingletonScope();
    container.bind<KeycloakAdminClientManager>(KeycloakAdminClientManager).toSelf().inSingletonScope();
    container.bind<EmailTemplateService>(EmailTemplateService).toSelf().inSingletonScope();
    container.bind<EmailService>(EmailService).toSelf().inSingletonScope();
    container.bind<UserService>(UserService).toSelf().inSingletonScope();
    container.bind<OrganizationService>(OrganizationService).toSelf().inSingletonScope();
    container.bind<NotificationService>(NotificationService).toSelf().inSingletonScope();
    container.bind<string>('TEMPLATES_DIR').toConstantValue(path.join(process.cwd(), 'src', 'emailTemplates'));
    container.bind<number>('RETRY_DELAY').toConstantValue(5000);
    // Add more bindings here as needed
}

export function createContainer(): Container {
    const newContainer = new Container();
    configureContainer(newContainer);
    return newContainer;
}

export function resetContainer(): void {
    container = createContainer();
}

export function bindMock<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, mock: T): void {
    const currentContainer = getContainer();
    if (currentContainer.isBound(serviceIdentifier)) {
        currentContainer.unbind(serviceIdentifier);
    }
    currentContainer.bind(serviceIdentifier).toConstantValue(mock);
}

// New function to get a service from the container
export function getService<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
    const currentContainer = getContainer();
    if (!currentContainer.isBound(serviceIdentifier)) {
        throw new Error(`No binding found for ${serviceIdentifier.toString()}`);
    }
    return currentContainer.get<T>(serviceIdentifier);
}

// Type-safe service getters
export const Services = {
    getKeycloakService: () => getService(KeycloakService),
    getKeycloakAdminClientManager: () => getService(KeycloakAdminClientManager),
    getEmailTemplateService: () => getService(EmailTemplateService),
    getEmailService: () => getService(EmailService),
    getUserService: () => getService(UserService),
    getOrganizationService: () => getService(OrganizationService),
    getNotificationService: () => getService(NotificationService),
};