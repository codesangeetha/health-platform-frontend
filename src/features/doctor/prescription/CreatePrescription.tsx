import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DoctorLayout } from '../../../components/layout/DoctorLayout';
import { PharmacyService } from '../../../services/doctor/pharmacy.service';
import { getLabTests, createLabTestOrder } from '../../../services/doctor/lab-tests.service';
import type { Medicine, PrescriptionMedicine, DeliveryAddress, PrescriptionLabTest } from '../../../types/medicine/medicine.types';
import type { LabTest, GetLabTestsParams } from '../../../types/lab-test/lab-test.types';
import '../../../styles/components/doctor-dashboard.styles.css';

// Design system constants
const DESIGN_SYSTEM = {
  colors: {
    primary: "#3B82F6",
    secondary: "#E5E7EB",
    text_dark: "#1F2937",
    text_light: "#6B7280",
    background_light: "#F9FAFB",
    border: "#E5E7EB",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    icon_medical: "#3B82F6",
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    headings: {
      h1: { fontSize: "1.5rem", fontWeight: "600", color: "#1F2937" },
      h2: { fontSize: "1.25rem", fontWeight: "600", color: "#1F2937" },
      h3: { fontSize: "1.125rem", fontWeight: "600", color: "#1F2937" },
    },
    body: { fontSize: "0.875rem", fontWeight: "400", color: "#6B7280" },
  }
};

interface AppointmentDetails {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  patientAge: number;
  date: string;
  time: string;
  isVideoCall: boolean;
  status: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export const CreatePrescription = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams<{ appointmentId: string }>();

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searching, setSearching] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<PrescriptionMedicine[]>([]);
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Lab tests state
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [selectedLabTests, setSelectedLabTests] = useState<PrescriptionLabTest[]>([]);
  const [labTestSearchQuery, setLabTestSearchQuery] = useState<string>('');
  const [labTestCategoryFilter, setLabTestCategoryFilter] = useState<string>('');
  const [minPriceFilter, setMinPriceFilter] = useState<number | undefined>(undefined);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | undefined>(undefined);
  const [labTestSearching, setLabTestSearching] = useState<boolean>(false);
  const [labTestCurrentPage, setLabTestCurrentPage] = useState<number>(1);
  const [labTestTotalPages, setLabTestTotalPages] = useState<number>(1);


  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId]);

  useEffect(() => {
    searchMedicines();
  }, [currentPage]);

  useEffect(() => {
    searchLabTests();
  }, [labTestCurrentPage]);

  // Load lab tests on component mount
  useEffect(() => {
    searchLabTests();
  }, []);

  useEffect(() => {
    // Trigger search when search query changes
    const debounceTimer = setTimeout(() => {
      if (labTestCurrentPage === 1) {
        searchLabTests();
      } else {
        setLabTestCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [labTestSearchQuery]);

  const fetchAppointmentDetails = async () => {
    if (!appointmentId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await PharmacyService.getAppointmentDetails(appointmentId);

      if (response.success && response.data) {
        setAppointment(response.data);
      } else {
        throw new Error('Failed to fetch appointment details');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch appointment details');
      // Set a fallback appointment structure
      setAppointment({
        appointmentId: appointmentId,
        patientId: '',
        doctorId: '',
        patientName: '',
        doctorName: '',
        patientAge: 0,
        date: '',
        time: '',
        isVideoCall: false,
        status: 'pending',
        reason: '',
        createdAt: '',
        updatedAt: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const searchMedicines = async (query?: string) => {
    try {
      setSearching(true);
      const response = await PharmacyService.searchMedicines(
        query || searchQuery,
        currentPage,
        10
      );

      if (response.success && response.data) {
        setMedicines(response.data.medicines);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search medicines');
    } finally {
      setSearching(false);
    }
  };

  const addMedicineToPrescription = (medicine: Medicine) => {
    const newPrescriptionMedicine: PrescriptionMedicine = {
      medicineId: medicine.id,
      dosage: '',
      timing: [],
      duration: 1,
      mealTime: 'before meal'
    };
    setSelectedMedicines(prev => [...prev, newPrescriptionMedicine]);
  };

  const removeMedicineFromPrescription = (index: number) => {
    setSelectedMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const updatePrescriptionMedicine = (index: number, field: keyof PrescriptionMedicine, value: any) => {
    setSelectedMedicines(prev => prev.map((med, i) =>
      i === index ? { ...med, [field]: value } : med
    ));
  };

  const searchLabTests = async (query?: string) => {
    try {
      setLabTestSearching(true);
      const params: GetLabTestsParams = {
        page: labTestCurrentPage,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
        isActive: true
      };

      // Remove price filter logic since we're removing price filters
      if (labTestCategoryFilter) {
        params.categoryId = labTestCategoryFilter;
      }

      const response = await getLabTests(params);

      if (response.success && response.data) {
        let filteredTests = response.data.tests;

        // Client-side filtering for search query if needed
        if (query || labTestSearchQuery) {
          const searchTerm = (query || labTestSearchQuery).toLowerCase();
          filteredTests = filteredTests.filter(test =>
            test.name.toLowerCase().includes(searchTerm) ||
            test.description.toLowerCase().includes(searchTerm)
          );
        }

        setLabTests(filteredTests);
        setLabTestTotalPages(response.data.pagination.totalPages);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search lab tests');
    } finally {
      setLabTestSearching(false);
    }
  };

  const addLabTestToPrescription = (labTest: LabTest) => {
    console.log('Adding lab test to prescription:', labTest);
    const newPrescriptionLabTest: PrescriptionLabTest = {
      testId: labTest.testId,
      name: labTest.name,
      price: labTest.price,
      categoryId: labTest.categoryId
    };
    setSelectedLabTests(prev => {
      // Check if test is already selected
      const isAlreadySelected = prev.some(test => test.testId === labTest.testId);
      if (isAlreadySelected) {
        return prev; // Don't add duplicate
      }
      return [...prev, newPrescriptionLabTest];
    });
  };

  const removeLabTestFromPrescription = (index: number) => {
    setSelectedLabTests(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!appointmentId || !diagnosis.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (selectedMedicines.length === 0 && selectedLabTests.length === 0) {
      setError('Please add at least one medicine or lab test to the prescription');
      return;
    }

    // Validate medicines
    for (const medicine of selectedMedicines) {
      if (!medicine.dosage.trim() || medicine.timing.length === 0) {
        setError('Please fill in dosage and timing for all medicines');
        return;
      }
    }


    try {
      setSubmitting(true);
      setError(null);

      // 1. Create prescription first
      const prescriptionData = {
        appointmentId,
        patientId: appointment?.patientId || '',
        diagnosis: diagnosis.trim(),
        notes: notes.trim(),
        medicines: selectedMedicines,
        labTests: selectedLabTests
      };

      const prescriptionResponse = await PharmacyService.createPrescription(prescriptionData);

      if (!prescriptionResponse.success) {
        throw new Error(`Failed to create prescription: ${prescriptionResponse.message || 'Unknown error'}`);
      }

      if (!prescriptionResponse.data || !prescriptionResponse.data._id) {
        throw new Error('Prescription created but no ID returned');
      }

      // 2. Create lab test order if there are selected lab tests
      if (selectedLabTests.length > 0) {
        const labTestOrderData = {
          testItems: selectedLabTests.map(test => ({
            testId: test.testId
          })),
          deliveryAddress: {
            street: "123 Main Street",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA"
          },
          collectionMethod: "lab_visit",
          scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          prescriptionId: prescriptionResponse.data._id
        };

        const labTestOrderResponse = await createLabTestOrder(labTestOrderData);

        if (!labTestOrderResponse.success) {
          throw new Error('Failed to create lab test order');
        }
      }

      // 3. Create pharmacy order
      const orderItems = selectedMedicines.map(med => ({
        medicineId: med.medicineId,
        quantity: med.duration // Using duration as quantity for now
      }));

      const orderData = {
        prescriptionId: prescriptionResponse.data._id,
        items: orderItems,
        deliveryAddress: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA"
        },
        deliveryMethod: "standard" as const
      };

      const orderResponse = await PharmacyService.createPharmacyOrder(orderData);

      if (!orderResponse.success) {
        throw new Error('Failed to create pharmacy order');
      }

      // 4. Update appointment status to completed
      await PharmacyService.updateAppointmentStatus(appointmentId, {
        status: 'completed',
        reason: 'completed'
      });

      // Navigate back to appointments with success message
      const successMessage = selectedLabTests.length > 0
        ? 'Prescription created, medicines and lab tests ordered successfully'
        : 'Prescription created and medicines ordered successfully';

      navigate('/doctor/appointments', {
        state: { message: successMessage }
      });

    } catch (err: any) {
      setError(err.message || 'Failed to complete prescription process');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DoctorLayout pageTitle="Create Prescription" pageSubtitle="Loading appointment details...">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading appointment details...</p>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout
      pageTitle="Create Prescription"
      pageSubtitle={appointment?.patientName ? `For ${appointment.patientName}` : 'Loading patient details...'}
    >
      <div style={{
        backgroundColor: DESIGN_SYSTEM.colors.background_light,
        minHeight: '100vh',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {error && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: `1px solid #FECACA`,
              color: '#991B1B',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Appointment Details */}
            <div className="dd-card" style={{ marginBottom: '2rem' }}>
              <div className="card-header">
                <h3>Appointment Details</h3>
              </div>
              <div style={{ padding: 'var(--ds-space-l)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Patient Name
                    </label>
                    <p style={{ color: DESIGN_SYSTEM.colors.text_light }}>
                      {appointment?.patientName || 'Loading...'}
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Age
                    </label>
                    <p style={{ color: DESIGN_SYSTEM.colors.text_light }}>
                      {appointment?.patientAge ? `${appointment.patientAge} years` : 'Loading...'}
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Chief Complaint
                    </label>
                    <p style={{ color: DESIGN_SYSTEM.colors.text_light }}>
                      {appointment?.reason || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Medicine Search Section */}
            <div className="dd-card" style={{ marginBottom: '2rem' }}>
              <div className="card-header">
                <h3>Add Medicines to Prescription</h3>
              </div>
              <div style={{ padding: 'var(--ds-space-l)' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input
                      type="text"
                      placeholder="Search medicines..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => searchMedicines()}
                      disabled={searching}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: DESIGN_SYSTEM.colors.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: searching ? 'not-allowed' : 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {searching ? 'Searching...' : 'Search'}
                    </button>
                  </div>

                  <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
                    {medicines.map(medicine => (
                      <div
                        key={medicine.id}
                        style={{
                          padding: '1rem',
                          border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                          borderRadius: '0.5rem',
                          marginBottom: '0.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => addMedicineToPrescription(medicine)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.colors.background_light;
                          e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.border;
                        }}
                      >
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                          {medicine.name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: DESIGN_SYSTEM.colors.text_light, marginBottom: '0.25rem' }}>
                          {medicine.genericName}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: DESIGN_SYSTEM.colors.text_light }}>
                          ₹{medicine.price} • Stock: {medicine.stock}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        style={{
                          padding: '0.5rem',
                          border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                          backgroundColor: currentPage === 1 ? '#F9FAFB' : 'white',
                          borderRadius: '0.25rem',
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Previous
                      </button>
                      <span style={{ padding: '0.5rem', alignSelf: 'center' }}>
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: '0.5rem',
                          border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                          backgroundColor: currentPage === totalPages ? '#F9FAFB' : 'white',
                          borderRadius: '0.25rem',
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Prescription Form */}
            <div className="dd-card" style={{ marginBottom: '2rem' }}>
              <div className="card-header">
                <h3>Prescription Details</h3>
              </div>
              <div style={{ padding: 'var(--ds-space-l)' }}>
                {/* Selected Medicines */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Prescribed Medicines ({selectedMedicines.length})
                  </label>
                  {selectedMedicines.length === 0 ? (
                    <p style={{ color: DESIGN_SYSTEM.colors.text_light, fontStyle: 'italic' }}>
                      No medicines added yet. Search and click on medicines above to add them.
                    </p>
                  ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {selectedMedicines.map((med, index) => {
                        // Find the medicine details to show the name
                        const medicineDetails = medicines.find(m => m.id === med.medicineId);
                        return (
                          <div key={index} style={{
                            padding: '1rem',
                            border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                            borderRadius: '0.5rem',
                            marginBottom: '0.5rem',
                            backgroundColor: '#F8FAFC'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                              {/* Medicine Info */}
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600', color: DESIGN_SYSTEM.colors.primary, marginBottom: '0.25rem' }}>
                                  {medicineDetails?.name || `Medicine ${index + 1}`}
                                  {medicineDetails && (
                                    <span style={{ fontSize: '0.875rem', color: DESIGN_SYSTEM.colors.text_light, fontWeight: '400' }}>
                                      {' • '}{medicineDetails.genericName}
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: DESIGN_SYSTEM.colors.text_light }}>
                                  {med.dosage && med.duration && med.timing.length > 0 ? (
                                    <>
                                      <span style={{ fontWeight: '500' }}>{med.dosage}</span>
                                      {' • '}
                                      <span>{med.duration} days</span>
                                      {' • '}
                                      <span>{med.timing.join(', ')}</span>
                                      {' • '}
                                      <span>{med.mealTime}</span>
                                    </>
                                  ) : (
                                    'Please fill in dosage, duration, timing and meal time'
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => removeMedicineFromPrescription(index)}
                                  style={{
                                    color: DESIGN_SYSTEM.colors.error,
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    padding: '0.25rem'
                                  }}
                                  title="Remove medicine"
                                >
                                  ×
                                </button>
                              </div>
                            </div>

                            {/* Compact Input Fields */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
                              <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: '500' }}>
                                  Dosage *
                                </label>
                                <input
                                  type="text"
                                  value={med.dosage}
                                  onChange={(e) => updatePrescriptionMedicine(index, 'dosage', e.target.value)}
                                  placeholder="e.g., 500mg"
                                  required
                                  style={{
                                    width: '100%',
                                    padding: '0.4rem',
                                    border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                                    borderRadius: '0.25rem',
                                    fontSize: '0.875rem'
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: '500' }}>
                                  Days *
                                </label>
                                <input
                                  type="number"
                                  value={med.duration}
                                  onChange={(e) => updatePrescriptionMedicine(index, 'duration', parseInt(e.target.value))}
                                  min="1"
                                  required
                                  style={{
                                    width: '100%',
                                    padding: '0.4rem',
                                    border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                                    borderRadius: '0.25rem',
                                    fontSize: '0.875rem'
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: '500' }}>
                                  Timing *
                                </label>
                                <select
                                  multiple
                                  value={med.timing}
                                  onChange={(e) => {
                                    const values = Array.from(e.target.selectedOptions, option => option.value);
                                    updatePrescriptionMedicine(index, 'timing', values);
                                  }}
                                  required
                                  style={{
                                    width: '100%',
                                    padding: '0.4rem',
                                    border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                                    borderRadius: '0.25rem',
                                    fontSize: '0.875rem',
                                    minHeight: '32px'
                                  }}
                                >
                                  <option value="morning">Morning</option>
                                  <option value="afternoon">Afternoon</option>
                                  <option value="evening">Evening</option>
                                  <option value="night">Night</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: '500' }}>
                                  Meal Time
                                </label>
                                <select
                                  value={med.mealTime}
                                  onChange={(e) => updatePrescriptionMedicine(index, 'mealTime', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '0.4rem',
                                    border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                                    borderRadius: '0.25rem',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  <option value="before meal">Before</option>
                                  <option value="after meal">After</option>
                                  <option value="with meal">With</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Tests Required Section */}
                <div className="dd-card" style={{ marginBottom: '2rem' }}>
                  <div className="card-header">
                    <h3>Add Tests Required</h3>
                  </div>
                  <div style={{ padding: 'var(--ds-space-l)' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                          type="text"
                          placeholder="Search lab tests..."
                          value={labTestSearchQuery}
                          onChange={(e) => setLabTestSearchQuery(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => searchLabTests()}
                          disabled={labTestSearching}
                          style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: DESIGN_SYSTEM.colors.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: labTestSearching ? 'not-allowed' : 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          {labTestSearching ? 'Searching...' : 'Search'}
                        </button>
                      </div>

                      <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
                        {labTests.map(labTest => {
                          const isSelected = selectedLabTests.some(test => test.testId === labTest.testId);
                          return (
                            <div
                              key={labTest.testId}
                              style={{
                                padding: '1rem',
                                border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                                borderRadius: '0.5rem',
                                marginBottom: '0.5rem',
                                cursor: isSelected ? 'default' : 'pointer',
                                transition: 'all 0.2s ease',
                                backgroundColor: isSelected ? '#F0FDF4' : 'white'
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!isSelected) {
                                  addLabTestToPrescription(labTest);
                                }
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                                  e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.primary;
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.backgroundColor = 'white';
                                  e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.border;
                                }
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                    {labTest.name}
                                    {isSelected && <span style={{ color: DESIGN_SYSTEM.colors.success, marginLeft: '0.5rem' }}>✓ Selected</span>}
                                  </div>
                                  <div style={{ fontSize: '0.875rem', color: DESIGN_SYSTEM.colors.text_light, marginBottom: '0.25rem' }}>
                                    {labTest.description}
                                  </div>
                                  <div style={{ fontSize: '0.875rem', color: DESIGN_SYSTEM.colors.text_light }}>
                                    ₹{labTest.price} • Category: {labTest.categoryId}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Lab Tests Pagination */}
                      {labTestTotalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setLabTestCurrentPage(prev => Math.max(1, prev - 1));
                              searchLabTests();
                            }}
                            disabled={labTestCurrentPage === 1}
                            style={{
                              padding: '0.5rem',
                              border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                              backgroundColor: labTestCurrentPage === 1 ? '#F9FAFB' : 'white',
                              borderRadius: '0.25rem',
                              cursor: labTestCurrentPage === 1 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Previous
                          </button>
                          <span style={{ padding: '0.5rem', alignSelf: 'center' }}>
                            Page {labTestCurrentPage} of {labTestTotalPages}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setLabTestCurrentPage(prev => Math.min(labTestTotalPages, prev + 1));
                              searchLabTests();
                            }}
                            disabled={labTestCurrentPage === labTestTotalPages}
                            style={{
                              padding: '0.5rem',
                              border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                              backgroundColor: labTestCurrentPage === labTestTotalPages ? '#F9FAFB' : 'white',
                              borderRadius: '0.25rem',
                              cursor: labTestCurrentPage === labTestTotalPages ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Selected Lab Tests */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Selected Tests ({selectedLabTests.length})
                      </label>
                      {selectedLabTests.length === 0 ? (
                        <p style={{ color: DESIGN_SYSTEM.colors.text_light, fontStyle: 'italic' }}>
                          No lab tests added yet. Search and click on lab tests above to add them.
                        </p>
                      ) : (
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {selectedLabTests.map((labTest, index) => (
                            <div key={labTest.testId || index} style={{
                              padding: '0.75rem',
                              border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                              borderRadius: '0.5rem',
                              marginBottom: '0.5rem',
                              backgroundColor: '#F8FAFC'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: '600', color: DESIGN_SYSTEM.colors.primary }}>
                                    {labTest.name}
                                  </div>
                                  <div style={{ fontSize: '0.875rem', color: DESIGN_SYSTEM.colors.text_light, marginBottom: '0.25rem' }}>
                                    {labTest.categoryId}
                                  </div>
                                  <div style={{ fontSize: '0.875rem', color: DESIGN_SYSTEM.colors.text_light }}>
                                    ₹{labTest.price}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeLabTestFromPrescription(index)}
                                  style={{
                                    color: DESIGN_SYSTEM.colors.error,
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    padding: '0.25rem'
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Diagnosis and Notes Section */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Diagnosis *
                  </label>
                  <textarea
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Enter diagnosis..."
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                      borderRadius: '0.5rem',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                      borderRadius: '0.5rem',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || (selectedMedicines.length === 0 && selectedLabTests.length === 0)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: submitting || (selectedMedicines.length === 0 && selectedLabTests.length === 0) ? DESIGN_SYSTEM.colors.secondary : DESIGN_SYSTEM.colors.success,
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: submitting || (selectedMedicines.length === 0 && selectedLabTests.length === 0) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Creating Prescription...' : 'Create Prescription'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DoctorLayout>
  );
};