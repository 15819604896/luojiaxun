import React, { useState, useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Copy, Check, X, Edit, Search, Tag, ChevronLeft, ChevronRight, Inbox, Download, Shirt, GripVertical, PanelRightClose, PanelRightOpen, GripHorizontal, Maximize2, Minimize2, Trash2, Settings, Zap, CheckSquare, Square, BarChart3, ChevronDown, ChevronUp, Folder } from 'lucide-react';
import { Product } from '../types';
import SelectionDecisionModal from './SelectionDecisionModal';

interface MoodSelectionProps {
  products: Product[];
}

const STORES = ['Valley Fair-VF', 'Farmer Market-FM'];
const GRADES = ['S', 'A', 'B', 'C', 'D'];
const CATEGORIES = ['毛织', '牛仔', '半裙', 'T恤', '衬衫', '连衣裙', '外套', '卫衣', '裤装', '配饰', '套装'];

// --- MultiSelect Component (Duplicated from FilterBar for encapsulation or use a shared component in real app) ---
const MultiSelect: React.FC<{ 
    label?: string; 
    icon?: React.ReactNode;
    options: string[]; 
    value: string[]; 
    onChange: (val: string[]) => void; 
    placeholder?: string;
  }> = ({ label, icon, options, value, onChange, placeholder = '全部' }) => {
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
         {label && (
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
            {label}
            </label>
         )}
         <div className="relative">
             {icon && <div className="absolute left-2 top-2 z-10 pointer-events-none">{icon}</div>}
             <button 
               onClick={() => setIsOpen(!isOpen)}
               className={`w-full text-xs p-1.5 ${icon ? 'pl-8' : 'px-3'} rounded border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 text-left flex items-center justify-between min-h-[30px]`}
               type="button"
             >
               <span className="truncate block max-w-[100px]">
                 {value.length === 0 ? placeholder : value.length === 1 ? value[0] : `已选 ${value.length} 项`}
               </span>
               <div className="text-[8px] text-slate-300 ml-1">▼</div>
             </button>
         </div>
         
         {isOpen && (
           <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 max-h-48 overflow-y-auto min-w-[140px]">
             {options.map(opt => (
               <div 
                 key={opt}
                 onClick={() => toggleOption(opt)}
                 className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer"
               >
                 <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${value.includes(opt) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
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

// --- Hover Preview Component ---
const ProductHoverPreview: React.FC<{ product: Product; children: React.ReactNode }> = ({ product, children }) => {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      let top = rect.top; 
      let left = rect.right + 15;
      
      if (left + 320 > viewportWidth) {
          left = rect.left - 335;
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
                 {/* Product Tags */}
                 {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pb-2">
                        {product.tags.map((tag, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-blue-600 text-[10px] border border-slate-200">
                                {tag}
                            </span>
                        ))}
                    </div>
                 )}

                 {/* Basic ID Info */}
                 <div className="grid grid-cols-2 gap-4 pb-2 border-b border-slate-100">
                     <div>
                        <span className="text-slate-400 text-[10px] block mb-0.5">选品ID</span>
                        <span className="text-slate-800 font-mono font-medium">{product.id}</span>
                     </div>
                     <div className="text-right">
                        <span className="text-slate-400 text-[10px] block mb-0.5">创建时间</span>
                        <span className="text-slate-800 font-mono">{product.createdTime.split(' ')[0]}</span>
                     </div>
                 </div>

                 <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-1">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Price</span>
                        <span className="text-slate-800 font-medium text-sm">${product.price}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Drop</span>
                        <span className="text-slate-800 font-medium">{product.drop}</span>
                    </div>
                 </div>
                 
                 {/* New Fields in Hover */}
                 <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-1">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Line</span>
                        <span className="text-slate-800 font-medium">{product.productLine}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Planner</span>
                        <span className="text-slate-800 font-medium truncate">{product.planningDeveloper}</span>
                    </div>
                 </div>

                 <div className="w-full h-px bg-slate-100 my-2"></div>
                 
                 {/* Dev Info Section */}
                 <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                     <div className="flex justify-between items-center">
                         <span className="text-slate-500">开发单号</span> 
                         <span className="font-mono text-slate-700 font-medium">{product.devUnitId}</span>
                     </div>
                      <div className="flex justify-between items-center">
                         <span className="text-slate-500">开发状态</span> 
                         <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                             product.devStatus === '已完成' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                         }`}>
                             {product.devStatus}
                         </span>
                     </div>
                 </div>

                 <div className="space-y-2 pt-1">
                     <div className="flex justify-between">
                         <span className="text-slate-400">Channel</span> 
                         <span className="text-slate-700">{product.channel}</span>
                     </div>
                     <div className="flex justify-between">
                         <span className="text-slate-400">Plan Date</span> 
                         <span className="text-slate-700">{product.planDate}</span>
                     </div>
                 </div>

                 {/* Logic for Selector details */}
                 {product.selectionStatus === 'Selected' && (
                    <div className="space-y-2 border-t border-slate-100 pt-3 mt-2">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Selector</span>
                            <span className="text-slate-700">{product.operator}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Time</span>
                            <span className="text-slate-700 font-mono">{product.selectionTime}</span>
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
                                        return grades.map(g => {
                                            if (!grouped[g]) return null;
                                            return (
                                                <div key={g} className="flex items-start text-[11px] leading-tight">
                                                    <span className={`font-bold mr-2 w-4 h-4 rounded flex items-center justify-center text-[9px] flex-shrink-0 ${
                                                         g === 'S' ? 'bg-red-50 text-red-600 border border-red-100' : 
                                                         g === 'A' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                                                         'bg-slate-100 text-slate-500 border-slate-200'
                                                    }`}>{g}</span>
                                                    <span className="text-slate-600 pt-0.5">{grouped[g].join('、')}</span>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                 )}
             </div>
        </div>,
        document.body
      )}
    </>
  );
};

// --- Product Card Component ---
const ProductCard: React.FC<{ 
  product: Product; 
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  actionClass?: string;
  variant?: 'grid' | 'list';
}> = ({ product, onAction, actionIcon, actionClass, variant = 'grid' }) => {
  
  if (variant === 'list') {
      return (
        <div className="group flex gap-3 p-3 bg-white rounded-lg border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="relative w-24 h-32 flex-shrink-0 rounded overflow-hidden bg-slate-100">
                <ProductHoverPreview product={product}>
                    <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.skc} />
                </ProductHoverPreview>
                {product.selectionStatus === 'Selected' && (
                     <div className="absolute bottom-0 right-0 bg-green-500 text-white w-5 h-5 flex items-center justify-center rounded-tl text-[10px]">
                        <Check size={10} strokeWidth={4} />
                     </div>
                )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                    <div className="flex justify-between items-start mb-1">
                         <div className="font-bold text-sm text-slate-800 truncate pr-2" title={product.skc}>{product.skc}</div>
                         <div className="font-bold text-lg text-slate-900">${product.price}</div>
                    </div>
                    {/* Full Category Path - Multiline */}
                    <div className="text-[10px] text-slate-500 leading-tight mb-2 break-words line-clamp-2" title={product.categoryPath}>
                        {product.categoryPath}
                    </div>
                    
                    {/* Show Tags instead of Line & Developer */}
                    {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
                             {product.tags.map((tag, i) => (
                                 <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-100 text-[9px]">
                                     <Tag size={8} className="mr-1 text-slate-400" />
                                     {tag}
                                 </span>
                             ))}
                        </div>
                    )}
                </div>
                
                <div className="flex justify-between items-end mt-auto pt-2 border-t border-slate-50">
                     <div className="flex gap-1">
                        {product.stores.length > 0 ? (
                            product.stores.slice(0, 3).map((s, i) => (
                                <span key={i} className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold border ${
                                    s.grade === 'S' ? 'bg-red-50 text-red-600 border-red-100' :
                                    s.grade === 'A' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                    'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>{s.grade}</span>
                            ))
                        ) : (
                            <span className="text-[10px] text-slate-300 italic">No grades</span>
                        )}
                        {product.stores.length > 3 && <span className="text-[10px] text-slate-400 self-end">...</span>}
                     </div>
                     <div className="flex gap-2">
                         <button onClick={(e) => {e.stopPropagation(); onAction?.()}} className="text-slate-400 hover:text-blue-600 p-1 hover:bg-slate-50 rounded">
                             <Edit size={14} />
                         </button>
                     </div>
                </div>
            </div>
        </div>
      )
  }

  // Grid Variant (Default)
  return (
    <div className="relative group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ring-1 ring-slate-100 hover:ring-slate-200 flex flex-col h-full">
        <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
        <ProductHoverPreview product={product}>
            <img 
                src={product.imageUrl} 
                alt={product.skc} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
        </ProductHoverPreview>
        
        {/* Action Button - Top Right, Always Visible, Correctly Styled */}
        {onAction && (
            <button 
                onClick={(e) => { e.stopPropagation(); onAction(); }}
                className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md z-10 transition-transform hover:scale-110 ${actionClass || 'bg-blue-600 text-white hover:bg-blue-500'}`}
                title="Action"
            >
                {actionIcon}
            </button>
        )}

        {/* Copy Button - Bottom Right Overlay (Hover Only) */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
             <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 shadow-sm transition-colors">
                <Copy size={14} />
            </button>
        </div>
        
        </div>

        <div className="p-3 flex flex-col flex-1">
            <div className="flex justify-between items-start gap-2 mb-1">
                <div className="font-bold text-slate-800 text-xs truncate flex-1" title={product.skc}>{product.skc}</div>
                <div className="font-bold text-slate-900 text-xs">${product.price}</div>
            </div>
            
            {/* Full Category Path - Updated */}
            <div className="text-[10px] text-slate-500 mb-2 leading-tight h-8 overflow-hidden text-ellipsis line-clamp-2" title={product.categoryPath}>
                {product.categoryPath}
            </div>
            
            <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-50">
                <div className="flex gap-1 flex-wrap h-5 overflow-hidden">
                    {/* Updated to show up to 2 tags */}
                    {product.tags.slice(0, 2).map((t, i) => (
                        <span key={i} className="bg-slate-50 text-slate-500 border border-slate-100 px-1.5 py-0.5 rounded text-[9px] truncate max-w-full font-medium">{t}</span>
                    ))}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{product.drop}</span>
            </div>
        </div>
    </div>
  );
};

const MoodSelection: React.FC<MoodSelectionProps> = ({ products }) => {
  // --- States ---
  // List States
  const [selectedList, setSelectedList] = useState<Product[]>(products.slice(0, 6)); 
  const [cancelledList, setCancelledList] = useState<Product[]>(products.slice(6, 7)); 
  const [poolList, setPoolList] = useState<Product[]>(products.slice(7)); 
  
  // View States
  const [viewMode, setViewMode] = useState<'pool' | 'selected' | 'cancelled'>('pool');
  
  // Modal State
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Mood Board Drawer State
  const [showMoodBoard, setShowMoodBoard] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Selection for Batch Actions
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  
  // Batch Grade State
  const [batchTargetStores, setBatchTargetStores] = useState<string[]>([]);
  const [batchGrade, setBatchGrade] = useState(GRADES[0]);
  const [showStats, setShowStats] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Filter State (Internal logic kept, UI triggers removed)
  const [activeFilters, setActiveFilters] = useState({
      search: '',
      productLine: '',
      planningDeveloper: '',
      store: [] as string[]
  });

  // Helper to apply filters
  const applyFilters = (list: Product[]) => {
      return list.filter(p => {
          const matchSearch = activeFilters.search === '' || 
              p.skc.toLowerCase().includes(activeFilters.search.toLowerCase()) || 
              p.drop.toLowerCase().includes(activeFilters.search.toLowerCase());
          const matchLine = activeFilters.productLine === '' || p.productLine === activeFilters.productLine;
          const matchDev = activeFilters.planningDeveloper === '' || p.planningDeveloper === activeFilters.planningDeveloper;
          const matchStore = activeFilters.store.length === 0 || 
                             p.stores.some(s => activeFilters.store.includes(s.storeName));
          return matchSearch && matchLine && matchDev && matchStore;
      });
  };

  // Derived filtered products based on View Mode
  const displayedProducts = useMemo(() => {
      switch(viewMode) {
          case 'pool': return applyFilters(poolList);
          case 'selected': return applyFilters(selectedList);
          case 'cancelled': return applyFilters(cancelledList);
          default: return [];
      }
  }, [viewMode, poolList, selectedList, cancelledList, activeFilters]);

  // Pagination Logic
  const totalPages = Math.ceil(displayedProducts.length / itemsPerPage);
  const currentProducts = displayedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Grade Statistics Calculation
  const gradeStats = useMemo(() => {
      const stats: Record<string, Record<string, number>> = {};
      
      // Initialize stats
      STORES.forEach(store => {
          stats[store] = {};
          GRADES.forEach(grade => {
              stats[store][grade] = 0;
          });
      });

      selectedList.forEach(p => {
          p.stores.forEach(s => {
              if (stats[s.storeName]) {
                  if (stats[s.storeName][s.grade] !== undefined) {
                      stats[s.storeName][s.grade]++;
                  }
              }
          });
      });
      return stats;
  }, [selectedList]);

  // --- Handlers ---
  const openDecisionModal = (product: Product) => {
      setActiveProduct(product);
      setDecisionModalOpen(true);
  };

  const handleDecisionConfirm = (updatedProduct: Product) => {
      const pid = updatedProduct.id;
      // Remove from all source lists
      const newPool = poolList.filter(p => p.id !== pid);
      const newSelected = selectedList.filter(p => p.id !== pid);
      const newCancelled = cancelledList.filter(p => p.id !== pid);

      // Add to new destination
      if (updatedProduct.selectionStatus === 'Selected') {
          setSelectedList([updatedProduct, ...newSelected]);
          setPoolList(newPool);
          setCancelledList(newCancelled);
      } else if (updatedProduct.selectionStatus === 'Rejected') {
          setCancelledList([updatedProduct, ...newCancelled]);
          setSelectedList(newSelected);
          setPoolList(newPool);
      } else {
          setPoolList([updatedProduct, ...newPool]);
          setSelectedList(newSelected);
          setCancelledList(newCancelled);
      }
  };

  // Selection Logic
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedProductIds);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setSelectedProductIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedProductIds.size === selectedList.length) {
        setSelectedProductIds(new Set());
    } else {
        setSelectedProductIds(new Set(selectedList.map(p => p.id)));
    }
  };

  // Grading Handlers
  const handleBatchGradeApply = () => {
    if (selectedProductIds.size === 0 || batchTargetStores.length === 0) return;

    const updatedList = selectedList.map(p => {
        if (!selectedProductIds.has(p.id)) return p; // Only update selected items

        const newStores = [...p.stores];
        
        batchTargetStores.forEach(targetStore => {
            const existingStoreIndex = newStores.findIndex(s => s.storeName === targetStore);
            if (existingStoreIndex >= 0) {
                newStores[existingStoreIndex] = { ...newStores[existingStoreIndex], grade: batchGrade as any };
            } else {
                newStores.push({ storeName: targetStore, grade: batchGrade as any });
            }
        });
        
        return { ...p, stores: newStores };
    });
    setSelectedList(updatedList);
  };

  const handleIndividualGrade = (productId: string, store: string, grade: string) => {
    const updatedList = selectedList.map(p => {
        if (p.id !== productId) return p;
        const newStores = [...p.stores];
        const existingStoreIndex = newStores.findIndex(s => s.storeName === store);
        if (existingStoreIndex >= 0) {
             newStores[existingStoreIndex] = { ...newStores[existingStoreIndex], grade: grade as any };
        } else {
             newStores.push({ storeName: store, grade: grade as any });
        }
        return { ...p, stores: newStores };
    });
    setSelectedList(updatedList);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    // Explicitly allow move
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Visual feedback handled by state, but we need this for drop to fire
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newItems = [...selectedList];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    setSelectedList(newItems);
    setDraggedIndex(null);
  };

  return (
    <div className="relative flex h-full p-1 overflow-hidden">
      {/* LEFT PANEL: MAIN BROWSER */}
      <div className={`flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full ring-1 ring-slate-900/5 transition-all duration-300 ease-in-out ${showMoodBoard ? 'mr-4' : 'mr-0'}`}>
         {/* Header Tabs - NEW FEATURE */}
         <div className="flex flex-col border-b border-slate-100 bg-white sticky top-0 z-20">
             <div className="px-5 pt-4 pb-0 flex justify-between items-end">
                 <div className="flex gap-6">
                    <button 
                        onClick={() => { setViewMode('pool'); setCurrentPage(1); }}
                        className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-2 ${
                            viewMode === 'pool' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <Inbox size={16} />
                        待选池
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${viewMode === 'pool' ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-400'}`}>
                            {poolList.length}
                        </span>
                        {viewMode === 'pool' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 rounded-t-full"></span>}
                    </button>
                    <button 
                        onClick={() => { setViewMode('selected'); setCurrentPage(1); }}
                        className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-2 ${
                            viewMode === 'selected' ? 'text-green-700' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <Check size={16} />
                        已选品
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${viewMode === 'selected' ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-400'}`}>
                            {selectedList.length}
                        </span>
                        {viewMode === 'selected' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 rounded-t-full"></span>}
                    </button>
                    <button 
                        onClick={() => { setViewMode('cancelled'); setCurrentPage(1); }}
                        className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-2 ${
                            viewMode === 'cancelled' ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <X size={16} />
                        已取消
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${viewMode === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                            {cancelledList.length}
                        </span>
                        {viewMode === 'cancelled' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full"></span>}
                    </button>
                 </div>
                 
                 <div className="pb-3 flex gap-2">
                    <button 
                        onClick={() => setShowMoodBoard(!showMoodBoard)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 shadow-sm border ${
                            showMoodBoard 
                            ? 'bg-blue-50 text-blue-600 border-blue-200 ring-1 ring-blue-200' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {showMoodBoard ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
                        {showMoodBoard ? '收起搭配' : '搭配预览'}
                    </button>
                    <button className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 shadow-sm">
                        <Download size={14} /> 批量导出
                    </button>
                 </div>
             </div>
         </div>

         {/* Content */}
         <div className="flex-1 overflow-y-auto p-5 bg-slate-50/30 scroll-smooth">
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
                {currentProducts.map(product => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAction={() => {
                            if (viewMode === 'pool') {
                                // Add to mood board: Remove from pool, Add to selected
                                setPoolList(prev => prev.filter(p => p.id !== product.id));
                                setSelectedList(prev => [{...product, selectionStatus: 'Selected'}, ...prev]);
                                // Open sidebar if closed
                                if (!showMoodBoard) setShowMoodBoard(true);
                            } else {
                                openDecisionModal(product);
                            }
                        }}
                        // Dynamic Icon: Plus for Pool, Edit for others
                        actionIcon={viewMode === 'pool' ? <Plus size={18} /> : <Edit size={14} />}
                        actionClass={viewMode === 'pool' ? "bg-slate-900 text-white hover:bg-blue-600" : "bg-white text-slate-500 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"}
                    />
                ))}
                {displayedProducts.length === 0 && (
                    <div className="col-span-full h-40 flex flex-col items-center justify-center text-slate-300">
                        <Search size={32} className="mb-2 opacity-50" />
                        <span className="text-sm">
                            {viewMode === 'pool' ? '选品池为空' : viewMode === 'selected' ? '暂无已选商品' : '暂无已取消商品'}
                        </span>
                    </div>
                )}
             </div>
         </div>

         {/* Pagination Footer */}
         <div className="px-5 py-3 border-t border-slate-100 bg-white flex justify-between items-center z-10">
            <span className="text-xs text-slate-500">
                显示 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, displayedProducts.length)} 共 {displayedProducts.length} 项
            </span>
            <div className="flex gap-1 items-center">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={14} />
                </button>
                <span className="px-3 text-xs font-medium text-slate-700">
                    {currentPage} / {totalPages || 1}
                </span>
                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={14} />
                </button>
            </div>
         </div>
      </div>

      {/* RIGHT PANEL: Mood Board Sidebar */}
      <div 
        className={`flex-none bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col transition-all duration-300 ease-in-out transform origin-right overflow-hidden ${
          showMoodBoard ? 'w-80 translate-x-0 opacity-100' : 'w-0 translate-x-10 opacity-0'
        }`}
      >
          <div className="flex justify-between items-center px-4 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">搭配预览</span>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{selectedList.length}</span>
              </div>
              <div className="flex items-center gap-1">
                 <button 
                    onClick={() => setIsMaximized(true)} 
                    className="text-slate-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                    title="展开全屏"
                 >
                    <Maximize2 size={16} />
                 </button>
                 <button onClick={() => setShowMoodBoard(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors">
                    <X size={18} />
                 </button>
              </div>
          </div>
          
          <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100">
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <GripHorizontal size={12} />
                  拖拽图片可调整搭配顺序
              </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
              {selectedList.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedList.map((product, index) => (
                      <div 
                        key={product.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`relative group aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 shadow-sm transition-all cursor-grab active:cursor-grabbing bg-slate-100 ${
                            draggedIndex === index 
                            ? 'opacity-40 scale-95 ring-2 ring-blue-400 border-blue-400 border-dashed' 
                            : 'hover:border-blue-300 hover:shadow-md'
                        }`}
                        // Removed onClick={() => openDecisionModal(product)} here
                      >
                           {/* Drag Handle Overlay */}
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 flex items-center justify-center pointer-events-none"></div>

                           <img src={product.imageUrl} alt={product.skc} className="w-full h-full object-cover pointer-events-none" />
                           
                           {/* Subtle Price Tag */}
                           <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white font-medium z-20">
                               ${product.price}
                           </div>

                           {/* Delete Button (Always Visible) */}
                           <button
                               onClick={(e) => {
                                   e.stopPropagation();
                                   const newSelected = selectedList.filter(p => p.id !== product.id);
                                   setSelectedList(newSelected);
                                   setPoolList([product, ...poolList]);
                               }} 
                               className="absolute top-1 right-1 bg-white/90 backdrop-blur-md rounded p-1.5 text-red-500 hover:text-red-600 hover:bg-white z-30 transition-all shadow-sm"
                               title="移除"
                           >
                               <Trash2 size={12} />
                           </button>
                      </div>
                    ))}
                  </div>
              ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3 border-2 border-dashed border-slate-100 rounded-xl min-h-[200px]">
                       <Shirt size={32} className="opacity-20" />
                       <div className="text-center">
                           <p className="text-xs font-medium">暂无已选商品</p>
                           <p className="text-[10px] mt-1">去左侧列表挑选加入</p>
                       </div>
                  </div>
              )}
          </div>
      </div>

      {/* Maximized Full Screen View */}
      {isMaximized && createPortal(
          <div className="fixed inset-0 z-[100] bg-slate-100/95 backdrop-blur-sm flex flex-col animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-20">
                  <div className="flex justify-between items-center">
                      <div className="flex items-center gap-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Shirt className="text-blue-600" /> 搭配预览详情
                            </h2>
                            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-bold">{selectedList.length} Items</span>
                                勾选图片后可批量定级
                            </p>
                        </div>

                         {/* Batch Action Toolbar */}
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-2 shadow-inner">
                            <div className="flex items-center gap-1 border-r border-slate-200 pr-3 mr-1">
                                <button 
                                    onClick={handleSelectAll}
                                    className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors"
                                >
                                    {selectedProductIds.size === selectedList.length && selectedList.length > 0 ? (
                                        <CheckSquare size={14} className="text-blue-600"/>
                                    ) : (
                                        <Square size={14} />
                                    )}
                                    全选
                                </button>
                                <span className="text-xs text-slate-400 ml-1">
                                    (已选 {selectedProductIds.size})
                                </span>
                            </div>

                            <span className="text-xs font-bold text-slate-500">批量定级:</span>
                            <div className="flex items-center gap-2">
                                <div className="w-[160px]">
                                    <MultiSelect 
                                        options={STORES} 
                                        value={batchTargetStores} 
                                        onChange={setBatchTargetStores} 
                                        placeholder="选择门店" 
                                    />
                                </div>
                                <select 
                                    value={batchGrade} 
                                    onChange={(e) => setBatchGrade(e.target.value)}
                                    className="text-xs border border-slate-300 rounded px-2 py-1.5 bg-white focus:ring-blue-500 focus:border-blue-500 font-bold cursor-pointer disabled:opacity-50 min-w-[60px]"
                                    disabled={selectedProductIds.size === 0}
                                >
                                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                                <button 
                                    onClick={handleBatchGradeApply}
                                    disabled={selectedProductIds.size === 0 || batchTargetStores.length === 0}
                                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
                                >
                                    <Zap size={12} /> 应用
                                </button>
                            </div>
                        </div>
                      </div>

                      <div className="flex gap-3 items-center">
                          {/* Toggle Stats */}
                          <button 
                             onClick={() => setShowStats(!showStats)}
                             className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border
                                ${showStats ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}
                             `}
                          >
                              <BarChart3 size={14} /> {showStats ? '隐藏统计' : '定级统计'}
                          </button>

                          <button onClick={() => setIsMaximized(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                              <Minimize2 size={24} />
                          </button>
                      </div>
                  </div>

                  {/* Stats Panel */}
                  {showStats && (
                      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-200">
                          {STORES.map(store => (
                              <div key={store} className="flex items-center gap-4">
                                  <span className="text-xs font-bold text-slate-600 w-24 truncate" title={store}>{store}</span>
                                  <div className="flex flex-1 gap-2">
                                      {GRADES.filter(g => g !== 'D').map(grade => (
                                          <div key={grade} className="flex items-center bg-slate-50 border border-slate-200 rounded px-2 py-1 min-w-[3rem] justify-between">
                                              <span className={`text-[10px] font-bold mr-2 ${
                                                  grade === 'S' ? 'text-red-500' : 
                                                  grade === 'A' ? 'text-orange-500' : 
                                                  grade === 'B' ? 'text-blue-500' : 'text-slate-400'
                                              }`}>{grade}</span>
                                              <span className="text-xs font-mono text-slate-700">{gradeStats[store]?.[grade] || 0}</span>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
              
              {/* Canvas */}
              <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
                  <div className="max-w-7xl mx-auto">
                      {selectedList.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {selectedList.map((product, index) => {
                                const isSelected = selectedProductIds.has(product.id);
                                return (
                                <div 
                                    key={product.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onClick={() => toggleSelection(product.id)}
                                    className={`group relative bg-white rounded-xl shadow-sm border overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col
                                        ${draggedIndex === index ? 'opacity-40 scale-95 ring-4 ring-blue-100 border-blue-400 border-dashed' : ''}
                                        ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200 hover:border-blue-300'}
                                    `}
                                >
                                    {/* Selection Checkbox Overlay */}
                                    <div className={`absolute top-2 left-2 z-20 w-5 h-5 rounded border bg-white flex items-center justify-center transition-all duration-200
                                        ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 text-transparent hover:border-blue-400'}
                                    `}>
                                        <Check size={12} strokeWidth={3} />
                                    </div>

                                    {/* Image Area */}
                                    <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                                        <img src={product.imageUrl} className="w-full h-full object-cover pointer-events-none select-none" />
                                        
                                        <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newSelected = selectedList.filter(p => p.id !== product.id);
                                                    setSelectedList(newSelected);
                                                    setPoolList([product, ...poolList]);
                                                    if (selectedProductIds.has(product.id)) {
                                                        const newIds = new Set(selectedProductIds);
                                                        newIds.delete(product.id);
                                                        setSelectedProductIds(newIds);
                                                    }
                                                }}
                                                className="w-8 h-8 rounded-full bg-white/90 backdrop-blur text-slate-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center shadow-sm"
                                                title="移除"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur text-white text-[10px] px-1.5 py-0.5 rounded">
                                            {product.skc}
                                        </div>
                                    </div>

                                    {/* Individual Grading Area */}
                                    <div className="p-3 bg-white flex-1 flex flex-col gap-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            <Settings size={10} /> 门店定级
                                        </div>
                                        {STORES.map(store => {
                                            const currentGrade = product.stores.find(s => s.storeName === store)?.grade;
                                            return (
                                                <div key={store} className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-600 truncate max-w-[60%]" title={store}>{store}</span>
                                                    <select 
                                                        value={currentGrade || ''} 
                                                        onChange={(e) => handleIndividualGrade(product.id, store, e.target.value)}
                                                        className={`border rounded px-1 py-0.5 text-xs font-bold cursor-pointer focus:ring-1 focus:ring-blue-500 outline-none
                                                            ${!currentGrade ? 'text-slate-400 border-slate-200' : 
                                                              currentGrade === 'S' ? 'text-red-600 bg-red-50 border-red-200' :
                                                              currentGrade === 'A' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                                                              currentGrade === 'B' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                                                              'text-slate-700 border-slate-200'}
                                                        `}
                                                    >
                                                        <option value="">-</option>
                                                        {GRADES.map(g => (
                                                            <option key={g} value={g}>{g}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                )
                            })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-300 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50">
                            <Shirt size={64} className="opacity-20 mb-4" />
                            <h3 className="text-xl font-bold text-slate-400">暂无搭配商品</h3>
                            <p className="text-slate-400 mt-2">请关闭全屏模式，从左侧商品库添加</p>
                            <button onClick={() => setIsMaximized(false)} className="mt-6 px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 shadow-sm font-medium transition-colors">
                                返回选品列表
                            </button>
                        </div>
                      )}
                  </div>
              </div>
          </div>,
          document.body
      )}

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