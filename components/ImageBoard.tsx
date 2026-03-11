import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { LayoutGrid, Tags, Store, CalendarDays, ChevronDown, ChevronRight, FoldVertical, UnfoldVertical, GripVertical, Save, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

interface ImageBoardProps {
  products: Product[];
}

const STORES = ['Valley Fair-VF', 'Farmer Market-FM'];
const VIEW_MODES = [
  { id: 'style', label: '按风格线查看', icon: <LayoutGrid size={14} /> },
  { id: 'category', label: '按品类查看', icon: <Tags size={14} /> }
];

const ImageBoard: React.FC<ImageBoardProps> = ({ products }) => {
  const [selectedStore, setSelectedStore] = useState<string>(STORES[0]);
  const [selectedDrop, setSelectedDrop] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'style' | 'category'>('style');

  const [localGroups, setLocalGroups] = useState<Record<string, Record<string, Product[]>>>({});
  const [draggedItem, setDraggedItem] = useState<{ primary: string, secondary: string, index: number } | null>(null);
  const [draggedGroup, setDraggedGroup] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const handleSaveOrder = () => {
    setSaveStatus('saving');
    const storageKey = `board_order_${viewMode}_${selectedStore}_${selectedDrop}`;
    const orderToSave: Record<string, Record<string, string[]>> = {};
    Object.keys(localGroups).forEach(pKey => {
      orderToSave[pKey] = {};
      Object.keys(localGroups[pKey]).forEach(sKey => {
        orderToSave[pKey][sKey] = localGroups[pKey][sKey].map(p => p.id);
      });
    });
    localStorage.setItem(storageKey, JSON.stringify(orderToSave));
    
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  const isAllCollapsed = Object.keys(localGroups).length > 0 && collapsedGroups.size === Object.keys(localGroups).length;

  const toggleAll = () => {
    if (isAllCollapsed) {
      setCollapsedGroups(new Set());
    } else {
      setCollapsedGroups(new Set(Object.keys(localGroups)));
    }
  };

  // Extract unique drops from products
  const availableDrops = useMemo(() => {
    const drops = new Set<string>();
    products.forEach(p => {
      if (p.drop) drops.add(p.drop);
    });
    return Array.from(drops).sort();
  }, [products]);

  // Filter products by selected store, status 'Selected', and selected drop
  const storeProducts = useMemo(() => {
    return products.filter(p => {
      const matchStatus = p.selectionStatus === 'Selected';
      const matchStore = p.stores.some(s => s.storeName === selectedStore);
      const matchDrop = selectedDrop === '' || p.drop === selectedDrop;
      
      let matchDate = true;
      if (startDate) {
        matchDate = matchDate && !!p.planDate && p.planDate >= startDate;
      }
      if (endDate) {
        matchDate = matchDate && !!p.planDate && p.planDate <= endDate;
      }
      
      return matchStatus && matchStore && matchDrop && matchDate;
    });
  }, [products, selectedStore, selectedDrop, startDate, endDate]);

  // Group products based on view mode
  const newProductIds = useMemo(() => {
    const storageKey = `board_order_${viewMode}_${selectedStore}_${selectedDrop}`;
    const saved = localStorage.getItem(storageKey);
    if (!saved) return new Set<string>();
    
    try {
      const savedOrder: Record<string, Record<string, string[]>> = JSON.parse(saved);
      const savedIds = new Set<string>();
      Object.values(savedOrder).forEach(secondaries => {
        Object.values(secondaries).forEach(ids => {
          ids.forEach(id => savedIds.add(id));
        });
      });
      
      return new Set(storeProducts.map(p => p.id).filter(id => !savedIds.has(id)));
    } catch (e) {
      return new Set<string>();
    }
  }, [storeProducts, viewMode, selectedStore, selectedDrop]);

  const groupedProducts = useMemo(() => {
    const groups: Record<string, Record<string, Product[]>> = {};
    const storageKey = `board_order_${viewMode}_${selectedStore}_${selectedDrop}`;
    let savedOrder: Record<string, Record<string, string[]>> | null = null;
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) savedOrder = JSON.parse(saved);
    } catch (e) {}

    const productLocationMap = new Map<string, { primary: string, secondary: string, index: number }>();
    if (savedOrder) {
      Object.entries(savedOrder).forEach(([primary, secondaries]) => {
        Object.entries(secondaries).forEach(([secondary, ids]) => {
          ids.forEach((id, index) => {
            productLocationMap.set(id, { primary, secondary, index });
          });
        });
      });
    }

    storeProducts.forEach(product => {
      let primaryKey = 'Other';
      let secondaryKey = 'Other';

      const savedLoc = productLocationMap.get(product.id);
      if (savedLoc) {
        primaryKey = savedLoc.primary;
        secondaryKey = savedLoc.secondary;
      } else {
        const style = product.styleLine || product.tags.find(t => !t.includes('选品')) || 'Other';
        
        const parts = product.categoryPath.split('>>');
        let category = 'Other';
        if (parts.length >= 4) {
          category = parts[3];
        } else if (parts.length >= 3) {
          category = parts[2];
        } else {
          category = parts[parts.length - 1] || 'Other';
        }

        if (viewMode === 'style') {
          primaryKey = style;
          secondaryKey = category;
        } else {
          primaryKey = category;
          secondaryKey = 'all'; // Flatten secondary groups when viewing by category
        }
      }

      if (!groups[primaryKey]) groups[primaryKey] = {};
      if (!groups[primaryKey][secondaryKey]) groups[primaryKey][secondaryKey] = [];
      groups[primaryKey][secondaryKey].push(product);
    });

    if (savedOrder) {
      Object.keys(groups).forEach(primary => {
        Object.keys(groups[primary]).forEach(secondary => {
          groups[primary][secondary].sort((a, b) => {
            const locA = productLocationMap.get(a.id);
            const locB = productLocationMap.get(b.id);
            const indexA = locA ? locA.index : -1;
            const indexB = locB ? locB.index : -1;
            if (indexA === indexB) return 0;
            return indexA - indexB;
          });
        });
      });
    }

    return groups;
  }, [storeProducts, viewMode, selectedStore, selectedDrop]);

  React.useEffect(() => {
    setLocalGroups(groupedProducts);
  }, [groupedProducts]);

  const handleDragStart = (e: React.DragEvent, primary: string, secondary: string, index: number) => {
    setDraggedItem({ primary, secondary, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleGroupDragStart = (e: React.DragEvent, primaryName: string) => {
    e.stopPropagation();
    setDraggedGroup(primaryName);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleGroupDrop = (e: React.DragEvent, targetPrimary: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedGroup || draggedGroup === targetPrimary) {
      setDraggedGroup(null);
      return;
    }

    setLocalGroups(prev => {
      const entries = Object.entries(prev);
      const sourceIndex = entries.findIndex(([k]) => k === draggedGroup);
      const targetIndex = entries.findIndex(([k]) => k === targetPrimary);
      
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const [movedEntry] = entries.splice(sourceIndex, 1);
      entries.splice(targetIndex, 0, movedEntry);

      const newGroups = Object.fromEntries(entries);

      return newGroups;
    });
    setDraggedGroup(null);
  };

  const handleDrop = (e: React.DragEvent, targetPrimary: string, targetSecondary: string, targetIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { primary: sourcePrimary, secondary: sourceSecondary, index: sourceIndex } = draggedItem;

    if (sourcePrimary === targetPrimary && sourceSecondary === targetSecondary && sourceIndex === targetIndex) {
      setDraggedItem(null);
      return;
    }

    setLocalGroups(prev => {
      const newGroups = { ...prev };
      
      newGroups[sourcePrimary] = { ...newGroups[sourcePrimary] };
      if (sourcePrimary !== targetPrimary) {
        newGroups[targetPrimary] = { ...newGroups[targetPrimary] };
      }

      const sourceList = [...newGroups[sourcePrimary][sourceSecondary]];
      const targetList = (sourcePrimary === targetPrimary && sourceSecondary === targetSecondary) 
        ? sourceList 
        : [...(newGroups[targetPrimary][targetSecondary] || [])];

      const [movedItem] = sourceList.splice(sourceIndex, 1);
      targetList.splice(targetIndex, 0, movedItem);

      newGroups[sourcePrimary][sourceSecondary] = sourceList;
      newGroups[targetPrimary][targetSecondary] = targetList;

      if (sourceList.length === 0) {
        delete newGroups[sourcePrimary][sourceSecondary];
        if (Object.keys(newGroups[sourcePrimary]).length === 0) {
          delete newGroups[sourcePrimary];
        }
      }

      return newGroups;
    });
    setDraggedItem(null);
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    return Object.entries(groupedProducts).map(([name, secondaryGroups]) => {
      const count = Object.values(secondaryGroups).reduce((acc, items) => acc + items.length, 0);
      return { name, count };
    });
  }, [groupedProducts]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-transparent">
      {/* Top Controls */}
      <div className="flex-none bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium text-sm">
              <Store size={16} className="text-slate-400" />
              选择门店:
            </div>
            <select 
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
            >
              {STORES.map(store => (
                <option key={store} value={store}>{store}</option>
              ))}
            </select>
          </div>

          <div className="w-px h-6 bg-slate-200"></div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium text-sm">
              <CalendarDays size={16} className="text-slate-400" />
              Drop:
            </div>
            <select 
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 min-w-[140px]"
              value={selectedDrop}
              onChange={(e) => setSelectedDrop(e.target.value)}
            >
              <option value="">全部 Drop</option>
              {availableDrops.map(drop => (
                <option key={drop} value={drop}>{drop}</option>
              ))}
            </select>
          </div>

          <div className="hidden md:block w-px h-6 bg-slate-200"></div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium text-sm">
              drop上新时间:
            </div>
            <div className="flex items-center border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
              <CalendarDays size={16} className="text-slate-400 mr-2" />
              <input 
                type="date" 
                className="bg-transparent text-slate-600 focus:outline-none w-[115px]"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-slate-400 mx-2">-</span>
              <input 
                type="date" 
                className="bg-transparent text-slate-600 focus:outline-none w-[115px]"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {VIEW_MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as 'style' | 'category')}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  viewMode === mode.id 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {mode.icon}
                {mode.label}
              </button>
            ))}
          </div>
          <div className="w-px h-6 bg-slate-200"></div>
          <button 
            onClick={handleSaveOrder}
            disabled={saveStatus !== 'idle'}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              saveStatus === 'success' 
                ? 'bg-emerald-50 text-emerald-600' 
                : 'text-white bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {saveStatus === 'success' ? <Check size={16} /> : <Save size={16} />}
            {saveStatus === 'success' ? '已保存' : saveStatus === 'saving' ? '保存中...' : '保存排序'}
          </button>
          <button 
            onClick={toggleAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            {isAllCollapsed ? <UnfoldVertical size={16} /> : <FoldVertical size={16} />}
            {isAllCollapsed ? '全部展开' : '全部折叠'}
          </button>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* Summary Section */}
        <div className="flex gap-4 mb-6">
          {/* Total Count Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center min-w-[200px]">
            <div className="text-sm text-slate-500 font-medium mb-2">SKC 总数</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900">{storeProducts.length}</span>
              <span className="text-sm text-slate-500 font-medium">款</span>
            </div>
          </div>

          {/* Chart Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={80}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#818cf8" />
                  ))}
                  <LabelList dataKey="count" position="top" fill="#475569" fontSize={12} fontWeight={500} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grouped Products */}
        <div className="space-y-8 pb-8">
          {Object.entries(localGroups).map(([primaryName, secondaryGroups]) => (
            <div 
              key={primaryName} 
              className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all ${
                draggedGroup === primaryName ? 'opacity-50 scale-[0.98] ring-2 ring-blue-400 border-blue-400 border-dashed' : ''
              }`}
              onDragOver={(e) => {
                if (draggedGroup) {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }
              }}
              onDrop={(e) => {
                if (draggedGroup) {
                  e.preventDefault();
                  e.stopPropagation();
                  handleGroupDrop(e, primaryName);
                }
              }}
            >
              <div 
                className={`flex items-center justify-between cursor-pointer group ${collapsedGroups.has(primaryName) ? '' : 'mb-6 pb-4 border-b border-slate-100'}`}
                onClick={() => toggleGroup(primaryName)}
              >
                <div className="flex items-center gap-3">
                  <div 
                    draggable
                    onDragStart={(e) => handleGroupDragStart(e, primaryName)}
                    onDragEnd={() => setDraggedGroup(null)}
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded transition-colors"
                  >
                    <GripVertical size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{primaryName}</h3>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {Object.values(secondaryGroups).reduce((acc, items) => acc + items.length, 0)} 款
                  </span>
                </div>
                <button className="text-slate-400 group-hover:text-blue-500 transition-colors p-1 rounded-md hover:bg-slate-50">
                  {collapsedGroups.has(primaryName) ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
              
              {!collapsedGroups.has(primaryName) && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {Object.entries(secondaryGroups).map(([secondaryName, items]) => (
                  <div key={secondaryName}>
                    {viewMode === 'style' && (
                      <div className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                         <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                         {secondaryName} 
                         <span className="text-xs font-normal text-slate-400">({items.length})</span>
                      </div>
                    )}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                      {items.map((product, index) => (
                        <div 
                          key={product.id} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, primaryName, secondaryName, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, primaryName, secondaryName, index)}
                          className={`group flex flex-col border border-slate-100 rounded-lg overflow-hidden hover:shadow-md transition-all bg-white cursor-grab active:cursor-grabbing ${
                            draggedItem?.primary === primaryName && draggedItem?.secondary === secondaryName && draggedItem?.index === index 
                            ? 'opacity-40 scale-95 ring-2 ring-blue-400 border-blue-400 border-dashed' 
                            : ''
                          }`}
                        >
                          <div className="aspect-[3/4] relative overflow-hidden bg-slate-100">
                            <img 
                              src={product.imageUrl} 
                              alt={product.skc}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                              referrerPolicy="no-referrer"
                            />
                            {/* Store Grade Badge */}
                            {product.stores.find(s => s.storeName === selectedStore)?.grade && (
                              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold text-slate-800 shadow-sm z-10">
                                {product.stores.find(s => s.storeName === selectedStore)?.grade} 级
                              </div>
                            )}
                            {/* New Item Badge */}
                            {newProductIds.has(product.id) && (
                              <div className="absolute top-2 right-2 bg-blue-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm z-10 animate-pulse">
                                NEW
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <div className="text-xs font-bold text-slate-900 truncate mb-1.5" title={product.skc}>
                              {product.skc}
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-start gap-1.5 text-[10px] text-slate-500">
                                <Tags size={10} className="text-slate-400 shrink-0 mt-0.5" />
                                <span className="line-clamp-2" title={product.categoryPath}>
                                  {product.categoryPath}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                <LayoutGrid size={10} className="text-slate-400 shrink-0" />
                                <span className="truncate" title={product.styleLine || product.tags.find(t => !t.includes('选品')) || '无'}>
                                  {product.styleLine || product.tags.find(t => !t.includes('选品')) || '无'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          ))}
          
          {storeProducts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
              <div className="text-slate-400 mb-2">
                <LayoutGrid size={32} className="mx-auto opacity-50" />
              </div>
              <div className="text-slate-500 font-medium">该门店暂无已选商品</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageBoard;
