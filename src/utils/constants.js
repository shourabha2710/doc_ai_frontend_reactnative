// API Configuration
// Replace with your machine's IP when running on physical device via Expo Go
export const API_BASE_URL = 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  extract: `${API_BASE_URL}/extract`,
};

// Document Types
export const DOCUMENT_TYPES = [
  { label: 'Select Document Type', value: '' },
  { label: 'Aadhaar Card', value: 'aadhaar' },
  { label: 'PAN Card', value: 'pan' },
  { label: 'Passport', value: 'passport' },
  { label: 'Driving License', value: 'dl' },
  { label: 'Voter ID', value: 'voter' },
];

// Result fields to display on ResultScreen
export const RESULT_FIELDS = [
  { key: 'DocumentType', label: 'Document Type', icon: '🪪' },
  { key: 'Name', label: 'Full Name', icon: '👤' },
  { key: 'DateOfBirth', label: 'Date of Birth', icon: '🎂' },
  { key: 'DocumentNumber', label: 'Document Number', icon: '🔢' },
  { key: 'Address', label: 'Address', icon: '🏠' },
  { key: 'Phone', label: 'Phone', icon: '📞' },
  { key: 'Email', label: 'Email', icon: '✉️' },
  { key: 'ExpiryDate', label: 'Expiry Date', icon: '📅' },
];

// File types
export const FILE_TYPES = {
  IMAGE: 'image',
  PDF: 'pdf',
};

// Max file size: 10MB
export const MAX_FILE_SIZE_MB = 10;

// Image compression quality (0–1)
export const IMAGE_COMPRESSION_QUALITY = 0.7;
