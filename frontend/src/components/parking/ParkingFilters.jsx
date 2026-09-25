import React from 'react';
import SearchBar from '../common/SearchBar';
import FilterBar from '../common/FilterBar';

const ParkingFilters = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <FilterBar>
      <div className="filter-group">
        <label>Block</label>
        <select name="block" value={filters.block} onChange={handleChange}>
          <option value="All">All</option>
          <option value="Block A">Block A</option>
          <option value="Block B">Block B</option>
          <option value="Block C">Block C</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Floor</label>
        <select name="floor" value={filters.floor} onChange={handleChange}>
          <option value="All">All</option>
          <option value="Ground Floor">Ground Floor</option>
          <option value="Basement">Basement</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Status</label>
        <select name="status" value={filters.status} onChange={handleChange}>
          <option value="All">All</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="assigned">Assigned</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Type</label>
        <select name="type" value={filters.type} onChange={handleChange}>
          <option value="All">All</option>
          <option value="standard">Standard</option>
          <option value="compact">Compact</option>
          <option value="large">Large</option>
          <option value="accessible">Accessible</option>
          <option value="visitor">Visitor</option>
        </select>
      </div>

      <SearchBar 
        value={filters.search} 
        onChange={handleChange} 
        placeholder="Search spot number..."
      />
    </FilterBar>
  );
};

export default ParkingFilters;
