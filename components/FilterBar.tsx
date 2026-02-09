import React from 'react';
import { Search, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

interface FilterBarProps {
  onSearch: () => void;
  onReset: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onSearch, onReset }) => {
  return (
    <div className="bg-white p-4 rounded shadow-sm mb-4 border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
        {/* Row 1 - Item 1 */}
        <div className="flex space-x-2">
          <div className="flex-none w-24">
            <label className="block text-xs font-medium text-gray-500 mb-1">搜索</label>
            <div className="relative">
                <select className="w-full h-8 text-xs border border-gray-300 rounded px-2 focus:outline-none focus:border-blue-500 appearance-none bg-white">
                <option>SPU</option>
                <option>SKC</option>
                <option>选品ID</option>
                <option>开发单号</option>
                <option>Drop</option>
                </select>
                <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>
          <div className="flex-grow">
            <label className="block text-xs font-medium text-gray-500 mb-1 opacity-0">Input</label>
            <div className="relative">
                 <input 
                type="text" 
                placeholder="请输入搜索" 
                className="w-full h-8 text-xs border border-gray-300 rounded px-2 focus:outline-none focus:border-blue-500 pl-8"
                />
                <Search className="w-3 h-3 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Item 2 */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">产品分类</label>
          <div className="relative">
            <select className="w-full h-8 text-xs border border-gray-300 rounded px-2 focus:outline-none focus:border-blue-500 text-gray-500 appearance-none bg-white">
                <option>请选择产品分类</option>
                <option>上衣</option>
                <option>下装</option>
                <option>连衣裙</option>
                <option>裤装</option>
            </select>
            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Item 3 */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">选品状态</label>
           <div className="relative">
            <select className="w-full h-8 text-xs border border-gray-300 rounded px-2 focus:outline-none focus:border-blue-500 text-gray-500 appearance-none bg-white">
                <option value="">全部</option>
                <option value="Pending">待选品</option>
                <option value="Selected">已选品</option>
                <option value="Rejected">已取消</option>
            </select>
            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Item 4 */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">开发单状态</label>
           <div className="relative">
            <select className="w-full h-8 text-xs border border-gray-300 rounded px-2 focus:outline-none focus:border-blue-500 text-gray-500 appearance-none bg-white">
                <option value="">全部</option>
                <option value="已过款">已过款</option>
                <option value="已审版">已审版</option>
                <option value="已纸样编辑">已纸样编辑</option>
                <option value="已工艺编辑">已工艺编辑</option>
                <option value="已核价">已核价</option>
                <option value="已议价">已议价</option>
                <option value="已完成">已完成</option>
            </select>
            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>
        
        {/* Row 2 starts on LG if 4 cols. Starts on line 1 pos 5 on XL if 5 cols. */}
        {/* Item 5 */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">产品线</label>
          <div className="relative">
            <select className="w-full h-8 text-xs border border-gray-300 rounded px-2 focus:outline-none focus:border-blue-500 text-gray-600 appearance-none bg-white">
                <option value="">全部</option>
                <option value="常规码">常规码</option>
                <option value="大码">大码</option>
            </select>
            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Item 6 */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">企划开发员</label>
           <div className="relative">
            <select className="w-full h-8 text-xs border border-gray-300 rounded px-2 focus:outline-none focus:border-blue-500 text-gray-600 appearance-none bg-white">
                <option value="">全部</option>
                <option value="沈可忻">沈可忻</option>
                <option value="Lindsay Fiegleman">Lindsay Fiegleman</option>
                <option value="Eva 卜依文">Eva 卜依文</option>
                <option value="谈嘉轩momo">谈嘉轩momo</option>
                <option value="Esther Blum">Esther Blum</option>
            </select>
            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* New Item 7: 开款渠道 */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">开款渠道</label>
          <div className="relative">
             <select className="w-full h-8 text-xs border border-gray-300 rounded px-2 focus:outline-none focus:border-blue-500 text-gray-400 appearance-none bg-white">
               <option value="">全部</option>
                <option value="FOB">FOB</option>
               <option value="OEM">OEM</option>
               <option value="ODM">ODM供款</option>
               
             </select>
             <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* New Item 8: 时间 - spans 2 cols */}
        <div className="md:col-span-2 xl:col-span-2">
           <label className="block text-xs font-medium text-gray-500 mb-1">时间</label>
           <div className="flex space-x-2">
             <div className="relative w-28 flex-shrink-0">
                <select className="w-full h-8 text-xs border border-gray-300 rounded px-2 focus:outline-none focus:border-blue-500 text-gray-600 appearance-none bg-white">
                  <option value="created">创建时间</option>
                  <option value="selection">选品时间</option>
                </select>
                <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
             </div>
             <div className="flex items-center space-x-2 flex-1">
                <div className="relative flex-1">
                    <input type="text" onFocus={(e) => e.currentTarget.type = 'date'} onBlur={(e) => e.currentTarget.type = 'text'} className="w-full h-8 text-xs border border-gray-300 rounded px-2 pl-7 focus:outline-none focus:border-blue-500 text-gray-400" placeholder="开始日期" />
                    <Calendar className="w-3 h-3 text-gray-400 absolute left-2 top-2.5 pointer-events-none" />
                </div>
                <span className="text-gray-400">~</span>
                <div className="relative flex-1">
                    <input type="text" onFocus={(e) => e.currentTarget.type = 'date'} onBlur={(e) => e.currentTarget.type = 'text'} className="w-full h-8 text-xs border border-gray-300 rounded px-2 pl-7 focus:outline-none focus:border-blue-500 text-gray-400" placeholder="结束日期" />
                    <Calendar className="w-3 h-3 text-gray-400 absolute left-2 top-2.5 pointer-events-none" />
                </div>
             </div>
           </div>
        </div>

        {/* Buttons - Align Right */}
        <div className="md:col-span-2 lg:col-span-4 xl:col-span-1 xl:col-start-5 flex justify-end items-center space-x-2 pt-2 xl:pt-0">
          <button 
            onClick={onSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-6 py-2 rounded transition-colors whitespace-nowrap"
          >
            搜索
          </button>
          <button 
            onClick={onReset}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs px-6 py-2 rounded transition-colors whitespace-nowrap"
          >
            重置
          </button>
          <button className="text-blue-500 text-xs flex items-center hover:underline ml-2 whitespace-nowrap">
            收起 <ChevronUp className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;