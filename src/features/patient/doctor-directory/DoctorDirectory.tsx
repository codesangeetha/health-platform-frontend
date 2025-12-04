import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Doctor, DoctorFilters } from '@/types/doctor/doctor.types';
import { useDoctors } from '@/hooks/useDoctors';
import '@/styles/components/patient-dashboard.styles.css';
import './DoctorDirectory.styles.css';

export const DoctorDirectory = () => {
  const [filters, setFilters] = useState<DoctorFilters>({
    limit: 6,
    page: 1,
    specialization: '',
    searchName: '',
    availableDays: '',
  });

  const {
    doctors,
    loading,
    error,
    totalPages,
    specializations,
    refreshDoctors,
  } = useDoctors(filters);

  const handleFilterChange = (key: keyof DoctorFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }));
  };

  const getFullName = (doctor: Doctor) => {
    return `${doctor.firstName} ${doctor.lastName}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <>
      {/* Search and Filters Section */}
      <div className="search-bar">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search Doctors"
            value={filters.searchName || ''}
            onChange={(e) => handleFilterChange('searchName', e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-dropdowns">
          <select
            value={filters.specialization || ''}
            onChange={(e) => handleFilterChange('specialization', e.target.value)}
            className="filter-select"
          >
            <option value="">All Specializations</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
          
          <select
            value={filters.availableDays || ''}
            onChange={(e) => handleFilterChange('availableDays', e.target.value)}
            className="filter-select"
          >
            <option value="">All Days</option>
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
            <option value="sunday">Sunday</option>
          </select>
          
          <button
            onClick={refreshDoctors}
            className="search-button"
          >
            Search
          </button>
        </div>
      </div>

      {/* Doctors List */}
      <div className="doctors-container">
        {loading ? (
          <div className="loading-message">
            <p>Loading doctors...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={refreshDoctors} className="try-again-button">
              Try Again
            </button>
          </div>
        ) : (
          <>
            {doctors.length === 0 ? (
              <div className="no-doctors">
                <p>No doctors found matching your criteria.</p>
              </div>
            ) : (
              <div className="doctor-grid">
                {doctors.map(doctor => (
                  <div key={doctor.id} className="doctor-profile-card">
                    <div className="doctor-avatar">
                      <img
                        src={`https://ui-avatars.com/api/?name=${getFullName(doctor)}&background=4A90E2&color=fff`}
                        alt={getFullName(doctor)}
                      />
                    </div>
                    
                    <div className="doctor-info">
                      <h3 className="doctor-name">{getFullName(doctor)}</h3>
                      <p className="doctor-specialization">{doctor.specialization}</p>
                      
                      <div className="doctor-rating">
                        <span className="stars">⭐</span>
                        <span className="rating-value">{doctor.rating || 'No rating'}</span>
                      </div>
                      
                      <div className="doctor-details">
                        <p className="experience">{doctor.experience} years experience</p>
                        <p className="location">{doctor.hospital}</p>
                      </div>
                      
                      <div className="doctor-actions">
                        <Link
                          to={`/patient/doctor/${doctor.id}/book-appointment`}
                          className="book-now-button"
                        >
                          Book Now
                        </Link>
                      </div>
                      
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {doctors.length > 0 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(filters.page! - 1)}
                  disabled={filters.page === 1}
                  className="pagination-button"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`pagination-button ${filters.page === page ? 'active' : ''}`}
                    style={{
                      backgroundColor: filters.page === page ? '#007bff' : 'white',
                      color: filters.page === page ? 'white' : '#007bff',
                      border: '2px solid #007bff',
                      padding: '8px 16px',
                      fontWeight: filters.page === page ? 'bold' : 'normal',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      margin: '0 4px'
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(filters.page! + 1)}
                  disabled={filters.page === totalPages}
                  className="pagination-button"
                  style={{
                    backgroundColor: filters.page === totalPages ? '#ccc' : '#007bff',
                    color: filters.page === totalPages ? '#999' : 'white',
                    border: '2px solid #007bff',
                    padding: '8px 16px',
                    fontWeight: 'bold',
                    borderRadius: '4px',
                    cursor: filters.page === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};