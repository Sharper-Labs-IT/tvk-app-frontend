import React from 'react';

interface FormInputProps {
  label: string;
  type?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormInput: React.FC<FormInputProps> = ({ label, type = 'text', name, value, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-gold font-medium mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-black border border-gold text-gold rounded focus:outline-none focus:ring-2 focus:ring-gold"
      />
    </div>
  );
};

export default FormInput;
