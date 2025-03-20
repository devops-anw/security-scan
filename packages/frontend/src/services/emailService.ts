import nodemailer from "nodemailer";
import {
  EmailTemplateData,
  EmailTemplateService,
} from "./emailTemplateService";
import logger from "@/utils/logger";
import { inject, injectable } from "inversify";

export interface EmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: EmailTemplateData;
}

@injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    @inject(EmailTemplateService)
    private emailTemplateService: EmailTemplateService
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.FE_SMTP_HOST,
      port: parseInt(process.env.FE_SMTP_PORT || "587", 10),
      secure: process.env.FE_SMTP_SSL === "true",
      auth: {
        user: process.env.FE_SMTP_USER,
        pass: process.env.FE_SMTP_PASSWORD,
      },
    });

    logger.info("Email service initialized", {
      host: process.env.FE_SMTP_HOST,
      port: process.env.FE_SMTP_PORT,
      secure: process.env.FE_SMTP_SSL === "true",
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const { to, subject, templateName, templateData } = options;

    logger.info("Preparing to send email", {
      to,
      subject,
      templateName,
    });

    let html: string;
    try {
      html = this.emailTemplateService.renderTemplate(
        templateName,
        templateData
      );
      logger.debug("Email template rendered successfully", { templateName });
    } catch (error) {
      logger.error("Error rendering email template", {
        error: error instanceof Error ? error.message : String(error),
        templateName,
      });
      throw new Error("Failed to render email template");
    }

    const emailOptions = {
      from: process.env.FE_SMTP_FROM,
      to,
      subject,
      html,
    };

    return new Promise((resolve, reject) => {
      setImmediate(async () => {
        try {
          await this.transporter.sendMail(emailOptions);
          logger.info("Email sent successfully", {
            to,
            subject,
            templateName,
          });
          resolve();
        } catch (error) {
          logger.error("Error sending email", {
            error: error instanceof Error ? error.message : String(error),
            to,
            subject,
            templateName,
          });
          reject(new Error("Failed to send email"));
        }
      });
    });
  }
}
