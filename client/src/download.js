// ======================================================
// FILE DOWNLOAD HELPERS
// ======================================================

// Let the browser save a Blob as a file
export const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  // Give the browser time to start the download first
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Convert rows (arrays of values) into CSV text
export const toCsv = (rows) =>
  rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

// Download rows as a CSV file
export const downloadCsv = (fileName, rows) =>
  downloadBlob(new Blob([toCsv(rows)], { type: "text/csv" }), fileName);
