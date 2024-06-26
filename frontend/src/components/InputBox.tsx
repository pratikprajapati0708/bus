import React from "react";

interface InputProps {
    label: string;
    id: string;
    type: string;
    value : string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputBox: React.FC<InputProps> = ({ label, id, type, value, onChange }) => {
    return (
        <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">{label}</label>
            <div className="mt-2">
                <input id={id} type={type} value={value} required
                    className="block w-full rounded-md border-0 py-1.5
                 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
                 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={onChange} />
            </div>
        </div>
    );
};

export default InputBox;