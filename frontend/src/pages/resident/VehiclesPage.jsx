import React, { useState, useEffect } from 'react';
import vehicleService from '../../services/vehicleService';
import VehicleCard from '../../components/vehicles/VehicleCard';
import VehicleForm from '../../components/vehicles/VehicleForm';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getMyVehicles();
      setVehicles(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load vehicles.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setFormLoading(true);
      setFormError(null);
      
      if (editingVehicle) {
        await vehicleService.updateVehicle(editingVehicle._id, formData);
      } else {
        await vehicleService.createVehicle(formData);
      }
      
      setShowForm(false);
      setEditingVehicle(null);
      fetchVehicles();
    } catch (err) {
      setFormError(err.response?.data?.error || err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
    setFormError(null);
  };

  const handleDeactivate = async (vehicle) => {
    if (!window.confirm(`Are you sure you want to deactivate ${vehicle.registrationNumber}?`)) return;
    
    try {
      await vehicleService.deleteVehicle(vehicle._id);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to deactivate vehicle');
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      await vehicleService.setPrimaryVehicle(id);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to set primary vehicle');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingVehicle(null);
    setFormError(null);
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>My Vehicles</h1>
          <p>Manage the vehicles associated with your ParkNexus account.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Add Vehicle
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ marginBottom: '2rem' }}>
          <VehicleForm 
            onSubmit={handleSubmit} 
            onCancel={handleCancelForm}
            initialData={editingVehicle}
            loading={formLoading}
            error={formError}
          />
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading vehicles...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : vehicles.length === 0 && !showForm ? (
        <div className="empty-state glass-panel" style={{ textAlign: "center", padding: "3rem" }}>
          <h3>No vehicles added yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Add your vehicle to make parking reservations easier to manage.</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Add Vehicle
          </button>
        </div>
      ) : (
        <div className="vehicles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {vehicles.map(vehicle => (
            <VehicleCard 
              key={vehicle._id} 
              vehicle={vehicle} 
              onEdit={handleEdit}
              onSetPrimary={handleSetPrimary}
              onDeactivate={handleDeactivate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VehiclesPage;
