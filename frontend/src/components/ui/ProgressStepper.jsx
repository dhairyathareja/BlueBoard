import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiUser, FiAward, FiCloud, FiFileText, FiSend } from 'react-icons/fi';

const ProgressStepper = ({ employee }) => {
  const steps = [
    { label: 'Employee Created', icon: FiUser },
    { label: 'Role Assigned', icon: FiAward },
    { label: 'AWS Provisioned', icon: FiCloud },
    { label: 'Company Documents Uploaded', icon: FiFileText },
    { label: 'Employee Documents Uploaded', icon: FiFileText },
    { label: 'Documents Verified', icon: FiSend }
  ];

  // Derive active steps
  const isCreated = !!employee;
  const isRoleAssigned = !!employee?.role;
  const isAwsProvisioned = !!employee?.awsProfile;
  
  const isCompanyDocsUploaded = Boolean(employee?.companyDocumentsUploaded ?? employee?.companyDocumentsCount > 0);
  const inferredEmployeeDocsUploaded =
    employee?.onboardingStatus === 'Documents Pending' || employee?.onboardingStatus === 'Completed';
  const employeeDocumentFlag = employee?.employeeDocumentsUploaded;
  const employeeDocumentCount = employee?.employeeDocumentsCount;
  const isEmployeeDocsUploaded = Boolean(
    employeeDocumentFlag !== undefined
      ? employeeDocumentFlag
      : employeeDocumentCount !== undefined
      ? employeeDocumentCount > 0
      : inferredEmployeeDocsUploaded
  );
  const isCompleted = employee?.onboardingStatus === 'Completed' && employee?.status === 'Active';

  const stepStatus = [
    isCreated,
    isRoleAssigned,
    isAwsProvisioned,
    isCompanyDocsUploaded,
    isEmployeeDocsUploaded,
    isCompleted
  ];

  // Count completed steps
  const completedCount = stepStatus.filter(Boolean).length;
  const percentage = Math.round((completedCount / steps.length) * 100);

  return (
    <div style={{ padding: '24px', background: 'rgba(0, 0, 0, 0.15)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
      {/* Title & Percentage */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Onboarding Progress
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Current stage: {steps[completedCount - 1]?.label || 'Pending Creation'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
            {percentage}%
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
            Completed
          </span>
        </div>
      </div>

      {/* Stepper Visuals */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
        
        {/* Progress Line Background */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '24px',
          height: '4px',
          background: 'var(--border-color)',
          zIndex: 1,
          transform: 'translateY(-50%)',
          borderRadius: '2px'
        }} />

        {/* Animated Active Progress Line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((completedCount - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            left: 0,
            top: '24px',
            height: '4px',
            background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
            zIndex: 2,
            transform: 'translateY(-50%)',
            borderRadius: '2px',
            boxShadow: '0 0 8px rgba(139, 92, 246, 0.4)'
          }}
        />

        {/* Steps */}
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = stepStatus[idx];
          const isCurrent = idx === completedCount - 1 || (idx === 0 && completedCount === 0);

          return (
            <div key={idx} style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' }}>
              
              {/* Circle */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isDone ? 'var(--primary)' : 'var(--bg-secondary)',
                  borderColor: isDone ? 'var(--primary)' : isCurrent ? 'var(--primary)' : 'var(--border-color)',
                  color: isDone ? '#ffffff' : isCurrent ? 'var(--primary)' : 'var(--text-muted)'
                }}
                transition={{ duration: 0.3 }}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  border: '2px solid',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isCurrent ? '0 0 12px rgba(139, 92, 246, 0.4)' : 'none',
                  cursor: 'default'
                }}
              >
                {isDone && idx < completedCount - 1 ? (
                  <FiCheck size={18} />
                ) : (
                  <Icon size={18} />
                )}
              </motion.div>

              {/* Label */}
              <span style={{
                marginTop: '10px',
                fontSize: '0.7rem',
                fontWeight: isCurrent || isDone ? 600 : 400,
                color: isCurrent ? 'var(--primary)' : isDone ? 'var(--text-primary)' : 'var(--text-muted)',
                textAlign: 'center',
                fontFamily: 'var(--font-display)',
                lineHeight: 1.2
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressStepper;
