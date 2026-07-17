import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiCloud, FiAward, FiArrowRight, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import PageHeader from '../../components/layout/PageHeader';
import ProgressStepper from '../../components/ui/ProgressStepper';
import Loader from '../../components/ui/Loader';
import authService from '../../services/auth.service';
import documentService from '../../services/document.service';
import { isCompanyDocument, isEmployeeUploadedDocument } from '../../utils/documentTypes';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [companyDocsCount, setCompanyDocsCount] = useState(0);
  const [employeeDocsCount, setEmployeeDocsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        // Fetch fresh populated user profile details
        const res = await authService.getProfileInfo(user._id);
        const userDetails = res.user;
        setProfile(userDetails);

        // Fetch user documents count
        if (userDetails?.employeeId) {
          const docsRes = await documentService.getEmployeeDocuments(userDetails.employeeId);
          const documents = docsRes.documents || [];
          setCompanyDocsCount(documents.filter((doc) => isCompanyDocument(doc, userDetails)).length);
          setEmployeeDocsCount(documents.filter((doc) => isEmployeeUploadedDocument(doc, userDetails)).length);
        }
      } catch (err) {
        console.error('Error fetching employee dashboard profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeProfile();
  }, [user]);

  if (loading) {
    return <Loader />;
  }

  const isAwsActive = !!profile?.awsProfile;
  const isDocsUploaded = employeeDocsCount > 0;
  const onboardingFinished = profile?.onboardingStatus === 'Completed';
  const profileWithProgress = {
    ...profile,
    companyDocumentsCount: companyDocsCount,
    employeeDocumentsCount: employeeDocsCount,
  };

  return (
    <div style={{ padding: '32px' }}>
      <PageHeader
        title={`Welcome, ${profile?.name}`}
        subtitle={`Designation: ${profile?.designation} | Department: ${profile?.department}`}
      />

      {/* Onboarding Stage Stepper */}
      <ProgressStepper employee={profileWithProgress} />

      {/* Action alerts */}
      {!onboardingFinished && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiAlertTriangle size={20} />
            <span>
              {!isDocsUploaded
                ? 'Your onboarding documents are pending review. Please submit them to complete your profile verification.'
                : !isAwsActive
                ? 'Your company AWS console account is being provisioned. Please check back shortly.'
                : 'Your document validation is in progress. Awaiting final credentials issue.'
              }
            </span>
          </div>
          <button
            onClick={() => navigate(isDocsUploaded ? '/employee/aws-details' : '/employee/documents')}
            className="btn btn-primary"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              height: '32px',
              background: 'var(--primary)',
              border: 'none'
            }}
          >
            Resolve <FiArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Action Cards */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        
        {/* Card 1: Documents status */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '16px' }}>
              <FiFileText size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
              My Uploaded Documents
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              You have submitted {employeeDocsCount} onboarding file(s). HR has shared {companyDocsCount} company file(s).
            </p>
          </div>
          <button onClick={() => navigate('/employee/documents')} className="btn btn-secondary" style={{ width: '100%' }}>
            Upload Documents
          </button>
        </div>

        {/* Card 2: AWS access status */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--secondary-light)', border: '1px solid rgba(6, 182, 212, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', marginBottom: '16px' }}>
              <FiCloud size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
              AWS IAM Access Profile
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {isAwsActive
                ? `Account provisioned under IAM Username: ${profile.awsProfile.iamUserName || 'User'}.`
                : 'AWS console login profile is not yet active for this account.'
              }
            </p>
          </div>
          <button onClick={() => navigate('/employee/aws-details')} className="btn btn-secondary" style={{ width: '100%' }}>
            View AWS Access Details
          </button>
        </div>

        {/* Card 3: Role & group info */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--success-light)', border: '1px solid var(--success-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', marginBottom: '16px' }}>
              <FiAward size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
              Assigned Corporate Role
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {profile?.role
                ? `Assigned: ${profile.role.roleName} (IAM Policy: ${profile.role.awsGroupName}).`
                : 'No corporate permissions mapped to this profile yet.'
              }
            </p>
          </div>
          <button onClick={() => navigate('/employee/profile')} className="btn btn-secondary" style={{ width: '100%' }}>
            View My Profile
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmployeeDashboard;
