import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '../types';
import { ArrowRight, Clock, User, Layers } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  onDecision?: (product: Product) => void;
}

const GradeBadge: React.FC<{ grade: string }> = ({ grade }) => {
  const colors: Record<string, string> = {
    S: 'bg-red-50 text-red-600 border-red-100',
    A: 'bg-orange-50 text-orange-600 border-orange-100',
    B: 'bg-blue-50 text-blue-600 border-blue-100',
    C: 'bg-slate-100 text-slate-600 border-slate-200',
    D: 'bg-slate-100 text-slate-400 border-slate-200',
  };
  return (
    <span className={`${colors[grade] || 'bg-gray-100 text-gray-500'} w-6 h-6 flex items-center justify-center rounded-lg text-[11px] font-bold border shadow-sm`}>
      {grade}
    </span>
  );
};

const ProductHoverPreview: React.FC<{ product: Product; children: React.ReactNode }> = ({ product, children }) => {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      let top = rect.top - 50; 
      let left = rect.right + 20;
      
      if (left + 320 > viewportWidth) {
          left = rect.left - 340;
      }
      if (top + 480 > viewportHeight) {
          top = Math.max(10, viewportHeight - 490);
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
            className="fixed z-[9999] w-[320px] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 pointer-events-none text-slate-700 font-sans"
            style={{ top: coords.top, left: coords.left }}
        >
             <div className="relative h-56 w-full bg-slate-100">
                <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.skc} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                
                <div className="absolute top-3 left-3 flex gap-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shadow-sm backdrop-blur-sm
                        ${product.selectionStatus === 'Selected' ? 'bg-green-500/90 text-white' : 
                          product.selectionStatus === 'Rejected' ? 'bg-red-500/90 text-white' : 'bg-yellow-500/90 text-white'}
                    `}>
                        {product.selectionStatus}
                    </span>
                </div>
                
                <div className="absolute bottom-3 left-3 right-3">
                   <div className="text-white font-bold text-base truncate tracking-tight">{product.skc}</div>
                   <div className="text-white/80 text-xs truncate">{product.categoryPath}</div>
                </div>
             </div>

             <div className="p-5 text-xs space-y-3">
                 <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Price</span>
                        <span className="text-slate-800 font-medium text-sm">${product.price}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Drop</span>
                        <span className="text-slate-800 font-medium">{product.drop}</span>
                    </div>

                    {/* New Row: Drop Goal & Passed Count */}
                    <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Drop Goal</span>
                        <span className="text-slate-800 font-medium">{product.dropGoal || '-'}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Passed Count</span>
                        <span className="text-slate-800 font-medium">{product.developedCount || '-'}</span>
                    </div>

                    <div className="flex flex-col gap-0.5 col-span-2">
                        <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Planning Developer</span>
                        <span className="text-purple-600 font-medium">{product.planningDeveloper}</span>
                    </div>
                 </div>
                 
                 <div className="w-full h-px bg-slate-100 my-2"></div>

                 <div className="space-y-2">
                     <div className="flex justify-between">
                         <span className="text-slate-400">选品ID</span> 
                         <span className="font-mono text-slate-700">{product.id}</span>
                     </div>
                     <div className="flex justify-between">
                         <span className="text-slate-400">创建时间</span> 
                         <span className="font-mono text-slate-700">{product.createdTime.split(' ')[0]}</span>
                     </div>
                     <div className="flex justify-between">
                         <span className="text-slate-400">Dev Unit</span> 
                         <span className="font-mono text-slate-700">{product.devUnitId}</span>
                     </div>
                      <div className="flex justify-between">
                         <span className="text-slate-400">Status</span> 
                         <span className={product.devStatus === '已完成' ? 'text-green-600' : 'text-slate-700'}>{product.devStatus}</span>
                     </div>
                     <div className="flex justify-between">
                         <span className="text-slate-400">Channel</span> 
                         <span className="text-slate-700">{product.channel}</span>
                     </div>
                     <div className="flex justify-between">
                         <span className="text-slate-400">Plan Date</span> 
                         <span className="text-slate-700">{product.planDate}</span>
                     </div>
                 </div>

                 {/* Extra fields for Selected Status */}
                 {product.selectionStatus === 'Selected' && (
                    <>
                        <div className="w-full h-px bg-slate-100 my-2"></div>
                        <div className="space-y-2">
                             <div className="flex justify-between">
                                <span className="text-slate-400">Selector</span>
                                <span className="text-slate-700">{product.operator}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Time</span>
                                <span className="text-slate-700 font-mono">{product.selectionTime}</span>
                            </div>
                        </div>

                        {product.stores.length > 0 && (
                             <div className="pt-2 mt-1">
                                <span className="text-slate-400 block mb-1.5 uppercase text-[10px] font-bold tracking-wider">Est. Grades</span>
                                <div className="space-y-1.5">
                                    {(() => {
                                        const grouped = product.stores.reduce((acc, store) => {
                                            if (!acc[store.grade]) acc[store.grade] = [];
                                            acc[store.grade].push(store.storeName);
                                            return acc;
                                        }, {} as Record<string, string[]>);
                                        
                                        const grades = ['S', 'A', 'B', 'C', 'D'];
                                        
                                        return grades.filter(g => g !== 'D').map(g => {
                                            if (!grouped[g]) return null;
                                            return (
                                                <div key={g} className="flex items-start text-[11px] leading-tight">
                                                    <span className={`font-bold mr-2 w-4 h-4 rounded flex items-center justify-center text-[9px] flex-shrink-0 ${
                                                         g === 'S' ? 'bg-red-50 text-red-600 border border-red-100' : 
                                                         g === 'A' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 
                                                         g === 'B' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                                                    }`}>{g}</span>
                                                    <span className="text-slate-600 pt-0.5">{grouped[g].join('、')}</span>
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
        </div>,
        document.body
      )}
    </>
  );
};

const ProductTable: React.FC<ProductTableProps> = ({ products, onDecision }) => {
  return (
    <div className="w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 backdrop-blur sticky top-0 z-10 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
            <th className="p-4 w-10 text-center rounded-tl-lg">
                <div className="flex items-center justify-center h-full">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer" />
                </div>
            </th>
            {onDecision && <th className="p-4 w-24">操作</th>}
            <th className="p-4">基本信息</th>
            <th className="p-4">SKC主图</th>
            <th className="p-4">产品信息</th>
            <th className="p-4">预估等级</th>
            <th className="p-4">打版信息</th>
            <th className="p-4">产品标签</th>
            <th className="p-4">选品状态</th>
            <th className="p-4">选品操作人</th>
            <th className="p-4">时间</th>
          </tr>
        </thead>
        <tbody className="text-xs text-slate-600 divide-y divide-slate-100 bg-white">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
              <td className="p-4 text-center align-top">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer mt-1" />
              </td>
              {onDecision && (
                <td className="p-4 align-top">
                  <button 
                    onClick={() => onDecision(product)}
                    className="text-blue-500 hover:text-blue-700 font-medium text-xs transition-colors whitespace-nowrap"
                  >
                    选品决策
                  </button>
                </td>
              )}
              <td className="p-4 align-top">
                <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                     <span className="text-slate-400">选品ID:</span>
                     <span className="text-blue-500 hover:underline cursor-pointer">{product.id}</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <span className="text-slate-400">SPU:</span>
                     <span className="text-blue-500 hover:underline cursor-pointer">{product.spu}</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <span className="text-slate-400">SKC:</span>
                     <span className="text-blue-500 hover:underline cursor-pointer">{product.skc}</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <span className="text-slate-400">DROP:</span>
                     <span className="text-blue-500 hover:underline cursor-pointer">{product.drop}</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <span className="text-slate-400">计划上新日期:</span>
                     <span>{product.planDate}</span>
                  </div>
                </div>
              </td>
              <td className="p-4 align-top">
                <div className="relative w-20 h-28 rounded overflow-hidden border border-slate-100 shadow-sm group-hover:shadow-md transition-all group-hover:scale-105 origin-left duration-300">
                    <ProductHoverPreview product={product}>
                        <img 
                            src={product.imageUrl} 
                            alt="SKC" 
                            className="w-full h-full object-cover" 
                        />
                    </ProductHoverPreview>
                </div>
              </td>
              <td className="p-4 align-top">
                <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                  <div className="flex items-start gap-1">
                     <span className="text-slate-400 whitespace-nowrap">产品分类:</span>
                     <span className="line-clamp-2">{product.categoryPath}</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <span className="text-slate-400">预估估价:</span>
                     <span>${product.price.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <span className="text-slate-400">产品线:</span>
                     <span>{product.productLine}</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <span className="text-slate-400">风格线:</span>
                     <span>{product.styleLine || product.tags[0] || 'Cute'}</span>
                  </div>
                </div>
              </td>
              <td className="p-4 align-top">
                {product.selectionStatus === 'Pending' ? (
                  <span className="text-slate-400 text-xs italic">
                    --
                  </span>
                ) : (
                  <div className="space-y-2">
                    {product.stores.map((store, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <GradeBadge grade={store.grade} />
                        <div className="flex flex-col leading-none">
                          <span className="text-slate-700 font-medium text-[11px]">{store.storeName}</span>
                          {store.inventoryDepth && (
                            <span className="text-[9px] text-slate-400 mt-0.5">Depth: {store.inventoryDepth}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </td>
              <td className="p-4 align-top">
                <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                     <span className="text-slate-400">开发单号:</span>
                     <span className="text-blue-500 hover:underline cursor-pointer">{product.devUnitId}</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <span className="text-slate-400">开发单状态:</span>
                     <span>{product.devStatus}</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <span className="text-slate-400">开款渠道:</span>
                     <span>{product.channel}</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <span className="text-slate-400">设计师:</span>
                     <span>{product.planningDeveloper}</span>
                  </div>
                </div>
              </td>
              <td className="p-4 align-top">
                <div className="flex flex-wrap gap-1">
                  {product.tags.length > 0 ? product.tags.map((tag, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 text-[10px] border border-blue-100">
                      {tag}
                    </span>
                  )) : (
                    <span className="text-slate-400">--</span>
                  )}
                </div>
              </td>
              <td className="p-4 align-top">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border
                    ${product.selectionStatus === 'Selected' ? 'bg-green-50 text-green-600 border-green-200' : 
                    product.selectionStatus === 'Rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                    'bg-orange-50 text-orange-500 border-orange-200'
                    }
                `}>
                    {product.selectionStatus === 'Selected' ? '已选品' : 
                    product.selectionStatus === 'Rejected' ? '已取消' : '待选品'}
                </span>
              </td>
              <td className="p-4 align-top text-xs text-slate-600">
                {product.operator || '--'}
              </td>
              <td className="p-4 align-top text-xs text-slate-600">
                <div className="flex items-center gap-1">
                    <span className="text-slate-400">创建时间:</span>
                    <span>{product.createdTime}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && (
        <div className="p-12 text-center flex flex-col items-center text-slate-400">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">🔍</span>
            </div>
            <p>暂无符合条件的数据</p>
        </div>
      )}
    </div>
  );
};

export default ProductTable;