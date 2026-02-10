import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Calendar, Filter, Check } from 'lucide-react';

interface FilterBarProps {
  onSearch: () => void;
  onReset: () => void;
}

const STORE_OPTIONS = ['Farmer Market-FM', 'Valley Fair-VF'];

const MultiSelect: React.FC<{ 
  label: string; 
  options: string[]; 
  value: string[]; 
  onChange: (val: string[]) => void; 
}> = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className="relative group" ref={ref}>
       <label className="absolute -top-2 left-2 px-1 bg-white text-[10px] font-medium text-slate-400 z-10">
         {label}
       </label>
       <button 
         onClick={() => setIsOpen(!isOpen)}
         className="w-full h-10 flex items-center justify-between text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all hover:border-slate-300"
         type="button"
       >
         <span className="truncate block text-left">
           {value.length === 0 ? '全部门店' : value.join(', ')}
         </span>
         <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
       </button>
       
       {isOpen && (
         <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 max-h-48 overflow-y-auto">
           {options.map(opt => (
             <div 
               key={opt}
               onClick={() => toggleOption(opt)}
               className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer"
             >
               <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${value.includes(opt) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                 {value.includes(opt) && <Check size={10} className="text-white" />}
               </div>
               <span className="text-xs text-slate-700">{opt}</span>
             </div>
           ))}
         </div>
       )}
    </div>
  );
};

const FilterBar: React.FC<FilterBarProps> = ({ onSearch, onReset }) => {
  const [selectedStores, setSelectedStores] = useState<string[]>([]);

  const handleReset = () => {
      setSelectedStores([]);
      onReset();
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60">
      <div className="flex items-center gap-2 mb-4 text-slate-800">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
             <Filter size={16} />
          </div>
          <span className="text-sm font-bold">筛选条件</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-4">
        
        {/* Search Group */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 flex gap-2">
            <div className="w-1/3 relative group">
                <select className="w-full h-10 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all appearance-none cursor-pointer hover:border-slate-300">
                    <option>SPU</option>
                    <option>SKC</option>
                    <option>选品ID</option>
                    <option>开发单号</option>
                    <option>Drop</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none group-hover:text-slate-600 transition-colors" />
            </div>
            <div className="w-2/3 relative group">
                <input 
                    type="text" 
                    placeholder="请输入关键词搜索..." 
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all hover:border-slate-300 placeholder:text-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none group-hover:text-blue-500 transition-colors" />
            </div>
        </div>

        {/* Existing Filters */}
        {[
            { label: '产品分类', placeholder: '全部分类' },
            { label: '选品状态', placeholder: '全部状态' },
            { label: '开发单状态', placeholder: '全部状态' },
            { label: '产品线', placeholder: '全部产品线' },
            { label: '企划开发员', placeholder: '全部人员' },
            { label: '开款渠道', placeholder: '全部渠道' }
        ].map((filter, index) => (
             <div key={index} className="relative group">
                <label className="absolute -top-2 left-2 px-1 bg-white text-[10px] font-medium text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
                    {filter.label}
                </label>
                <select className="w-full h-10 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all appearance-none cursor-pointer hover:border-slate-300">
                    <option>{filter.placeholder}</option>
                    {/* Options would go here */}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none group-hover:text-slate-600 transition-colors" />
            </div>
        ))}

        {/* New Multi-select Store Filter */}
        <MultiSelect 
            label="线下门店" 
            options={STORE_OPTIONS} 
            value={selectedStores} 
            onChange={setSelectedStores} 
        />

        {/* Date Range - Spanning */}
        <div className="md:col-span-2 xl:col-span-1 flex gap-2 items-center">
           <div className="w-28 relative group shrink-0">
                <label className="absolute -top-2 left-2 px-1 bg-white text-[10px] font-medium text-slate-400 z-10">时间类型</label>
                <select className="w-full h-10 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all appearance-none cursor-pointer hover:border-slate-300">
                  <option value="created">创建时间</option>
                  <option value="selection">选品时间</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
           </div>
           
           <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1 px-2 h-10 hover:border-slate-300 transition-colors group focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input type="text" className="w-full bg-transparent text-xs border-none focus:ring-0 p-0 text-slate-600 placeholder:text-slate-400" placeholder="开始" onFocus={(e) => e.currentTarget.type = 'date'} onBlur={(e) => e.currentTarget.type = 'text'} />
                <span className="text-slate-300">-</span>
                <input type="text" className="w-full bg-transparent text-xs border-none focus:ring-0 p-0 text-slate-600 placeholder:text-slate-400 text-right" placeholder="结束" onFocus={(e) => e.currentTarget.type = 'date'} onBlur={(e) => e.currentTarget.type = 'text'} />
           </div>
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-2 lg:col-span-4 xl:col-span-1 xl:col-start-5 flex justify-end items-center gap-2">
          <button 
            onClick={handleReset}
            className="h-10 px-5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 hover:text-slate-800 transition-all"
          >
            重置
          </button>
          <button 
            onClick={onSearch}
            className="h-10 px-8 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 hover:shadow-md transition-all active:transform active:scale-95"
          >
            查询结果
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;