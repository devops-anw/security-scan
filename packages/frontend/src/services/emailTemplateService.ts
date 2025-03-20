import { inject, injectable } from 'inversify';
import fs from 'fs';
import path from 'path';
import { render } from '@/utils/templateEngine';
import logger from '@/utils/logger';

export interface EmailTemplateData {
    [key: string]: any;
}

@injectable()
export class EmailTemplateService {
    private templates: { [key: string]: string } = {};

    constructor(@inject('TEMPLATES_DIR') private templatesDir: string) {
        this.loadTemplates(this.templatesDir);
    }

    loadTemplates(templatesDir: string): void {
        try {
            fs.readdirSync(templatesDir).forEach(file => {
                if (file.endsWith('.html')) {
                    const templateName = path.basename(file, '.html');
                    const templateContent = fs.readFileSync(path.join(templatesDir, file), 'utf-8');
                    this.templates[templateName] = templateContent;
                }
            });
            logger.info('Email templates loaded successfully', {
                templatesCount: Object.keys(this.templates).length,
                templates: Object.keys(this.templates)
            });
        } catch (error) {
            logger.error('Error loading email templates', {
                error: error instanceof Error ? error.message : String(error),
                templatesDir
            });
            throw new Error('Failed to load email templates');
        }
    }

    renderTemplate(templateName: string, data: EmailTemplateData): string {
        const template = this.templates[templateName];
        if (!template) {
            logger.error('Template not found', { templateName });
            throw new Error(`Template not found: ${templateName}`);
        }
        try {
            return render(template, data);
        } catch (error) {
            logger.error('Error rendering template', {
                error: error instanceof Error ? error.message : String(error),
                templateName
            });
            throw new Error(`Failed to render template: ${templateName}`);
        }
    }

    // Method for testing purposes
    setTemplate(templateName: string, content: string): void {
        this.templates[templateName] = content;
        logger.info('Template set for testing', { templateName });
    }
}