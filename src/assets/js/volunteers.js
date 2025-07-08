function VolunteerForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Convert form data to object
    const formValues = Object.fromEntries(formData.entries());
    
    // Handle checkbox groups
    formValues.experience = Array.from(form.querySelectorAll('input[name="experience"]:checked')).map(el => el.value);
    formValues.certifications = Array.from(form.querySelectorAll('input[name="certifications"]:checked')).map(el => el.value);

    try {
      const response = await fetch('/.netlify/functions/volunteers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setSubmitted(true);
      form.reset();
    } catch (err) {
      setError('There was an error submitting your form. Please try again.');
      console.error('Error:', err);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {submitted ? (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-check-circle text-green-400"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Thank you for volunteering!</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your information has been saved. We'll contact you soon with more details.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form 
          id="volunteerForm" 
          className="bg-white shadow-md rounded-lg p-8" 
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" id="fullName" name="fullName" required 
                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" id="email" name="email" required 
                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="tel" id="phone" name="phone" required 
                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Primary Location (County)</label>
                  <select id="location" name="location" required 
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select your county</option>
                    <option value="Mombasa">Mombasa</option>
                    <option value="Kwale">Kwale</option>
                    {/* Other counties... */}
                    <option value="Nairobi">Nairobi</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Volunteer Role */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Volunteer Role</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service Type</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <input id="medic" name="serviceType" type="radio" value="medic" className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"/>
                      <label htmlFor="medic" className="ml-3 block text-sm font-medium text-gray-700">Medical Professional</label>
                    </div>
                    <div className="flex items-center">
                      <input id="legal" name="serviceType" type="radio" value="legal" className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"/>
                      <label htmlFor="legal" className="ml-3 block text-sm font-medium text-gray-700">Legal Expert</label>
                    </div>
                    <div className="flex items-center">
                      <input id="logistics" name="serviceType" type="radio" value="logistics" className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"/>
                      <label htmlFor="logistics" className="ml-3 block text-sm font-medium text-gray-700">Logistics/Driver</label>
                    </div>
                    <div className="flex items-center">
                      <input id="other" name="serviceType" type="radio" value="other" className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"/>
                      <label htmlFor="other" className="ml-3 block text-sm font-medium text-gray-700">Other Support</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Emergency Contacts</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="emergencyContact1" className="block text-sm font-medium text-gray-700">Primary Emergency Contact</label>
                  <input type="text" id="emergencyContact1" name="emergencyContact1" required 
                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                  <label htmlFor="emergencyContact2" className="block text-sm font-medium text-gray-700">Secondary Emergency Contact</label>
                  <input type="text" id="emergencyContact2" name="emergencyContact2" 
                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                  <label htmlFor="availability" className="block text-sm font-medium text-gray-700">Availability</label>
                  <select id="availability" name="availability" required 
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select availability</option>
                    <option value="full-time">Full-time during protests</option>
                    <option value="part-time">Part-time (specific hours)</option>
                    <option value="on-call">On-call basis</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relevant Experience</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input id="exp-medical" name="experience" type="checkbox" value="medical" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                      <label htmlFor="exp-medical" className="ml-3 block text-sm text-gray-700">Medical/First Aid</label>
                    </div>
                    <div className="flex items-center">
                      <input id="exp-legal" name="experience" type="checkbox" value="legal" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                      <label htmlFor="exp-legal" className="ml-3 block text-sm text-gray-700">Legal Assistance</label>
                    </div>
                    <div className="flex items-center">
                      <input id="exp-counseling" name="experience" type="checkbox" value="counseling" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                      <label htmlFor="exp-counseling" className="ml-3 block text-sm text-gray-700">Counseling</label>
                    </div>
                    <div className="flex items-center">
                      <input id="exp-logistics" name="experience" type="checkbox" value="logistics" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                      <label htmlFor="exp-logistics" className="ml-3 block text-sm text-gray-700">Logistics/Transport</label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Training/Certifications</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input id="cert-firstaid" name="certifications" type="checkbox" value="firstaid" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                      <label htmlFor="cert-firstaid" className="ml-3 block text-sm text-gray-700">First Aid Certified</label>
                    </div>
                    <div className="flex items-center">
                      <input id="cert-legal" name="certifications" type="checkbox" value="legal" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                      <label htmlFor="cert-legal" className="ml-3 block text-sm text-gray-700">Legal Training</label>
                    </div>
                    <div className="flex items-center">
                      <input id="cert-crisis" name="certifications" type="checkbox" value="crisis" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                      <label htmlFor="cert-crisis" className="ml-3 block text-sm text-gray-700">Crisis Management</label>
                    </div>
                    <div className="flex items-center">
                      <input id="cert-none" name="certifications" type="checkbox" value="none" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                      <label htmlFor="cert-none" className="ml-3 block text-sm text-gray-700">None</label>
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input id="consent" name="consent" type="checkbox" required 
                           className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="consent" className="font-medium text-gray-700">I consent to my information being stored and used for protest emergency response purposes</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Submit Volunteer Application
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// Render the form
document.addEventListener('DOMContentLoaded', () => {
  const formContainer = document.getElementById('volunteerFormContainer');
  if (formContainer) {
    ReactDOM.render(<VolunteerForm />, formContainer);
  }
});