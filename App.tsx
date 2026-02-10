import React, { useState } from 'react';
import FilterBar from './components/FilterBar';
import ProductTable from './components/ProductTable';
import MoodSelection from './components/MoodSelection';
import SelectionDecisionModal from './components/SelectionDecisionModal';
import { MOCK_PRODUCTS } from './constants';
import { RefreshCw, Download, LayoutGrid, List, Layers } from 'lucide-react';
import { Product } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [devType, setDevType] = useState<'single' | 'mood'>('single');
  
  // Selection Decision Modal State
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const tabs = [
    { id: 'pending', label: '待选品', count: 4, color: 'text-yellow-600 bg-yellow-50' }, 
    { id: 'selected', label: '已选品', count: 31, color: 'text-green-600 bg-green-50' },
    { id: 'cancelled', label: '已取消', count: 16, color: 'text-red-600 bg-red-50' },
    { id: 'all', label: '全部', count: null, color: 'text-gray-600 bg-gray-100' },
  ];

  const handleOpenDecision = (product: Product) => {
    setSelectedProduct(product);
    setIsDecisionModalOpen(true);
  };

  // Filter products based on active tab
  const getFilteredProducts = () => {
    if (activeTab === 'all') return MOCK_PRODUCTS;
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'selected': 'Selected',
      'cancelled': 'Rejected'
    };
    return MOCK_PRODUCTS.filter(p => p.selectionStatus === statusMap[activeTab]);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden text-slate-800 font-sans selection:bg-blue-100">
      {/* Top Navigation Bar */}
      <header className="flex-none bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
             <h1 className="text-lg font-bold text-slate-900 tracking-tight">线下选品中心</h1>
             <span className="text-[10px] text-slate-400 font-medium tracking-wide">OFFLINE SELECTION HUB</span>
          </div>
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          
          {/* Modern Segmented Control */}
          <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
             <button 
               onClick={() => setDevType('single')} 
               className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                 devType === 'single' 
                 ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                 : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
               }`}
             >
               <List size={14} />
               单品开发选品
             </button>
             <button 
               onClick={() => setDevType('mood')} 
               className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                 devType === 'mood' 
                 ? 'bg-white text-purple-600 shadow-sm ring-1 ring-black/5' 
                 : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
               }`}
             >
               <LayoutGrid size={14} />
               Mood/Campaign选品
             </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
             <div className="text-xs text-right hidden sm:block">
                <div className="text-slate-700 font-medium">System Admin</div>
                <div className="text-slate-400">Buying Dept.</div>
             </div>
             <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full shadow-inner border-2 border-white"></div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white to-transparent pointer-events-none z-0"></div>

        <div className="flex-1 flex flex-col z-10 px-6 py-6 overflow-hidden">
            {/* Filter Section */}
            <div className="flex-none mb-6">
               <FilterBar 
                  onSearch={() => console.log('Searching...')} 
                  onReset={() => console.log('Resetting...')}
                />
            </div>

            {/* Dynamic Content */}
            <div className="flex-1 min-h-0 relative">
               {devType === 'single' ? (
                <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  
                  {/* Table Tabs & Toolbar */}
                  <div className="flex-none px-6 pt-5 pb-0 flex justify-between items-end border-b border-slate-100">
                    <div className="flex gap-6">
                      {tabs.map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`pb-4 text-sm font-medium transition-all relative flex items-center gap-2 ${
                            activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {tab.label}
                          {tab.count !== null && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab.color}`}>
                              {tab.count}
                            </span>
                          )}
                          {activeTab === tab.id && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3 pb-3">
                       <button className="text-slate-500 hover:text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5">
                         <RefreshCw size={14} /> 刷新
                       </button>
                       <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 shadow-sm">
                         <Download size={14} /> 批量导出
                       </button>
                    </div>
                  </div>

                  {/* Table Container */}
                  <div className="flex-1 overflow-auto">
                    <ProductTable 
                      products={getFilteredProducts()} 
                      onDecision={activeTab === 'pending' ? handleOpenDecision : undefined}
                    />
                  </div>

                  {/* Pagination */}
                  <div className="flex-none px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                     <span className="text-xs text-slate-500">
                        Showing <span className="font-semibold text-slate-700">{getFilteredProducts().length}</span> items
                     </span>
                     <div className="flex items-center gap-1">
                        <button className="px-3 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-400 cursor-not-allowed">Prev</button>
                        <button className="px-3 py-1 text-xs border border-blue-600 bg-blue-600 text-white rounded-md font-medium shadow-sm">1</button>
                        <button className="px-3 py-1 text-xs border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-md transition-colors">2</button>
                        <button className="px-3 py-1 text-xs border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-md transition-colors">3</button>
                        <button className="px-3 py-1 text-xs border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-md transition-colors">Next</button>
                     </div>
                  </div>
                </div>
              ) : (
                /* Mood Selection View */
                <MoodSelection products={MOCK_PRODUCTS} />
              )}
            </div>
        </div>
      </main>

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