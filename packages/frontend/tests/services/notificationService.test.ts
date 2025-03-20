import "reflect-metadata";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NotificationService } from "@/services/notificationService";
import { EmailService, EmailOptions } from "@/services/emailService";
import logger from "@/utils/logger";

vi.mock("@/services/emailService");
vi.mock("@/utils/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("NotificationService", () => {
  let notificationService: NotificationService;
  let mockEmailService: EmailService;

  beforeEach(() => {
    vi.useFakeTimers();
    mockEmailService = {
      sendEmail: vi.fn(),
    } as unknown as EmailService;
    notificationService = new NotificationService(mockEmailService, 100);
    notificationService.stopProcessing(); // Stop automatic processing for tests
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("Email queueing", () => {
    it("should queue admin notification email", async () => {
      const newUser = {
        username: "testuser",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      };
      const orgName = "TestOrg";

      await notificationService.sendAdminNotification(newUser, orgName);

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: "Admin notification queued",
          orgName,
          userEmail: newUser.email,
        })
      );
    });

    it("should queue user verification email", async () => {
      const user = { email: "user@example.com", firstName: "Test" };
      const orgName = "TestOrg";
      const verificationToken = "testtoken";

      await notificationService.sendUserVerificationEmail(
        user,
        orgName,
        verificationToken
      );

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: "User verification email queued",
          orgName,
          userEmail: user.email,
        })
      );
    });

    it("should queue status update email for approved user", async () => {
      const user = {
        username: "testuser",
        email: "user@example.com",
        firstName: "Test",
        lastName: "User",
      };
      const status = "approved";

      await notificationService.sendStatusUpdateEmail(user, status);

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: `${status} notification email queued`,
          userEmail: user.email,
          status,
        })
      );
    });

    it("should queue status update email for rejected user", async () => {
      const user = {
        username: "testuser",
        email: "user@example.com",
        firstName: "Test",
        lastName: "User",
      };
      const status = "rejected";

      await notificationService.sendStatusUpdateEmail(user, status);

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: `${status} notification email queued`,
          userEmail: user.email,
          status,
        })
      );
    });
  });

  describe("processQueue", () => {
    it("should process queued emails successfully", async () => {
      vi.spyOn(mockEmailService, "sendEmail").mockResolvedValue(undefined);

      const emailOptions: EmailOptions = {
        to: "test@example.com",
        subject: "Test Email",
        templateName: "test",
        templateData: {},
      };

      (notificationService as any).addToQueue(emailOptions);

      notificationService.manuallyTriggerQueueProcessing();
      await vi.runAllTimersAsync();

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(emailOptions);
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: "Task added to queue",
          to: emailOptions.to,
          subject: emailOptions.subject,
        })
      );
    });

    it("should retry failed emails", async () => {
      vi.spyOn(mockEmailService, "sendEmail")
        .mockRejectedValueOnce(new Error("Send failed"))
        .mockResolvedValueOnce(undefined);

      const emailOptions: EmailOptions = {
        to: "test@example.com",
        subject: "Test Email",
        templateName: "test",
        templateData: {},
      };

      (notificationService as any).addToQueue(emailOptions);

      // First attempt
      notificationService.manuallyTriggerQueueProcessing();
      await vi.runAllTimersAsync();

      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: "Email sending failed, scheduled for retry",
          retryAttempt: "1/3",
          to: emailOptions.to,
          subject: emailOptions.subject,
        })
      );

      // Advance time to next retry
      vi.advanceTimersByTime(100);
      notificationService.manuallyTriggerQueueProcessing();
      await vi.runAllTimersAsync();

      expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: "Task added to queue",
          to: emailOptions.to,
          subject: emailOptions.subject,
        })
      );
    });

    it("should log error after max retries", async () => {
      vi.spyOn(mockEmailService, "sendEmail").mockRejectedValue(
        new Error("Send failed")
      );

      const emailOptions: EmailOptions = {
        to: "test@example.com",
        subject: "Test Email",
        templateName: "test",
        templateData: {},
      };

      (notificationService as any).addToQueue(emailOptions);

      for (let i = 0; i <= 3; i++) {
        notificationService.manuallyTriggerQueueProcessing();
        await vi.runAllTimersAsync();
        vi.advanceTimersByTime(150);
      }

      expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(4);
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: "Email permanently failed to send",
          retries: 3,
          to: emailOptions.to,
          subject: emailOptions.subject,
        })
      );
    });
  });

  describe("Concurrent processing", () => {
    it("should process multiple emails concurrently", async () => {
      vi.spyOn(mockEmailService, "sendEmail").mockResolvedValue(undefined);

      const emailOptions1: EmailOptions = {
        to: "test1@example.com",
        subject: "Test Email 1",
        templateName: "test",
        templateData: {},
      };

      const emailOptions2: EmailOptions = {
        to: "test2@example.com",
        subject: "Test Email 2",
        templateName: "test",
        templateData: {},
      };

      (notificationService as any).addToQueue(emailOptions1);
      (notificationService as any).addToQueue(emailOptions2);

      notificationService.manuallyTriggerQueueProcessing();
      await vi.runAllTimersAsync();

      expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(2);
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(emailOptions1);
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(emailOptions2);
    });
  });

  describe("Error handling", () => {
    it("should handle non-Error objects thrown by emailService", async () => {
      vi.spyOn(mockEmailService, "sendEmail").mockRejectedValue(
        "Non-error object"
      );

      const emailOptions: EmailOptions = {
        to: "test@example.com",
        subject: "Test Email",
        templateName: "test",
        templateData: {},
      };

      (notificationService as any).addToQueue(emailOptions);

      notificationService.manuallyTriggerQueueProcessing();
      await vi.runAllTimersAsync();

      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: "Email sending failed, scheduled for retry",
          error: "Non-error object",
          to: emailOptions.to,
          subject: emailOptions.subject,
        })
      );
    });
  });
});
