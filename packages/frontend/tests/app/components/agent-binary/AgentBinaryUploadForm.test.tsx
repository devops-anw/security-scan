import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import { uploadAgentBinary } from "@/lib/agentBinary";
import { AgentBinaryUploadForm } from "@/components/agent-binary/AgentBinaryUploadForm";
import { IntlProvider } from "react-intl";
import { agentBinaryTexts } from "@/texts/agent-binary/agent-binary";

// Mocking the uploadAgentBinary function
vi.mock("@/lib/agentBinary", () => ({
  uploadAgentBinary: vi.fn(),
}));

describe("AgentBinaryUploadForm", () => {
  const mockOnUploadSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the form correctly", () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <AgentBinaryUploadForm
          accessToken="test-token"
          onUploadSuccess={mockOnUploadSuccess}
        />
      </IntlProvider>
    );

    const button = screen.getByRole("button", {
      name: /Upload Agent Binary File/i,
    });
    expect(button).toBeInTheDocument();
  });

  it("renders the upload button", () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <AgentBinaryUploadForm
          accessToken="test-token"
          onUploadSuccess={mockOnUploadSuccess}
        />
      </IntlProvider>
    );

    expect(
      screen.getByText(agentBinaryTexts.uploadAgentBinaryFile.defaultMessage)
    ).toBeInTheDocument();
  });

  it("displays the correct Upload Agent Binary File", async () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <AgentBinaryUploadForm
          accessToken="test-token"
          onUploadSuccess={mockOnUploadSuccess}
        />
      </IntlProvider>
    );

    const fileInput = screen.getByText(
      agentBinaryTexts.clickToUpload.defaultMessage
    );

    const file = new File(["dummy content"], "test.zip", {
      type: "application/zip",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText(`Upload Agent Binary File`)).toBeInTheDocument();
  });

  it("should trigger the file change event and set file name", async () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <AgentBinaryUploadForm
          accessToken="test-token"
          onUploadSuccess={mockOnUploadSuccess}
        />
      </IntlProvider>
    );

    const fileInput = screen.getByLabelText(
      /click to upload/i
    ) as HTMLInputElement;
    const file = new File(["file content"], "test-file.zip", {
      type: "application/zip",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => screen.getByText(/test-file.zip/i));
    expect(screen.getByText(/test-file.zip/i)).toBeInTheDocument();
  });

  it("should disable the submit button when file is uploading", async () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <AgentBinaryUploadForm
          accessToken="test-token"
          onUploadSuccess={mockOnUploadSuccess}
        />
      </IntlProvider>
    );

    const fileInput = screen.getByLabelText(
      /click to upload/i
    ) as HTMLInputElement;
    const file = new File(["file content"], "test-file.zip", {
      type: "application/zip",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    const button = screen.getByRole("button", {
      name: /Upload Agent Binary File/i,
    });
    fireEvent.click(button);

    // Mock the uploadAgentBinary to simulate uploading
    (uploadAgentBinary as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      message: "Upload successful",
    });

    // Wait for button to be disabled (when uploading)
    expect(button).toBeDisabled();
  });

  it("should display a drag-and-drop zone and handle drag events", () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <AgentBinaryUploadForm
          accessToken="test-token"
          onUploadSuccess={mockOnUploadSuccess}
        />
      </IntlProvider>
    );

    const dropZone = screen.getByText(/drag and drop/i);

    fireEvent.dragEnter(dropZone);
    expect(dropZone).toHaveClass("mb-2 text-sm text-gray-500");

    fireEvent.dragLeave(dropZone);
    expect(dropZone).not.toHaveClass("border-red-500");

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [new File(["file content"], "test-file.zip")] },
    });

    expect(screen.getByText(/test-file.zip/i)).toBeInTheDocument();
  });
});
