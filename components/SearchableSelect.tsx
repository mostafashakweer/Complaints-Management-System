
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SearchIcon, ChevronDownIcon } from './icons';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder = 'اختر...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => options.find(opt => opt.value === value), [options, value]);

  const filteredOptions = useMemo(() =>
    options.filter(opt =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    ), [options, searchTerm]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 pr-10 text-right bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
      >
        <span className="block truncate">{selectedOption ? selectedOption.label : <span className="text-gray-500">{placeholder}</span>}</span>
        <span className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-border">
          <div className="p-2">
            <div className="relative">
                <input
                    type="text"
                    placeholder="بحث..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 pl-8 border border-gray-300 rounded-md"
                    autoFocus
                />
                 <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <SearchIcon className="w-5 h-5 text-gray-400" />
                </span>
            </div>
          </div>
          <ul className="max-h-60 overflow-auto">
            {filteredOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-white ${value === option.value ? 'bg-secondary text-primary font-semibold' : 'text-gray-900'}`}
              >
                {option.label}
              </li>
            ))}
             {filteredOptions.length === 0 && (
                <li className="px-4 py-2 text-sm text-gray-500">لا توجد نتائج</li>
             )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
