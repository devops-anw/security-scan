interface PaginationCounterProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

const PaginationCounter = ({
  currentPage,
  itemsPerPage,
  totalItems,
}: PaginationCounterProps) => {
  if (totalItems === 0) {
    return null;
  }
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="text-sm text-gray-700 mb-4 sm:mb-0">
      Showing{" "}
      <span className="font-medium">{totalItems === 0 ? 0 : startItem}</span> to{" "}
      <span className="font-medium">{endItem}</span> of{" "}
      <span className="font-medium">{totalItems}</span> results
    </div>
  );
};

export default PaginationCounter;
