import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Copy, AlertCircle, Check, X, Image, Edit } from 'lucide-react';
import { Product } from '../types';
import SelectionDecisionModal from './SelectionDecisionModal';

interface MoodSelectionProps {
  products: Product[];
}

const ProductHoverPreview: React.FC<{ product: Product; children: React.ReactNode }> = ({ product, children }) => {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Default position: to the right of the card
      let top = rect.top; 
      let left = rect.right + 10;
      
      // If it goes off right screen edge, show on left
      if (left + 320 > viewportWidth) {
          left = rect.left - 330;
      }

      // Adjust if it goes off bottom of screen
      if (top + 450 > viewportHeight) {
          top = Math.max(10, viewportHeight - 460);
      }

      setCoords({ top, left });
    }
  };

  const handleMouseLeave = () => {
    setCoords(null);
  };

  return (
    <>
      <div 
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full"
      >
        {children}
      </div>
      {coords && createPortal(
        <div 
            className="fixed z-[9999] w-[320px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 pointer-events-none"
            style={{ top: coords.top, left: coords.left }}
        >
             <div className="relative h-48 w-full bg-gray-100">
                <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.skc} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                   <div className="text-white font-bold text-sm truncate w-full">{product.skc}</div>
                </div>
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px]">
                    {product.selectionStatus}
                </div>
             </div>
             <div className="p-4 bg-gray-900 text-white text-xs space-y-2.5">
                 <div className="flex justify-between border-b border-gray-700 pb-1.5">
                     <span className="text-gray-400">选品ID:</span> 
                     <span className="font-mono">{product.id}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-700 pb-1.5">
                     <span className="text-gray-400 flex-shrink-0 mr-2">SKC:</span> 
                     <span className="truncate max-w-[180px]" title={product.skc}>{product.skc}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-700 pb-1.5">
                     <span className="text-gray-400 flex-shrink-0 mr-2">产品分类:</span> 
                     <span className="truncate max-w-[180px]" title={product.categoryPath}>{product.categoryPath}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-700 pb-1.5">
                     <span className="text-gray-400">预售估价:</span> 
                     <span className="font-bold text-yellow-400">${product.price}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-700 pb-1.5">
                     <span className="text-gray-400">开发单号:</span> 
                     <span>{product.devUnitId}</span>
                 </div>
                  <div className="flex justify-between border-b border-gray-700 pb-1.5">
                     <span className="text-gray-400">开发状态:</span> 
                     <span className={product.devStatus === '已完成' ? 'text-green-400' : 'text-white'}>{product.devStatus}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-700 pb-1.5">
                     <span className="text-gray-400">开款渠道:</span> 
                     <span>{product.channel}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-700 pb-1.5">
                     <span className="text-gray-400">DROP:</span> 
                     <span>{product.drop}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-700 pb-1.5">
                     <span className="text-gray-400">企划开发员:</span> 
                     <span className="text-purple-400 font-medium">{product.planningDeveloper}</span>
                 </div>
                  <div className="flex justify-between border-b border-gray-700 pb-1.5">
                     <span className="text-gray-400">计划上新:</span> 
                     <span>{product.planDate}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-700 pb-1.5">
                     <span className="text-gray-400">创建时间:</span> 
                     <span>{product.createdTime}</span>
                 </div>

                 {/* Extra fields for Selected Status */}
                 {product.selectionStatus === 'Selected' && (
                    <>
                        <div className="flex justify-between border-b border-gray-700 pb-1.5">
                            <span className="text-gray-400">选品人:</span>
                            <span>{product.operator}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-700 pb-1.5">
                            <span className="text-gray-400">选品时间:</span>
                            <span>{product.selectionTime}</span>
                        </div>
                         <div className="pt-1 border-t border-gray-700 mt-1">
                            <span className="text-gray-400 block mb-1">预估评级:</span>
                            <div className="space-y-1 pl-0">
                                {(() => {
                                    const grouped = product.stores.reduce((acc, store) => {
                                        if (!acc[store.grade]) acc[store.grade] = [];
                                        acc[store.grade].push(store.storeName);
                                        return acc;
                                    }, {} as Record<string, string[]>);
                                    
                                    const grades = ['S', 'A', 'B', 'C', 'D'];
                                    const hasRatings = product.stores.length > 0;

                                    if (!hasRatings) return <span className="text-gray-500 italic scale-90">暂无评级</span>;

                                    return grades.map(g => {
                                        if (!grouped[g]) return null;
                                        return (
                                            <div key={g} className="flex items-start text-[11px] leading-tight mb-1">
                                                <span className={`font-bold mr-2 w-3 flex-shrink-0 ${
                                                     g === 'S' ? 'text-red-400' : 
                                                     g === 'A' ? 'text-orange-400' : 
                                                     g === 'B' ? 'text-blue-400' : 'text-gray-400'
                                                }`}>{g}</span>
                                                <span className="text-gray-300">{grouped[g].join('、')}</span>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </>
                 )}
             </div>
        </div>,
        document.body
      )}
    </>
  );
};

const ProductCard: React.FC<{ 
  product: Product; 
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  actionClass?: string;
  showCopy?: boolean;
  onCopy?: () => void;
}> = ({ product, onAction, actionIcon, actionClass, showCopy, onCopy }) => (
  <div className="relative group bg-white rounded border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
    <div className="relative aspect-[3/4] bg-gray-100">
      <ProductHoverPreview product={product}>
         <img src={product.imageUrl} alt={product.skc} className="w-full h-full object-cover" />
      </ProductHoverPreview>
      
      {onAction && (
        <button 
          onClick={(e) => { e.stopPropagation(); onAction(); }}
          className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white transition-colors shadow-sm cursor-pointer z-10 opacity-90 hover:opacity-100 ${actionClass || 'bg-blue-500 hover:bg-blue-600'}`}
          title="选品决策"
        >
          {actionIcon}
        </button>
      )}

      {showCopy && (
        <button 
          onClick={(e) => { e.stopPropagation(); onCopy?.(); }}
          className="absolute top-2 right-9 w-6 h-6 bg-white/80 hover:bg-white text-gray-700 rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer z-10 opacity-90 hover:opacity-100"
          title="复制选品"
        >
          <Copy size={12} />
        </button>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white pointer-events-none">
          <div className="text-[10px] truncate opacity-90">{product.drop}</div>
      </div>
    </div>
    <div className="p-2 text-xs text-gray-600">
        <div className="flex justify-between items-start gap-1">
            <div className="truncate font-medium flex-1" title={product.skc}>{product.skc}</div>
            <div className="font-bold text-gray-900 whitespace-nowrap">¥{product.price}</div>
        </div>
        <div className="flex gap-1 mt-1 flex-wrap">
             {product.tags.slice(0, 2).map((t, i) => (
                 <span key={i} className="bg-gray-100 px-1 rounded text-[9px] truncate max-w-full">{t}</span>
             ))}
        </div>
    </div>
  </div>
);

const MoodSelection: React.FC<MoodSelectionProps> = ({ products }) => {
  // State for Lists
  const [selectedList, setSelectedList] = useState<Product[]>(products.slice(0, 6)); // First 6 as selected
  const [cancelledList, setCancelledList] = useState<Product[]>(products.slice(6, 7)); // Next 1 as cancelled
  const [poolList, setPoolList] = useState<Product[]>(products.slice(7)); // Rest in pool

  // View State: 'pool' | 'selected' | 'cancelled'
  const [activeView, setActiveView] = useState<'pool' | 'selected' | 'cancelled'>('selected');

  // State for Decision Modal
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const openDecisionModal = (product: Product) => {
      setActiveProduct(product);
      setDecisionModalOpen(true);
  };

  const handleDecisionConfirm = (updatedProduct: Product) => {
      const pid = updatedProduct.id;
      
      // Remove from all source lists first
      const newPool = poolList.filter(p => p.id !== pid);
      const newSelected = selectedList.filter(p => p.id !== pid);
      const newCancelled = cancelledList.filter(p => p.id !== pid);

      // Distribute to target list based on new status
      if (updatedProduct.selectionStatus === 'Selected') {
          setSelectedList([updatedProduct, ...newSelected]);
          setPoolList(newPool);
          setCancelledList(newCancelled);
      } else if (updatedProduct.selectionStatus === 'Rejected') {
          setCancelledList([updatedProduct, ...newCancelled]);
          setSelectedList(newSelected);
          setPoolList(newPool);
      } else {
          // Fallback to pool if pending
          setPoolList([updatedProduct, ...newPool]);
          setSelectedList(newSelected);
          setCancelledList(newCancelled);
      }
  };

  // Render Functions
  const renderPool = (isMain: boolean) => (
    <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded shadow-sm overflow-hidden h-full">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-700">选品池</h3>
                {isMain && <span className="text-xs text-gray-500">开发类型: Mood/Campaign</span>}
            </div>
            {!isMain && (
                <button 
                    onClick={() => setActiveView('pool')} 
                    className="text-blue-600 text-xs hover:underline flex items-center gap-1"
                >
                    展开
                </button>
            )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
            <div className={`grid gap-3 pb-4 ${isMain ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-2'}`}>
                {poolList.map((p) => (
                    <ProductCard 
                        key={p.id} 
                        product={p} 
                        onAction={() => openDecisionModal(p)}
                        actionIcon={<Plus size={16} />}
                        actionClass="bg-green-500 hover:bg-green-600"
                    />
                ))}
            </div>
        </div>
    </div>
  );

  const renderSelected = (isMain: boolean) => (
    <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded shadow-sm overflow-hidden h-full">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between flex-shrink-0">
             <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700">已选品列表</span>
                {isMain && <span className="text-xs text-gray-500">开发类型: Mood/Campaign</span>}
            </div>
            {!isMain && (
                <button 
                    onClick={() => setActiveView('selected')} 
                    className="text-blue-600 text-xs hover:underline flex items-center gap-1"
                >
                    展开
                </button>
            )}
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
             {selectedList.length > 0 ? (
                 <div className={`grid gap-3 pb-4 ${isMain ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-2'}`}>
                     {selectedList.map((p) => (
                         <ProductCard 
                           key={p.id} 
                           product={p} 
                           onAction={() => openDecisionModal(p)}
                           actionIcon={<Edit size={14} />}
                           actionClass="bg-blue-500 hover:bg-blue-600"
                         />
                     ))}
                 </div>
             ) : (
               <div className="bg-white rounded border border-gray-200 h-full min-h-[200px] flex flex-col items-center justify-center text-gray-400 p-8">
                   <div className="w-32 h-24 bg-gray-50 rounded mb-2 flex items-center justify-center">
                      <Image size={48} className="opacity-20" />
                   </div>
                   <span className="text-xs">暂无已选商品</span>
               </div>
             )}
        </div>
    </div>
  );

  const renderCancelled = (isMain: boolean) => (
    <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded shadow-sm overflow-hidden h-full">
         <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-shrink-0">
               <span className="font-bold text-gray-700">已取消列表</span>
               {!isMain && (
                    <button 
                        onClick={() => setActiveView('cancelled')} 
                        className="text-blue-600 text-xs hover:underline flex items-center gap-1"
                    >
                        展开
                    </button>
                )}
         </div>
         <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
            {cancelledList.length > 0 ? (
                <div className={`grid gap-3 pb-4 ${isMain ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-2'}`}>
                    {cancelledList.map((p) => (
                         <ProductCard 
                            key={p.id} 
                            product={p} 
                            onAction={() => openDecisionModal(p)}
                            actionIcon={<Edit size={14} />}
                            actionClass="bg-blue-500 hover:bg-blue-600"
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-xs text-gray-400 py-8">
                     <div className="w-16 h-12 bg-gray-100 rounded mb-2 flex items-center justify-center">
                        <Trash2 size={24} className="opacity-20" />
                     </div>
                     <span>暂无已取消数据</span>
                </div>
            )}
         </div>
    </div>
  );

  // Layout Logic
  let MainPanel, TopSidePanel, BottomSidePanel;

  if (activeView === 'pool') {
      MainPanel = renderPool(true);
      TopSidePanel = renderSelected(false);
      BottomSidePanel = renderCancelled(false);
  } else if (activeView === 'selected') {
      MainPanel = renderSelected(true);
      TopSidePanel = renderPool(false);
      BottomSidePanel = renderCancelled(false);
  } else { // cancelled
      MainPanel = renderCancelled(true);
      TopSidePanel = renderSelected(false);
      BottomSidePanel = renderPool(false);
  }

  return (
    <div className="flex h-full gap-4">
      {/* Left Panel (Main) */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
         {MainPanel}
      </div>

      {/* Right Panel (Side) */}
      <div className="w-[400px] xl:w-[450px] flex-shrink-0 flex flex-col gap-4 overflow-hidden transition-all duration-300">
         <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {TopSidePanel}
         </div>
         <div className="h-[240px] flex-shrink-0 flex flex-col">
            {BottomSidePanel}
         </div>
      </div>

      {/* Shared Decision Modal */}
      <SelectionDecisionModal 
          isOpen={decisionModalOpen}
          onClose={() => setDecisionModalOpen(false)}
          product={activeProduct}
          onConfirm={handleDecisionConfirm}
          enableImageHover={true}
      />
    </div>
  );
};

export default MoodSelection;