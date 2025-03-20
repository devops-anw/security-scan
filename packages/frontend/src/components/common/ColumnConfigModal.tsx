import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import MemCryptRedButton from "../common/MemcryptRedButton";
import Text from "@/components/text/Text";
import * as Tooltip from "@radix-ui/react-tooltip";

interface ColumnsConfigModalProps {
  columns: { value: string; label: string }[];
  selectedColumns: string[];
  onColumnSelect: (selectedColumns: string[]) => void;
  showModal: boolean;
  onClose: () => void;
}

const ColumnsConfigModal: React.FC<ColumnsConfigModalProps> = ({
  columns,
  selectedColumns,
  onColumnSelect,
  showModal,
  onClose,
}) => {
  const [currentSelectedColumns, setCurrentSelectedColumns] = useState<
    string[]
  >([]);

  useEffect(() => {
    setCurrentSelectedColumns(selectedColumns);
  }, [selectedColumns, showModal]);

  const isAllSelected = currentSelectedColumns.length === columns.length;
  const isSaveDisabled = currentSelectedColumns.length < 2;

  const handleSelectAllChange = () => {
    if (isAllSelected) {
      setCurrentSelectedColumns([]);
    } else {
      setCurrentSelectedColumns(columns.map((col) => col.value));
    }
  };

  const handleCheckboxChange = (column: string) => {
    setCurrentSelectedColumns((prevSelected) => {
      const updatedSelection = prevSelected.includes(column)
        ? prevSelected.filter((col) => col !== column)
        : [...prevSelected, column];
      return updatedSelection;
    });
  };

  const handleSave = () => {
    onColumnSelect(currentSelectedColumns);
    onClose();
  };

  return (
    <Dialog open={showModal} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-white p-6 rounded-lg shadow-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-memcryptRed">
            Configure Table
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <p className="text-gray-600 text-sm mb-6">
            Configure the table by selecting what information is to be shown.
            Use the options below to manage the visible columns. At least two
            columns must be selected.
          </p>
          <div className="space-y-2">
            <label
              htmlFor="select-all"
              className="flex items-center space-x-3 cursor-pointer bg-gray-100 px-4 py-2 rounded-md shadow-sm"
            >
              <input
                type="checkbox"
                id="select-all"
                checked={isAllSelected}
                onChange={handleSelectAllChange}
                className="w-4 h-4 text-memcryptRed border-gray-300 rounded focus:ring-memcryptRed"
                style={{ accentColor: "#C02427" }}
              />
              <span className="text-gray-800 font-semibold">Select All</span>
            </label>

            {columns.map((column) => (
              <label
                key={column.value}
                htmlFor={column.value}
                className="flex items-center space-x-3 cursor-pointer bg-gray-100 px-4 py-2 rounded-md shadow-sm"
              >
                <input
                  type="checkbox"
                  id={column.value}
                  checked={currentSelectedColumns.includes(column.value)}
                  onChange={() => handleCheckboxChange(column.value)}
                  className="w-4 h-4 text-memcryptRed border-gray-300 rounded focus:ring-memcryptRed"
                  style={{ accentColor: "#C02427" }}
                />
                <span className="text-gray-800">{column.label}</span>
              </label>
            ))}
          </div>
          <div className="mt-8 flex justify-end space-x-4 relative">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-memcryptRed text-memcryptRed hover:bg-red-50 hover:text-memcryptRed"
            >
              <Text text="Cancel" />
            </Button>
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div className="relative">
                    <MemCryptRedButton
                      onClick={handleSave}
                      disabled={isSaveDisabled}
                      width="auto"
                    >
                      <Text text="Save" />
                    </MemCryptRedButton>
                  </div>
                </Tooltip.Trigger>

                {isSaveDisabled && (
                  <Tooltip.Content
                    side="top"
                    align="center"
                    sideOffset={10}
                    className="bg-gray-700 text-white text-xs rounded-md px-3 py-1 shadow-lg max-w-32"
                    style={{
                      transform: "translateX(-30px)",
                    }}
                  >
                    At least two columns must be selected to save.
                    <Tooltip.Arrow className="fill-gray-700" />
                  </Tooltip.Content>
                )}
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnsConfigModal;
