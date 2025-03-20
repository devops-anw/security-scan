"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { uploadAgentBinary } from "@/lib/agentBinary";
import MemCryptRedButton from "../common/MemcryptRedButton";
import {
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { agentBinaryTexts } from "@/texts/agent-binary/agent-binary";
import Text from "@/components/text/Text";

const schema = z.object({
  file: z
    .instanceof(File)
    .optional()
    .refine(
      (file) =>
        !file ||
        file.size <
          (Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE) || 104857600),
      "File size must be less than 100MB"
    ),
});

type FormValues = z.infer<typeof schema>;

interface AgentUploadFormProps {
  accessToken: string;
  onUploadSuccess: () => void;
}

export function AgentBinaryUploadForm({
  accessToken,
  onUploadSuccess,
}: AgentUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    trigger,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data: FormValues) => {
    if (!data.file) {
      setUploadMessage({
        type: "error",
        message: "Please select a file to upload.",
      });
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", data.file);
      const result = await uploadAgentBinary(formData);
      if (result.success) {
        setUploadMessage({
          type: "success",
          message:
            result.message || agentBinaryTexts.uploadSuccess.defaultMessage,
        });
        reset();
        setFileName(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        onUploadSuccess();
      } else {
        setUploadMessage({
          type: "error",
          message:
            result.message || agentBinaryTexts.uploadFailed.defaultMessage,
        });
      }
    } catch (error: any) {
      console.error("Error during upload:", error);
      setUploadMessage({
        type: "error",
        message: error.message || agentBinaryTexts.unexpectedError,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (file: File | null) => {
    setUploadMessage(null);
    if (file) {
      setValue("file", file, { shouldValidate: true });
      setFileName(file.name);
    } else {
      setValue("file", undefined);
      setFileName(null);
    }
    await trigger("file");
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-md mx-auto bg-white sm:p-8 w-[250px] sm:w-[400px] md:w-[400px] lg:w-full"
    >
      <div className="space-y-2 ">
        <p className="block text-sm font-medium text-gray-700">
          <Text text={agentBinaryTexts.agentBinaryFile} />
        </p>
        <div
          className={`flex items-center justify-center w-full ${
            isDragging
              ? "border-red-500 bg-red-50"
              : "border-gray-300 bg-gray-50"
          } border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition duration-300 ease-in-out`}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <label
            htmlFor="file"
            className="flex flex-col items-center justify-center w-full h-32"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <CloudArrowUpIcon className="w-10 h-10 text-memcryptRed mb-3" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">
                  <Text text={agentBinaryTexts.clickToUpload} />{" "}
                </span>{" "}
                <Text text={agentBinaryTexts.dragAndDrop} />
              </p>
              <p className="text-xs text-gray-500">
                <Text text={agentBinaryTexts.fileFormatDescription} />
              </p>
            </div>
            <input
              type="file"
              id="file"
              ref={fileInputRef}
              accept="application/x-zip-compressed,application/gzip,application/x-tar,application/x-tar-gz"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        </div>
        {fileName && (
          <p className="mt-2 text-sm text-gray-500 truncate">
            <Text text={agentBinaryTexts.selectedFile} />: {fileName}
          </p>
        )}
        {errors.file && (
          <p className="mt-2 text-sm text-red-600">{errors.file.message}</p>
        )}
      </div>
      {uploadMessage && (
        <div
          className={`mt-4 p-4 rounded-md ${
            uploadMessage.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          } flex items-center`}
        >
          {uploadMessage.type === "success" ? (
            <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
          ) : (
            <XCircleIcon className="h-5 w-5 text-red-400 mr-3" />
          )}
          <span>{uploadMessage.message}</span>
        </div>
      )}
      <div className="flex justify-center">
        <MemCryptRedButton
          type="submit"
          width="full"
          disabled={!isValid || isUploading || !fileName}
        >
          {isUploading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <Text text={agentBinaryTexts.uploading} />
            </>
          ) : (
            <Text text={agentBinaryTexts.uploadAgentBinaryFile} />
          )}
        </MemCryptRedButton>
      </div>
    </form>
  );
}
