import React, { useState } from 'react';
import FilterBar from './components/FilterBar';
import ProductTable from './components/ProductTable';
import MoodSelection from './components/MoodSelection';
import SelectionDecisionModal from './components/SelectionDecisionModal';
import { MOCK_PRODUCTS } from './constants';
import { RefreshCw, Download } from 'lucide-react';
import { Product } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [devType, setDevType] = useState<'single' | 'mood'>('single');
  
  // Selection Decision Modal State
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const tabs = [
    { id: 'pending', label: '待选品', count: 4 }, // Updated count mock
    { id: 'selected', label: '已选品', count: 31 },
    { id: 'cancelled', label: '已取消', count: 16 },
    { id: 'all', label: '全部', count: null },
  ];

  const handleOpenDecision = (product: Product) => {
    setSelectedProduct(product);
    setIsDecisionModalOpen(true);
  };

  // Filter products based on active tab
  const getFilteredProducts = () => {
    if (activeTab === 'all') return MOCK_PRODUCTS;
    // Map tab id to selection status
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'selected': 'Selected',
      'cancelled': 'Rejected'
    };
    return MOCK_PRODUCTS.filter(p => p.selectionStatus === statusMap[activeTab]);
  };

  return (
    <div className="h-screen bg-[#f5f7fa] p-4 text-sm font-sans flex flex-col overflow-hidden">
      {/* Header / Breadcrumb */}
      <div className="flex-none mb-4">
        <h1 className="text-lg font-medium text-gray-800">
          <span className="text-gray-500 font-normal">首页 / </span> 
          <span className="bg-green-600 text-white px-2 py-0.5 text-xs rounded ml-1">线下选品 x</span>
        </h1>
      </div>

      {/* Development Type Switcher */}
      <div className="flex-none bg-white p-1 rounded-lg inline-flex border border-gray-200 mb-4 self-start">
          <button 
            onClick={() => setDevType('single')} 
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${devType === 'single' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            单品开发选品
          </button>
           <button 
            onClick={() => setDevType('mood')} 
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${devType === 'mood' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Mood/Campaign开发选品
          </button>
      </div>

      {/* Common Filter Section */}
      <div className="flex-none">
         <FilterBar 
            onSearch={() => console.log('Searching...')} 
            onReset={() => console.log('Resetting...')}
          />
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {devType === 'single' ? (
          <div className="h-full flex flex-col overflow-auto">
            {/* Tabs */}
            <div className="flex-none flex items-center space-x-6 border-b border-gray-200 mb-4 px-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    pb-2 text-sm font-medium transition-colors relative
                    ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}
                  `}
                >
                  {tab.label}
                  {tab.count !== null && <span className="ml-1 text-xs text-gray-400">({tab.count})</span>}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex-none flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                 <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded text-xs flex items-center">
                   <RefreshCw className="w-3 h-3 mr-1" /> 刷新列表
                 </button>
                 <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs flex items-center">
                   <Download className="w-3 h-3 mr-1" /> 批量导出
                 </button>
              </div>
            </div>

            {/* Main Table */}
            <ProductTable 
              products={getFilteredProducts()} 
              onDecision={activeTab === 'pending' ? handleOpenDecision : undefined}
            />
            
            {/* Pagination Footer (Visual Only) */}
            <div className="mt-4 pb-4 flex justify-between items-center text-xs text-gray-500">
               <div>共 {getFilteredProducts().length} 条</div>
               <div className="flex space-x-2">
                  <button className="px-2 py-1 border rounded bg-white disabled:opacity-50" disabled>Previous</button>
                  <button className="px-2 py-1 border rounded bg-blue-50 text-blue-600 border-blue-200">1</button>
                  <button className="px-2 py-1 border rounded bg-white">2</button>
                  <button className="px-2 py-1 border rounded bg-white">Next</button>
               </div>
            </div>
          </div>
        ) : (
          /* Mood / Campaign Selection View */
          <MoodSelection products={MOCK_PRODUCTS} />
        )}
      </div>

      {/* Global Selection Decision Modal */}
      <SelectionDecisionModal 
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
};

export default App;