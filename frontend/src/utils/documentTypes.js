export const BACKEND_DOCUMENT_TYPES = [
  'Offer Letter',
  'Appointment Letter',
  'Joining Letter',
  'NDA',
  'Government ID',
  'Address Proof',
  'PAN',
  'Passport',
  'Resume',
  'Experience Certificate'
];

export const COMPANY_DOCUMENT_TYPES = [
  'Offer Letter',
  'Appointment Letter',
  'Joining Letter',
  'NDA'
];

export const EMPLOYEE_DOCUMENT_TYPES = [
  'Government ID',
  'Address Proof',
  'PAN',
  'Passport',
  'Resume',
  'Experience Certificate'
];

const getId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value._id || '';
};

export const isEmployeeUploadedDocument = (document, employee) => {
  return getId(document?.uploadedBy) === getId(employee);
};

export const isCompanyDocument = (document, employee) => {
  return !!document && !isEmployeeUploadedDocument(document, employee);
};

export default BACKEND_DOCUMENT_TYPES;
