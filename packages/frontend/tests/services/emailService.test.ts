import "reflect-metadata";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { EmailService } from "@/services/emailService";
import { EmailTemplateService } from "@/services/emailTemplateService";
import nodemailer from "nodemailer";

vi.mock("nodemailer");
vi.mock("./emailTemplateService");

describe("EmailService", () => {
  let emailService: EmailService;
  let mockEmailTemplateService: EmailTemplateService;
  let mockTransporter: nodemailer.Transporter;

  beforeEach(() => {
    mockEmailTemplateService = {
      renderTemplate: vi.fn(),
    } as unknown as EmailTemplateService;
    mockTransporter = {
      sendMail: vi.fn().mockResolvedValue({ messageId: "test-message-id" }),
    } as unknown as nodemailer.Transporter;

    vi.mocked(nodemailer.createTransport).mockReturnValue(mockTransporter);

    emailService = new EmailService(mockEmailTemplateService);
  });

  describe("sendEmail", () => {
    it("should send an email successfully", async () => {
      vi.mocked(mockEmailTemplateService.renderTemplate).mockReturnValue(
        "<h1>Test Email</h1>"
      );

      await emailService.sendEmail({
        to: "test@example.com",
        subject: "Test Subject",
        templateName: "testTemplate",
        templateData: { name: "Test User" },
      });

      expect(mockEmailTemplateService.renderTemplate).toHaveBeenCalledWith(
        "testTemplate",
        { name: "Test User" }
      );
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: "Test Subject",
          html: "<h1>Test Email</h1>",
        })
      );
    });

    it("should throw an error if email sending fails", async () => {
      vi.mocked(mockEmailTemplateService.renderTemplate).mockReturnValue(
        "<h1>Test Email</h1>"
      );
      vi.mocked(mockTransporter.sendMail).mockRejectedValue(
        new Error("Email sending failed")
      );

      await expect(
        emailService.sendEmail({
          to: "test@example.com",
          subject: "Test Subject",
          templateName: "testTemplate",
          templateData: { name: "Test User" },
        })
      ).rejects.toThrow("Failed to send email");
    });
  });
});
