import "reflect-metadata";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { EmailTemplateService } from "@/services/emailTemplateService";
import fs from "fs";
import path from "path";
import logger from "@/utils/logger";

vi.mock("fs");
vi.mock("path");
vi.mock("@/utils/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("EmailTemplateService", () => {
  let emailTemplateService: EmailTemplateService;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(fs.readdirSync).mockReturnValue([
      "template1.html",
      "template2.html",
    ] as any);
    vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
      if (typeof filePath === "string") {
        if (filePath.includes("template1.html")) {
          return "Hello {{name}}";
        } else if (filePath.includes("template2.html")) {
          return "Welcome to {{company}}";
        }
      }
      return "";
    });
    vi.mocked(path.join).mockImplementation((dir, file) => `${dir}/${file}`);
    vi.mocked(path.basename).mockImplementation((filePath) => {
      if (filePath.includes("template1.html")) {
        return "template1";
      } else if (filePath.includes("template2.html")) {
        return "template2";
      }
      return "";
    });

    emailTemplateService = new EmailTemplateService("/mock/templates/dir");
    emailTemplateService.loadTemplates("/mock/templates/dir");
  });

  describe("renderTemplate", () => {
    it("should render a template successfully", () => {
      const result = emailTemplateService.renderTemplate("template1", {
        name: "John",
      });
      expect(result).toBe("Hello John");
    });

    it("should throw an error for non-existent template", () => {
      expect(() =>
        emailTemplateService.renderTemplate("nonexistent", {})
      ).toThrow("Template not found: nonexistent");
    });
  });

  describe("loadTemplates", () => {
    it("should load templates from the specified directory", () => {
      expect(fs.readdirSync).toHaveBeenCalledWith("/mock/templates/dir");
      expect(fs.readFileSync).toHaveBeenCalledTimes(4);
    });

    it("should throw an error when loading templates fails", () => {
      vi.mocked(fs.readdirSync).mockImplementationOnce(() => {
        throw new Error("Directory read error");
      });

      expect(() =>
        emailTemplateService.loadTemplates("/mock/templates/dir")
      ).toThrowError("Failed to load email templates");

      expect(logger.error).toHaveBeenCalledWith(
        "Error loading email templates",
        expect.objectContaining({
          error: expect.any(String),
          templatesDir: "/mock/templates/dir",
        })
      );
    });
  });

  describe("setTemplate", () => {
    it("should allow setting a template for testing", () => {
      emailTemplateService.setTemplate("testTemplate", "Test {{value}}");
      const result = emailTemplateService.renderTemplate("testTemplate", {
        value: "Success",
      });
      expect(result).toBe("Test Success");
    });
  });
});
