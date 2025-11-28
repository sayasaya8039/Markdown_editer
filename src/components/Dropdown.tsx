import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
}

interface DropdownProps {
    label?: string | React.ReactNode;
    icon?: React.ReactNode;
    items: DropdownItem[];
    title?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ label, icon, items, title }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="dropdown" ref={dropdownRef}>
            <button
                className={`dropdown-trigger ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title={title}
            >
                {icon && <span className="dropdown-icon">{icon}</span>}
                {label && <span className="dropdown-label">{label}</span>}
                <ChevronDown size={14} className="dropdown-arrow" />
            </button>
            {isOpen && (
                <div className="dropdown-menu">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="dropdown-item"
                            onClick={() => {
                                item.onClick();
                                setIsOpen(false);
                            }}
                        >
                            {item.icon && <span className="item-icon">{item.icon}</span>}
                            {item.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
