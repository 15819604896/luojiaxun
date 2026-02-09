import React, { useState, useEffect } from 'react';
import { Check, X as XIcon } from 'lucide-react';
import { Product, StoreGrade } from '../types';

// Mock data for regions and stores
const REGIONS = [
  {
    name: '美国地区',
    stores: ['Farmer Market-FM', 'Valley Fair-VF']
  },
  {
    name: '欧洲地区',
    stores: ['伦敦中心店', '巴黎精品店']
  },
  {
    name: '亚太地区',
    stores: ['首尔旗舰店', '东京银座店']
  }
];

const GRADES = ['S', 'A', 'B', 'C', 'D'];

interface SelectionDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm?: (product: Product) => void;
  enableImageHover?: boolean;
}

const SelectionDecisionModal: React.FC<SelectionDecisionModalProps> = ({ isOpen, onClose, product, onConfirm, enableImageHover = false }) => {
  if (!isOpen || !product) return null;

  const [decision, setDecision] = useState<'selected' | 'rejected' | null>(null);
  const [storeGrades, setStoreGrades] = useState<Record<string, string>>({});
  const [isImmersive, setIsImmersive] = useState(false);

  // Initialize grades from product or default
  useEffect(() => {
    if (product) {
       const initialGrades: Record<string, string> = {};
       // Pre-fill existing grades
       product.stores.forEach(s => {
           initialGrades[s.storeName] = s.grade;
       });
       setStoreGrades(initialGrades);
       setDecision(product.selectionStatus === 'Selected' ? 'selected' : product.selectionStatus === 'Rejected' ? 'rejected' : null);
    }
  }, [product]);

  const handleGradeChange = (storeName: string, grade: string) => {
    setStoreGrades(prev => ({ ...prev, [storeName]: grade }));
  };

  const handleBatchGrade = (regionName: string, grade: string) => {
    const region = REGIONS.find(r => r.name === regionName);
    if (region) {
      const newGrades = { ...storeGrades };
      region.stores.forEach(store => {
        newGrades[store] = grade;
      });
      setStoreGrades(newGrades);
    }
  };

  const handleConfirm = () => {
    if (!product) return;
    
    // Construct the updated store list based on the form state
    // We start with existing stores to keep other potential props, but here we rebuild from state mostly
    let updatedStores: StoreGrade[] = [];
    
    // Flatten all stores from REGIONS to check against storeGrades
    const allKnownStores = REGIONS.flatMap(r => r.stores);
    
    allKnownStores.forEach(storeName => {
        const grade = storeGrades[storeName];
        if (grade) {
            updatedStores.push({
                storeName: storeName,
                grade: grade as any
            });
        }
    });

    // Also include any stores that were in the original product but not in our region config (edge case)
    product.stores.forEach(s => {
        if (!allKnownStores.includes(s.storeName) && !updatedStores.find(us => us.storeName === s.storeName)) {
            updatedStores.push(s);
        }
    });

    const finalStatus = decision === 'selected' ? 'Selected' : decision === 'rejected' ? 'Rejected' : product.selectionStatus;

    const updatedProduct: Product = {
        ...product,
        selectionStatus: finalStatus,
        stores: updatedStores,
        selectionTime: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    onConfirm?.(updatedProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[1000px] max-w-[95%] h-[800px] max-h-[90%] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
          <h2 className="text-lg font-bold text-gray-800">选品决策</h2>
          <div className="flex items-center gap-4">
             <div 
                className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 border border-gray-200 cursor-pointer select-none transition-colors hover:bg-yellow-200"
                onClick={() => setIsImmersive(!isImmersive)}
             >
                <span className={`w-2 h-2 rounded-full transition-colors ${isImmersive ? 'bg-orange-500' : 'bg-gray-400'}`}></span>
                <span className="text-xs text-gray-600 font-medium">沉浸模式</span>
                 <div className={`w-8 h-4 rounded-full relative transition-colors ${isImmersive ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isImmersive ? 'right-0.5' : 'left-0.5'}`}></div>
                 </div>
             </div>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
               <XIcon size={24} />
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
            {/* Left: Image */}
            <div className="w-[45%] bg-gray-50 p-8 flex items-center justify-center relative border-r border-gray-100">
                <div className="relative w-full h-full max-h-[600px] rounded-lg overflow-hidden shadow-lg bg-white group">
                     <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.skc} />
                     <div className="absolute top-4 right-4 bg-black/80 text-white px-2 py-0.5 rounded text-xs font-mono backdrop-blur-sm z-10">p1</div>
                     
                     {/* Hover Details Overlay */}
                     {enableImageHover && (
                     <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-8 z-20">
                        <div className="w-full space-y-3 text-white text-xs">
                             <div className="flex justify-between border-b border-white/20 pb-1">
                                 <span className="text-white/60">选品ID:</span> 
                                 <span className="font-mono">{product.id}</span>
                             </div>
                             <div className="flex justify-between border-b border-white/20 pb-1">
                                 <span className="text-white/60 flex-shrink-0 mr-2">SKC:</span> 
                                 <span className="truncate text-right" title={product.skc}>{product.skc}</span>
                             </div>
                             <div className="flex justify-between border-b border-white/20 pb-1">
                                 <span className="text-white/60 flex-shrink-0 mr-2">产品分类:</span> 
                                 <span className="truncate text-right" title={product.categoryPath}>{product.categoryPath}</span>
                             </div>
                             <div className="flex justify-between border-b border-white/20 pb-1">
                                 <span className="text-white/60">预售估价:</span> 
                                 <span>${product.price}</span>
                             </div>
                             <div className="flex justify-between border-b border-white/20 pb-1">
                                 <span className="text-white/60">开发单号:</span> 
                                 <span>{product.devUnitId}</span>
                             </div>
                             <div className="flex justify-between border-b border-white/20 pb-1">
                                 <span className="text-white/60">开发单状态:</span> 
                                 <span>{product.devStatus}</span>
                             </div>
                             <div className="flex justify-between border-b border-white/20 pb-1">
                                 <span className="text-white/60">开款渠道:</span> 
                                 <span>{product.channel}</span>
                             </div>
                             <div className="flex justify-between border-b border-white/20 pb-1">
                                 <span className="text-white/60">DROP:</span> 
                                 <span>{product.drop}</span>
                             </div>
                             <div className="flex justify-between border-b border-white/20 pb-1">
                                 <span className="text-white/60">企划开发员:</span> 
                                 <span>{product.planningDeveloper}</span>
                             </div>
                             <div className="flex justify-between border-b border-white/20 pb-1">
                                 <span className="text-white/60">计划上新日期:</span> 
                                 <span>{product.planDate}</span>
                             </div>
                             <div className="flex justify-between border-b border-white/20 pb-1">
                                 <span className="text-white/60">创建时间:</span> 
                                 <span>{product.createdTime}</span>
                             </div>
                             
                             {/* Grouped Grades for Selected Products */}
                             {product.selectionStatus === 'Selected' && (
                                <>
                                    <div className="flex justify-between border-b border-white/20 pb-1">
                                        <span className="text-white/60">选品人:</span>
                                        <span>{product.operator}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/20 pb-1">
                                        <span className="text-white/60">选品时间:</span>
                                        <span>{product.selectionTime}</span>
                                    </div>

                                    {product.stores.length > 0 && (
                                        <div className="pt-2 border-t border-white/20 mt-1">
                                            <span className="text-white/60 block mb-1">预估评级:</span>
                                            <div className="space-y-1">
                                                {(() => {
                                                    const grouped = product.stores.reduce((acc, store) => {
                                                        if (!acc[store.grade]) acc[store.grade] = [];
                                                        acc[store.grade].push(store.storeName);
                                                        return acc;
                                                    }, {} as Record<string, string[]>);
                                                    
                                                    const grades = ['S', 'A', 'B', 'C', 'D'];
                                                    
                                                    return grades.map(g => {
                                                        if (!grouped[g]) return null;
                                                        return (
                                                            <div key={g} className="flex items-start text-[11px] leading-tight mb-1">
                                                                <span className={`font-bold mr-2 w-3 flex-shrink-0 ${
                                                                    g === 'S' ? 'text-red-400' : 
                                                                    g === 'A' ? 'text-orange-400' : 
                                                                    g === 'B' ? 'text-blue-400' : 'text-gray-400'
                                                                }`}>{g}</span>
                                                                <span className="text-white/90">{grouped[g].join('、')}</span>
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </>
                             )}
                        </div>
                     </div>
                     )}
                </div>
                <div className="absolute bottom-8 left-0 right-0 text-center">
                    <div className="text-xs text-gray-400 mb-1">商品预览</div>
                    <div className="font-bold text-lg text-gray-800">{product.skc}</div>
                </div>
            </div>

            {/* Right: Form */}
            <div className="w-[55%] overflow-y-auto p-8 bg-white">
                 {/* Breadcrumbs */}
                 <div className="text-xs text-gray-500 mb-4 flex flex-wrap gap-1">
                     {product.categoryPath.split('>>').map((item, i, arr) => (
                         <span key={i} className="flex items-center">
                            {item}
                            {i < arr.length - 1 && <span className="mx-1 text-gray-300">→</span>}
                         </span>
                     ))}
                 </div>

                 {/* Tags */}
                 <div className="flex gap-2 mb-6">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">OVERSIZE</span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">科技感</span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">街头风</span>
                 </div>

                 {/* Price */}
                 <div className="flex items-baseline gap-2 mb-8">
                     <span className="text-gray-500 text-sm">预估价:</span>
                     <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                 </div>

                 {/* Selection Conclusion */}
                 <div className="mb-8">
                     <h3 className="text-sm font-bold text-gray-800 mb-3">选品决策</h3>
                     <div className="flex gap-4">
                         <button 
                            onClick={() => setDecision('selected')}
                            className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${decision === 'selected' ? 'border-blue-500 bg-blue-50 text-blue-600 ring-1 ring-blue-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                         >
                             <Check size={18} />
                             <span className="font-bold">确认选品</span>
                         </button>
                         <button 
                            onClick={() => setDecision('rejected')}
                            className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${decision === 'rejected' ? 'border-gray-500 bg-gray-50 text-gray-700 ring-1 ring-gray-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                         >
                             <XIcon size={18} />
                             <span className="font-medium">取消选品</span>
                         </button>
                     </div>
                 </div>

                 {/* Store Grading */}
                 {decision !== 'rejected' && (
                 <div className="mb-8">
                     <div className="flex items-center gap-1 mb-2">
                        <h3 className="text-sm font-bold text-gray-800">分门店定级</h3>
                        <span className="text-red-500">*</span>
                     </div>
                     <p className="text-xs text-gray-400 mb-4">不同国家、地区的服装风格偏好存在差异，即 SKC 的定级需区分门店。</p>

                     <div className="space-y-4">
                         {REGIONS.map(region => (
                             <div key={region.name} className="border border-gray-100 rounded-lg overflow-hidden">
                                 <div className="bg-gray-50 px-4 py-2 flex justify-between items-center border-b border-gray-100">
                                     <span className="text-xs font-bold text-gray-700">{region.name}</span>
                                     <div className="flex items-center gap-2">
                                         <span className="text-xs text-gray-400">批量设置:</span>
                                         <div className="flex gap-1">
                                             {GRADES.map(g => (
                                                 <button 
                                                   key={g}
                                                   onClick={() => handleBatchGrade(region.name, g)}
                                                   className="w-5 h-5 flex items-center justify-center rounded bg-white border border-gray-200 text-[10px] text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                                                 >
                                                     {g}
                                                 </button>
                                             ))}
                                         </div>
                                     </div>
                                 </div>
                                 <div className="divide-y divide-gray-50">
                                     {region.stores.map(store => (
                                         <div key={store} className="px-4 py-3 flex items-center justify-between">
                                             <span className="text-sm text-gray-700 font-medium">{store}</span>
                                             <div className="flex gap-2">
                                                 {GRADES.map(g => (
                                                     <button 
                                                        key={g}
                                                        onClick={() => handleGradeChange(store, g)}
                                                        className={`w-8 h-8 rounded border flex items-center justify-center text-xs font-medium transition-all
                                                            ${storeGrades[store] === g 
                                                                ? 'border-blue-500 bg-blue-50 text-blue-600 font-bold shadow-sm' 
                                                                : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                                                            }
                                                        `}
                                                     >
                                                         {g}
                                                     </button>
                                                 ))}
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
                 )}
            </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-8 py-4 flex justify-end gap-3 bg-white">
            <button onClick={onClose} className="px-6 py-2 rounded text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                取消
            </button>
            <button 
                onClick={handleConfirm} 
                className="px-6 py-2 rounded text-sm bg-blue-500 hover:bg-gray-600 text-white transition-colors"
            >
                {isImmersive ? '提交并继续' : '提交'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default SelectionDecisionModal;