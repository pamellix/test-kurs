import { useState, useMemo } from 'react';

interface UseTableStateProps {
  data: Record<string, unknown>[];
  searchFields: string[];
  defaultSort?: string;
  defaultItemsPerPage?: number;
}

interface UseTableStateReturn {
  paginatedData: Record<string, unknown>[];
  
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  sortBy: string;
  setSortBy: (sort: string) => void;
  
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
  totalPages: number;
  totalItems: number;
  filteredItems: number;
}

export function useTableState({
  data,
  searchFields,
  defaultSort = '',
  defaultItemsPerPage = 10,
}: UseTableStateProps): UseTableStateReturn {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState(defaultSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (value == null) return false;
        
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).some((nestedValue) =>
            String(nestedValue).toLowerCase().includes(lowercaseSearch)
          );
        }
        
        return String(value).toLowerCase().includes(lowercaseSearch);
      })
    );
  }, [data, searchTerm, searchFields]);

  const sortedData = useMemo(() => {
    if (!sortBy) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const [field, direction = 'asc'] = sortBy.split(':');
      
      const aValue = a[field];
      const bValue = b[field];
      
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'desc' ? bValue - aValue : aValue - bValue;
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return direction === 'desc' 
          ? bValue.getTime() - aValue.getTime()
          : aValue.getTime() - bValue.getTime();
      }
      
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (direction === 'desc') {
        return bStr.localeCompare(aStr);
      }
      return aStr.localeCompare(bStr);
    });
  }, [filteredData, sortBy]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return {
    paginatedData,
    searchTerm,
    setSearchTerm: handleSearchChange,
    sortBy,
    setSortBy: handleSortChange,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage: handleItemsPerPageChange,
    totalPages,
    totalItems: data.length,
    filteredItems: sortedData.length,
  };
} 