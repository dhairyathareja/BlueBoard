/**
 * Application-wide constants for the BlueBoard platform.
 */

export const APP_NAME = 'BlueBoard';

export const ONBOARDING_STAGES = [
  'Employee Created',
  'Role Assigned',
  'AWS Provisioned',
  'Company Documents Uploaded',
  'Employee Documents Uploaded',
  'Credentials Sent'
];

export const EMPLOYEE_STATUSES = ['Active', 'Pending', 'Inactive'];

export const ONBOARDING_STATUSES = ['Pending', 'Documents Pending', 'Completed'];

export const AWS_REGIONS = [
  { value: 'ap-south-1', label: 'Mumbai (ap-south-1)' },
  { value: 'us-east-1', label: 'N. Virginia (us-east-1)' },
  { value: 'us-west-2', label: 'Oregon (us-west-2)' },
  { value: 'eu-west-1', label: 'Ireland (eu-west-1)' },
];
