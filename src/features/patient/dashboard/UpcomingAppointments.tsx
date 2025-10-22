export const UpcomingAppointments = () => {
  return (
    <div className="dashboard-card">
      <h2>Upcoming Appointments</h2>
      <div className="appointments-list">
        <div className="appointment-item">
          <div className="appointment-date">Sept 5, 2025</div>
          <div className="appointment-details">
            <h3>Dr. Smith</h3>
            <p>General Checkup - 10:00 AM</p>
          </div>
        </div>
        <div className="appointment-item">
          <div className="appointment-date">Sept 12, 2025</div>
          <div className="appointment-details">
            <h3>Dr. Johnson</h3>
            <p>Follow-up - 2:30 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
};
