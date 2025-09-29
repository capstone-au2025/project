import React, { type ChangeEvent } from 'react';

interface QuestionBoxProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
}

const QuestionBox: React.FC<QuestionBoxProps> = ({
    label,
    name,
    value,
    onChange,
    placeholder
}) => {
    return (
        <div style={{ marginBottom: '30px' }}>
            <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: 'bold',
                fontSize: '16px'
            }}>
                {label}
            </label>
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    height: '120px',
                    padding: '15px',
                    border: '2px solid #000',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none'
                }}
            />
        </div>
    );
};

export default QuestionBox;