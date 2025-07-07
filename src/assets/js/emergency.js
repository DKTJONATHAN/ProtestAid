document.addEventListener('DOMContentLoaded', function() {
    const emergencyForm = document.getElementById('emergencyForm');
    const getLocationBtn = document.getElementById('getLocation');
    const callButtons = document.querySelectorAll('[class*="bg-"] button'); // All colored call buttons

    // Get user's current location
    getLocationBtn.addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const locationInput = document.getElementById('location');
                    locationInput.value = `${position.coords.latitude}, ${position.coords.longitude}`;
                },
                function(error) {
                    console.error("Error getting location:", error);
                    alert("Could not get your location. Please enter it manually.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    });

    // Handle call buttons
    callButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const serviceType = this.closest('div').querySelector('h3').textContent.trim();
            initiateEmergencyCall(serviceType);
        });
    });

    // Form submission
    emergencyForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(emergencyForm);
        const emergencyData = {
            type: formData.get('emergencyType'),
            location: formData.get('location'),
            details: formData.get('details'),
            shareContact: formData.get('shareContact') === 'on',
            timestamp: new Date().toISOString()
        };

        try {
            // Find nearest volunteers
            const volunteers = await getNearestVolunteers(emergencyData.location, emergencyData.type);
            
            if (volunteers.length > 0) {
                // Connect to first available volunteer
                const primaryVolunteer = volunteers[0];
                alert(`Connecting you to ${primaryVolunteer.fullName}, ${primaryVolunteer.serviceType} volunteer. Phone: ${primaryVolunteer.phone}`);
                
                // In a real app, we would initiate a call or connection here
                // window.location.href = `tel:${primaryVolunteer.phone}`;
            } else {
                alert('No volunteers available in your area. Please try the emergency contacts or call 999.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('There was an error processing your request. Please try the emergency contacts.');
        }
    });

    async function getNearestVolunteers(location, serviceType) {
        // In a real implementation, this would:
        // 1. Get all volunteers from GitHub
        // 2. Filter by serviceType
        // 3. Sort by distance to location
        // 4. Return available volunteers
        
        // Mock implementation for demo
        return [
            {
                fullName: "Dr. Wanjiku Mwangi",
                serviceType: "medic",
                phone: "+254700123456",
                location: "Nairobi CBD"
            },
            {
                fullName: "Advocate James Omondi",
                serviceType: "legal",
                phone: "+254711654321",
                location: "Nairobi"
            }
        ].filter(v => v.serviceType === serviceType || serviceType === 'other');
    }

    function initiateEmergencyCall(serviceType) {
        // Map service types to emergency numbers
        const numbers = {
            'Medical Emergency': '+254722123456',
            'Legal Assistance': '+254733654321',
            'Police Brutality': '+254711789012'
        };
        
        const number = numbers[serviceType] || '+254999';
        alert(`Connecting to ${serviceType} at ${number}`);
        // In a real app: window.location.href = `tel:${number}`;
    }
});