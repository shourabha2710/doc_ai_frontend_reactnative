import axios from 'axios';
import { API_ENDPOINTS } from '../utils/constants';

// Axios instance
const api = axios.create({
  timeout: 120000,
});

/**
 * Send document files to FastAPI extraction API
 * @param {Object} params - {documentType, frontImage, backImage, pdfFile}
 * @param {Function} onProgress
 */
export const extractDocument = async (params, onProgress) => {
  const { documentType, frontImage, backImage, pdfFile } = params || {};

  if (!frontImage && !pdfFile) {
    throw new Error("No files provided for extraction.");
  }

  const formData = new FormData();
  formData.append("document_type", documentType);

  if (frontImage) {
    formData.append("front_image", {
      uri: frontImage.uri,
      type: frontImage.type ?? "image/jpeg",
      name: frontImage.name ?? "document.jpg",
    });
  } else if (pdfFile) {
    formData.append("front_image", {
      uri: pdfFile.uri,
      type: pdfFile.type ?? "application/pdf",
      name: pdfFile.name ?? "document.pdf",
    });
  }

  if (backImage) {
    formData.append("back_image", {
      uri: backImage.uri,
      type: backImage.type ?? "image/jpeg",
      name: backImage.name ?? "back_document.jpg",
    });
  }

  try {
    const response = await api.post(
      API_ENDPOINTS.extract,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percent);
          }
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Extraction API Error:",
      error?.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Normalize Backend Response
 * @param {Object} response
 */
export const normalizeExtractionResult = (response) => {
  let extractedFields = {};
  
  if (response.document_type === "pan") {
    extractedFields = response.pan_fields || {};
  } else if (response.document_type === "aadhaar") {
    extractedFields = response.aadhaar_fields || {};
  } else if (response.document_type === "passport") {
    extractedFields = response.passport_fields || {};
  } else if (response.document_type === "dl") {
    extractedFields = response.dl_fields || {};
  } else if (response.document_type === "voter") {
    extractedFields = response.voterid_fields || {};
  }
  
  return {
    documentType: response.document_type || "unknown",
    blurScore: response.blur_score,
    rotationAngle: response.rotation_angle,
    documentCropped: response.document_cropped,
    qrData: response.qr_data,
    rawText: response.raw_text,
    status: response.status,
    reason: response.reason,
    fields: extractedFields
  };
};

/**
 * Backend health check
 */
export const pingBackend = async () => {
  try {
    const url = API_ENDPOINTS.extract.replace("/extract", "/");
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Health check failed:", error.message);
    throw error;
  }
};