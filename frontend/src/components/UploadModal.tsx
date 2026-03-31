import { useState } from "react";
import api from '../api/apiClient';

interface UploadModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UploadModal({ show, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const handleClose = () => {
    setFile(null);
    setStatus("idle");
    setErrorDetail(null);
    onClose();
  };

  const handleUpload = async () => {
    if (!file) return;

    if (!file.name.endsWith(".835")) {
      setErrorDetail("File must be an .835 ERA file.");
      setStatus("error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("uploading");
      const response = await api.post("/era/upload", formData);
      console.log("Upload result:", response.data);
      setStatus("success");
      onSuccess?.();
      setTimeout(() => handleClose(), 1500);
    } catch (err: any) {
      setStatus("error");
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        setErrorDetail(detail);
      } else if (Array.isArray(detail)) {
        setErrorDetail(detail.map((d: any) => `${d.loc.join(".")}: ${d.msg}`).join(", "));
      } else {
        setErrorDetail("Upload failed");
      }
      console.error("Upload error:", err.response?.data ?? err.message);
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={handleClose} // clicking the backdrop closes the modal
    >
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">

          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title">Upload ERA .835 File</h5>
            <button className="btn-close" onClick={handleClose} />
          </div>

          {/* Body */}
          <div className="modal-body">
            <input
              type="file"
              accept=".835"
              className="form-control"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setStatus("idle");
                setErrorDetail(null);
              }}
            />

            {/* Status messages */}
            {status === "success" && (
              <p className="text-success mt-2 mb-0">✓ File ingested successfully. Closing...</p>
            )}
            {status === "error" && (
              <p className="text-danger mt-2 mb-0">{errorDetail}</p>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!file || status === "uploading" || status === "success"}
            >
              {status === "uploading" ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}