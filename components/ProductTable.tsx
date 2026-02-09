import React from 'react';
import { Product } from '../types';

interface ProductTableProps {
  products: Product[];
  onDecision?: (product: Product) => void;
}

const GradeBadge: React.FC<{ grade: string }> = ({ grade }) => {
  const colors: Record<string, string> = {
    S: 'bg-red-500',
    A: 'bg-orange-500',
    B: 'bg-blue-500',
    C: 'bg-gray-500',
    D: 'bg-gray-400',
  };
  return (
    <span className={`${colors[grade] || 'bg-gray-400'} text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold mr-2 flex-shrink-0`}>
      {grade}
    </span>
  );
};

const ProductTable: React.FC<ProductTableProps> = ({ products, onDecision }) => {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-700 font-medium text-xs border-b border-gray-200">
            <th className="p-3 w-10 text-center"><input type="checkbox" /></th>
            {onDecision && <th className="p-3 w-24">操作</th>}
            <th className="p-3 w-48">基本信息</th>
            <th className="p-3 w-20">SKC主图</th>
            <th className="p-3 w-48">产品信息</th>
            <th className="p-3 w-40">预估等级</th>
            <th className="p-3 w-48">打版信息</th>
            <th className="p-3 w-32">产品标签</th>
            <th className="p-3 w-24">选品状态</th>
            <th className="p-3 w-24">选品操作人</th>
            <th className="p-3 w-32">时间</th>
          </tr>
        </thead>
        <tbody className="text-xs text-gray-600 divide-y divide-gray-100">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-blue-50 transition-colors">
              <td className="p-3 text-center align-top">
                <input type="checkbox" className="mt-1" />
              </td>
              {onDecision && (
                <td className="p-3 align-top">
                  <button 
                    onClick={() => onDecision(product)}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    选品决策
                  </button>
                </td>
              )}
              <td className="p-3 align-top">
                <div className="flex flex-col space-y-1">
                  <div className="flex space-x-1">
                    <span className="text-gray-400">选品ID:</span>
                    <span className="text-blue-600 hover:underline cursor-pointer">{product.id}</span>
                  </div>
                  <div className="flex space-x-1">
                    <span className="text-gray-400">SPU:</span>
                    <span className="text-blue-600 hover:underline cursor-pointer truncate max-w-[120px]" title={product.spu}>{product.spu}</span>
                  </div>
                  <div className="flex space-x-1">
                    <span className="text-gray-400">SKC:</span>
                    <span className="text-blue-600 hover:underline cursor-pointer truncate max-w-[120px]" title={product.skc}>{product.skc}</span>
                  </div>
                  <div className="flex space-x-1">
                    <span className="text-gray-400">DROP:</span>
                    <span className="text-blue-600 hover:underline cursor-pointer">{product.drop}</span>
                  </div>
                  <div className="text-gray-500 mt-1">计划上新日期: <span className="text-gray-800">{product.planDate}</span></div>
                </div>
              </td>
              <td className="p-3 align-top">
                <img 
                    src={product.imageUrl} 
                    alt="SKC" 
                    className="w-16 h-16 object-cover rounded border border-gray-200" 
                 />
              </td>
              <td className="p-3 align-top">
                <div className="space-y-2">
                  <div className="text-gray-800 font-medium">{product.categoryPath}</div>
                  <div>
                    <span className="text-gray-400 mr-1">预估售价:</span>
                    <span className="font-bold text-gray-900">${product.price.toFixed(1)}</span>
                  </div>
                   <div>
                    <span className="text-gray-400 mr-1">产品线:</span>
                    <span className="text-gray-800 bg-gray-100 px-1 rounded">{product.productLine}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 mr-1">企划开发员:</span>
                    <span className="text-purple-600 font-medium">{product.planningDeveloper}</span>
                  </div>
                </div>
              </td>
              <td className="p-3 align-top">
                {product.selectionStatus === 'Pending' ? (
                  <span className="text-gray-400 italic">待评级</span>
                ) : (
                  <div className="space-y-2">
                    {product.stores.map((store, idx) => (
                      <div key={idx} className="flex items-center">
                        <GradeBadge grade={store.grade} />
                        <div className="flex flex-col">
                          <span className="text-gray-800">{store.storeName}</span>
                          {store.inventoryDepth && (
                            <span className="text-[10px] text-gray-400">库存深度: {store.inventoryDepth}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </td>
              <td className="p-3 align-top">
                <div className="space-y-1">
                  <div>
                    <span className="text-gray-400 mr-1">开发单号:</span>
                    <span className="text-blue-600">{product.devUnitId}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 mr-1">开发状态:</span>
                    <span>{product.devStatus}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 mr-1">开款渠道:</span>
                    <span className="font-medium">{product.channel}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 mr-1">设计师:</span>
                    <span>{product.designer}</span>
                  </div>
                </div>
              </td>
              <td className="p-3 align-top">
                <div className="flex flex-col gap-1">
                  {product.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className={`px-2 py-0.5 rounded text-[10px] inline-block w-fit
                        ${tag.includes('选品') ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-white text-gray-500 border border-gray-200'}
                      `}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-3 align-top">
                 <span className={`inline-block px-2 py-0.5 rounded text-[10px] border
                    ${product.selectionStatus === 'Selected' ? 'bg-green-100 text-green-700 border-green-200' : 
                      product.selectionStatus === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }
                 `}>
                    {product.selectionStatus === 'Selected' ? '已选品' : 
                     product.selectionStatus === 'Rejected' ? '已取消' : '待选品'}
                 </span>
              </td>
              <td className="p-3 align-top">
                <span className="text-gray-800">{product.operator}</span>
              </td>
              <td className="p-3 align-top">
                <div className="text-gray-400 space-y-1">
                  <div>
                    <div className="scale-90 origin-top-left">创建时间:</div>
                    <div className="text-gray-600">{product.createdTime}</div>
                  </div>
                  <div>
                    <div className="scale-90 origin-top-left">选品时间:</div>
                    <div className="text-gray-600">{product.selectionTime}</div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && (
        <div className="p-8 text-center text-gray-500">暂无数据</div>
      )}
    </div>
  );
};

export default ProductTable;