document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('volunteerForm');
    const successMessage = document.getElementById('successMessage');
    const serviceTypeRadios = document.querySelectorAll('input[name="serviceType"]');
    const specializationField = document.getElementById('specializationField');

    // Show/hide specialization field based on service type
    serviceTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'medic' || this.value === 'legal') {
                specializationField.classList.remove('hidden');
            } else {
                specializationField.classList.add('hidden');
            }
        });
    });

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const volunteerData = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            status: 'pending',
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            location: formData.get('location'),
            serviceType: formData.get('serviceType'),
            specialization: formData.get('specialization') || null,
            emergencyContacts: {
                primary: formData.get('emergencyContact1'),
                secondary: formData.get('emergencyContact2') || null
            },
            availability: formData.get('availability'),
            experience: formData.get('experience') || null,
            training: formData.get('training') || null
        };

        try {
            // Save to Netlify function (will update GitHub)
            const response = await saveVolunteerData(volunteerData);
            
            if (response.ok) {
                form.reset();
                form.classList.add('hidden');
                successMessage.classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                throw new Error('Failed to save volunteer data');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('There was an error submitting your form. Please try again.');
        }
    });

    async function saveVolunteerData(data) {
        // This will call our Netlify function
        return await fetch('/.netlify/functions/update-volunteers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
    }
});