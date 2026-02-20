interface DownloadFileParams {
  fileName: string;
  content: string;
  mimeType: string;
}

export const downloadFile = ({ fileName, content, mimeType }: DownloadFileParams): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};
