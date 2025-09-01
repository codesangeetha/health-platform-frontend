export const HealthSummary = () => {
  return (
    <div className="dashboard-card">
      <h2>Health Summary</h2>
      <div className="health-stats">
        <div className="stat-item">
          <span className="stat-label">Last Visit</span>
          <span className="stat-value">Aug 25, 2025</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Upcoming Appointments</span>
          <span className="stat-value">2</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Prescriptions</span>
          <span className="stat-value">Active: 3</span>
        </div>
      </div>
    </div>
  );
};
