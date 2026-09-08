import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EmailComposerModal } from '../../components/communication/EmailComposerModal';
import { EmailRecord } from '../../types/communication';

export const EmailComposePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSendEmail = (newEmail: EmailRecord) => {
    // Navigate back to the emails list with confirmation
    navigate('/communication/emails');
  };

  const handleClose = () => {
    navigate('/communication/emails');
  };

  return (
    <div className="py-2">
      <EmailComposerModal
        isOpen={true}
        onClose={handleClose}
        onSendEmail={handleSendEmail}
      />
    </div>
  );
};
