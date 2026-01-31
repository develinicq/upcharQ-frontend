import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import useHospitalStep1Store from '../../../../store/useHospitalStep1Store';
import useHospitalRegistrationStore from '../../../../store/useHospitalRegistrationStore';
import useToastStore from '../../../../store/useToastStore';
import {
  FormFieldRow,
  RegistrationHeader,
  ProgressBar
} from '../../../../components/FormItems';
import InputWithMeta from '../../../../components/GeneralDrawer/InputWithMeta';
import CustomUpload from '../Doctor_registration/CustomUpload';
import RadioButton from '../../../../components/GeneralDrawer/RadioButton';

const Hos_4 = forwardRef((props, ref) => {
  const store = useHospitalRegistrationStore();
  const {
    gstin,
    hasCin,
    cinNumber,
    stateHealthReg,
    panCard,
    rohiniId,
    nabhAccreditation,
    setField,
    setDocument,
    documents
  } = store;

  const [formErrors, setFormErrors] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'gstin':
        if (!value) return 'GSTIN is required';
        if (value.length !== 15) return 'GSTIN must be 15 characters';
        return '';
      case 'stateHealthReg':
        if (!value) return 'Registration number is required';
        return '';
      case 'panCard':
        if (!value) return 'PAN Card is required';
        if (value.length !== 10) return 'PAN must be 10 characters';
        return '';
      case 'cinNumber':
        if (hasCin === 1 && !value) return 'CIN Number is required';
        return '';
      default: return '';
    }
  };

  const handleInputChange = (field, value) => {
    setField(field, value);
    setFormErrors(prev => ({
      ...prev,
      [field]: validateField(field, value)
    }));
  };

  // Sync hospitalId from Step 1 if missing
  const step1HospitalId = useHospitalStep1Store(s => s.hospitalId || s.response?.hospitalId);
  useEffect(() => {
    if (step1HospitalId && step1HospitalId !== store.hospitalId) {
      setField('hospitalId', step1HospitalId);
    }
  }, [step1HospitalId, setField, store.hospitalId]);

  useImperativeHandle(ref, () => ({
    async submit() {
      // Validate required documents
      const missing = [];
      const getDoc = (type) => documents?.find(d => d.type === type);

      if (!gstin) missing.push('GSTIN');
      if (!getDoc('GST_PROOF')) missing.push('GST Proof');

      if (!stateHealthReg) missing.push('State Health Registration Number');
      if (!getDoc('STATE_HEALTH_REG_PROOF')) missing.push('State Health Registration Proof');

      if (!panCard) missing.push('PAN Card Number');
      if (!getDoc('PAN_CARD')) missing.push('PAN Card Proof');

      if (missing.length > 0) {
        useToastStore.getState().addToast({
          title: 'Required Documents',
          message: `Please provide: ${missing.join(', ')}`,
          type: 'warning'
        });
        return false;
      }

      const ok = await store.submitDocuments();
      return !!ok;
    }
  }));

  return (
    <div className="flex flex-col h-full bg-white rounded-md shadow-sm overflow-hidden">
      <RegistrationHeader
        title="Documents Verification"
        subtitle="Provide your Document Numbers and Upload Supporting Document for verification"
      >

      </RegistrationHeader>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[700px] mx-auto space-y-4">

          {/* GSTIN Section */}
          <FormFieldRow>
            {/* Left Col: GSTIN Input + Fetched Data */}
            <div className="w-full flex flex-col gap-3">
              <div className="relative">
                <InputWithMeta
                  label="GSTIN"
                  infoIcon
                  requiredDot
                  placeholder="Enter 15-digit GSTIN"
                  value={gstin || ''}
                  onChange={(v) => handleInputChange('gstin', v)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-[31px] text-xs bg-secondary-grey50 px-[6px] py-[1px] rounded-sm text-secondary-grey300 hover:text-blue-primary250 transition-colors"
                >
                  Verify
                </button>
              </div>
              {formErrors.gstin && <span className="text-red-500 text-xs">{formErrors.gstin}</span>}


            </div>

            {/* Right Col: Upload */}
            <div className="w-full">
              <CustomUpload
                label="Upload Proof"
                noView={false}
                uploadContent="Upload File"
                uploadedKey={documents?.find(d => d.type === 'GST_PROOF')?.url}
                onUpload={(key) => setDocument({ type: 'GST_PROOF', no: gstin || '', url: key })}
                meta="Support Size upto 5MB in .pdf, .jpg, .doc"
              />
            </div>
          </FormFieldRow>

          {/* Fetched Details Box */}
          <div className="border flex flex-col gap-2 border-secondary-grey150/60 rounded-lg p-3 bg-white ">
            <p className="text-sm font-semibold text-secondary-grey400">Fetched Details from GSTIN</p>
            <div className=" text-sm text-secondary-grey200 flex flex-col gap-1.5">
              <p>Legal Business Name :</p>
              <p>Registered Address :</p>
              <p>Status :</p>
            </div>
          </div>

          {/* Other Documents List */}
          <div className="space-y-4">
            {/* State Health Reg */}
            <FormFieldRow>
              <div className="w-full">
                <InputWithMeta
                  label="State Health Registration Number"
                  requiredDot
                  placeholder="Enter State Registration Number"
                  value={stateHealthReg || ''}
                  onChange={(v) => handleInputChange('stateHealthReg', v)}
                />
                {formErrors.stateHealthReg && <span className="text-red-500 text-xs">{formErrors.stateHealthReg}</span>}
              </div>
              <div className="w-full">
                <CustomUpload
                  label="Upload Proof"
                  uploadContent="Upload File"
                  noView={false}
                  uploadedKey={documents?.find(d => d.type === 'STATE_HEALTH_REG_PROOF')?.url}
                  onUpload={(key) => setDocument({ type: 'STATE_HEALTH_REG_PROOF', no: stateHealthReg || '', url: key })}
                  meta="Support Size upto 5MB in .pdf, .jpg, .doc"
                />
              </div>
            </FormFieldRow>

            {/* PAN Card */}
            <FormFieldRow>
              <div className="w-full">
                <InputWithMeta
                  label="PAN Card of Hospital"
                  requiredDot
                  placeholder="Enter PAN Card Number"
                  value={panCard || ''}
                  onChange={(v) => handleInputChange('panCard', v)}
                />
                {formErrors.panCard && <span className="text-red-500 text-xs">{formErrors.panCard}</span>}
              </div>
              <div className="w-full">
                <CustomUpload
                  label="Upload Proof"
                  noView={false}
                  uploadContent="Upload File"
                  uploadedKey={documents?.find(d => d.type === 'PAN_CARD')?.url}
                  onUpload={(key) => setDocument({ type: 'PAN_CARD', no: panCard || '', url: key })}
                  meta="Support Size upto 5MB in .pdf, .jpg, .doc"
                />
              </div>
            </FormFieldRow>

            {/* Rohini ID */}
            <FormFieldRow>
              <div className="w-full">
                <InputWithMeta
                  label="Rohini ID"
                  placeholder="Enter 13-digit Rohini ID"
                  value={rohiniId || ''}
                  onChange={(v) => handleInputChange('rohiniId', v)}
                />
              </div>
              <div className="w-full">
                <CustomUpload
                  label="Upload Proof"
                  noView={false}
                  uploadContent="Upload File"
                  uploadedKey={documents?.find(d => d.type === 'ROHINI_ID')?.url}
                  onUpload={(key) => setDocument({ type: 'ROHINI_ID', no: rohiniId || '', url: key })}
                  meta="Support Size upto 5MB in .pdf, .jpg, .doc"
                />
              </div>
            </FormFieldRow>

            {/* NABH Accreditation */}
            <FormFieldRow>
              <div className="w-full">
                <InputWithMeta
                  label="NABH Accreditation"
                  placeholder="Enter NABH Accreditation ID"
                  value={nabhAccreditation || ''}
                  onChange={(v) => handleInputChange('nabhAccreditation', v)}
                />
              </div>
              <div className="w-full">
                <CustomUpload
                  label="Upload Proof"
                  noView={false}
                  uploadContent="Upload File"
                  uploadedKey={documents?.find(d => d.type === 'NABH')?.url}
                  onUpload={(key) => setDocument({ type: 'NABH', no: nabhAccreditation || '', url: key })}
                  meta="Support Size upto 5MB in .pdf, .jpg, .doc"
                />
              </div>
            </FormFieldRow>
          </div>

          <div className="border-t border-secondary-grey200/20"></div>

          {/* CIN Question */}
          <div className="flex items-center justify-between py-">
            <p className="text-sm text-secondary-grey400 ">Do you have CIN (Corporate Hospital Registration Number)?</p>
            <div className="flex gap-4 ">
              <RadioButton
                name="hasCin"
                value={1}
                label="Yes"
                checked={hasCin === 1}
                onChange={() => setField('hasCin', 1)}
              />
              <RadioButton
                name="hasCin"
                value={0}
                label="No"
                checked={hasCin === 0}
                onChange={() => setField('hasCin', 0)}
              />
            </div>
          </div>

          {hasCin === 1 && (
            <div className="">
              <InputWithMeta
                label="CIN Number"
                placeholder="Enter CIN Number"
                value={cinNumber || ''}
                onChange={(v) => handleInputChange('cinNumber', v)}
              />
              {formErrors.cinNumber && <span className="text-red-500 text-xs">{formErrors.cinNumber}</span>}
            </div>
          )}

          <div className='pb-4'></div>
        </div>
      </div>
    </div>
  );
});

export default Hos_4;
