import { inject, injectable } from "inversify";
import logger from "@/utils/logger";
import { EmailService, EmailOptions } from "@/services/emailService";
import { EmailTask, EmailQueue } from "@/utils/emailQueue";

@injectable()
export class NotificationService {
  private appUrl: string;
  private emailQueue: EmailQueue;
  private maxRetries: number = 3;
  private intervalId?: NodeJS.Timeout;

  constructor(
    @inject(EmailService) private emailService: EmailService,
    @inject("RETRY_DELAY") private retryDelay: number = 5000
  ) {
    this.appUrl = process.env.APP_URL || "http://localhost:3000";
    this.emailQueue = new EmailQueue();
    this.startProcessing();
  }

  public startProcessing(): void {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.processQueue(), 1000);
    }
  }

  public stopProcessing(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  // For testing purposes
  public manuallyTriggerQueueProcessing(): void {
    this.processQueue();
  }

  public async sendAdminNotification(
    newUser: any,
    orgName: string
  ): Promise<void> {
    const emailOptions: EmailOptions = {
      to: process.env.FE_ADMIN_EMAIL!,
      subject: `New User Registration for ${orgName}`,
      templateName: "adminNotification",
      templateData: {
        orgName,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        approvalLink: `${this.appUrl}/admin/approval-signup-request`,
      },
    };

    await this.addToQueue(emailOptions);
    logger.info({
      msg: "Admin notification queued",
      orgName,
      userEmail: newUser.email,
    });
  }

  public async sendUserVerificationEmail(
    user: any,
    orgName: string,
    verificationToken: string
  ): Promise<void> {
    const emailOptions: EmailOptions = {
      to: user.email,
      subject: `Welcome to MemCrypt, ${orgName}– Your Registration Is Under Review! `,
      templateName: "userVerification",
      templateData: {
        orgName,
        firstName: user.firstName,
        verificationLink: `${this.appUrl}/verify-email?token=${verificationToken}`,
      },
    };

    await this.addToQueue(emailOptions);
    logger.info({
      msg: "User verification email queued",
      orgName,
      userEmail: user.email,
    });
  }

  public async sendStatusUpdateEmail(user: any, status: string): Promise<void> {
    const emailOptions: EmailOptions = {
      to: user.email,
      subject:
        status === "approved"
          ? "Your account has been approved"
          : "Your account application status",
      templateName: status === "approved" ? "userApproved" : "userRejected",
      templateData: {
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        login: `${this.appUrl}/login`,
      },
    };

    await this.addToQueue(emailOptions);
    logger.info({
      msg: `${status} notification email queued`,
      userEmail: user.email,
      status,
    });
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  private async addToQueue(options: EmailOptions): Promise<void> {
    const task: EmailTask = {
      id: this.generateUniqueId(),
      options,
      retries: 0,
      status: "pending",
    };
    await this.emailQueue.add(task);
  }

  private async processQueue(): Promise<void> {
    try {
      const tasks = await this.emailQueue.getTasks();
      const now = Date.now();

      for (const task of tasks) {
        if (
          task.status === "pending" &&
          (!task.nextRetry || task.nextRetry <= now)
        ) {
          const updated = await this.emailQueue.updateStatus(
            task.id,
            "pending",
            "processing"
          );
          if (updated) {
            setImmediate(() => this.processTask(task));
          }
        }
      }
    } catch (error) {
      logger.error({
        msg: "Error processing queue",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async processTask(task: EmailTask): Promise<void> {
    try {
      await this.emailService.sendEmail(task.options);
      await this.emailQueue.remove(task.id);
      logger.info({
        msg: "Email sent successfully and removed from queue",
        id: task.id,
      });
    } catch (error) {
      if (task.retries < this.maxRetries) {
        await this.emailQueue.update(task.id, (t) => ({
          ...t,
          retries: t.retries + 1,
          nextRetry: Date.now() + this.retryDelay,
          status: "pending",
        }));
        logger.warn({
          msg: `Email sending failed, scheduled for retry`,
          id: task.id,
          retryAttempt: `${task.retries + 1}/${this.maxRetries}`,
          nextRetryAt: new Date(Date.now() + this.retryDelay).toISOString(),
          error: error instanceof Error ? error.message : String(error),
          subject: task.options.subject,
          to: task.options.to,
        });
      } else {
        await this.emailQueue.update(
          task.id,
          (t) => ({ ...t, status: "failed" } as unknown as EmailTask)
        );
        this.handleFailedEmail(task);
        await this.emailQueue.remove(task.id);
        logger.error({
          msg: "Email sending failed after max retries, removed from queue",
          id: task.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  private handleFailedEmail(task: EmailTask): void {
    // Implement "dead letter" queue or other failure handling mechanism here
    logger.error({
      msg: "Email permanently failed to send",
      id: task.id,
      to: task.options.to,
      subject: task.options.subject,
      retries: task.retries,
    });
  }
}
