import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DoctorService } from '@/services/doctor/doctor.service';
import type { Doctor, DoctorFilters } from '@/types/doctor/doctor.types';
import '@/styles/components/patient-dashboard.styles.css';
import './DoctorDirectory.styles.css';

export const DoctorDirectory = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [filters, setFilters] = useState<DoctorFilters>({
    limit: 5,
    page: 1,
    specialization: '',
    searchName: '',
    availableDays: '',
  });
  const [specializations, setSpecializations] = useState<string[]>([]);

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await DoctorService.getDoctors(filters);
      setDoctors(response.data.doctors);
      setTotalPages(response.data.pagination.totalPages);
      
      // Extract unique specializations for filter dropdown
      const uniqueSpecializations = Array.from(
        new Set(response.data.doctors.map(doctor => doctor.specialization))
      );
      setSpecializations(uniqueSpecializations);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

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
            onClick={fetchDoctors}
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
            <button onClick={fetchDoctors} className="try-again-button">
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
                <span className="page-number">{filters.page}</span>
                {filters.page! < totalPages && (
                  <button
                    onClick={() => handlePageChange(filters.page! + 1)}
                    disabled={doctors.length < (filters.limit || 5)}
                    className="pagination-button"
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: '2px solid #007bff',
                      padding: '12px 24px',
                      fontWeight: 'bold',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Next
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};