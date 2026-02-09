export interface Product {
  id: string;
  spu: string;
  skc: string;
  drop: string;
  planDate: string;
  imageUrl: string;
  categoryPath: string;
  price: number;
  productLine: string; // New Field
  stores: StoreGrade[];
  devUnitId: string;
  devStatus: string;
  channel: string;
  designer: string;
  planningDeveloper: string; // New Field
  tags: string[];
  selectionStatus: 'Selected' | 'Rejected' | 'Pending';
  operator: string;
  createdTime: string;
  selectionTime: string;
}

export interface StoreGrade {
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  storeName: string;
  inventoryDepth?: string;
}

export interface FilterState {
  searchType: string;
  searchValue: string;
  category: string;
  status: string;
  devUnit: string;
  productLine: string; // New Filter
  planningDeveloper: string; // New Filter
}