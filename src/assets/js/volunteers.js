document.addEventListener('DOMContentLoaded', function() {
    // Specialization field toggle
    const serviceTypeRadios = document.querySelectorAll('input[name="serviceType"]');
    const specializationField = document.getElementById('specializationField');

    serviceTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'other') {
                specializationField.classList.remove('hidden');
                document.getElementById('specialization').setAttribute('required', '');
            } else {
                specializationField.classList.add('hidden');
                document.getElementById('specialization').removeAttribute('required');
            }
        });
    });

    // Form submission handler
    const volunteerForm = document.getElementById('volunteerForm');
    const successMessage = document.getElementById('successMessage');

    volunteerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!this.checkValidity()) {
            this.reportValidity();
            return;
        }

        const formData = {
            personalInfo: {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                location: document.getElementById('location').value
            },
            volunteerRole: {
                serviceType: document.querySelector('input[name="serviceType"]:checked').value,
                specialization: document.getElementById('specialization').value || null
            },
            emergencyContacts: {
                primary: document.getElementById('emergencyContact1').value,
                secondary: document.getElementById('emergencyContact2').value || null,
                availability: document.getElementById('availability').value
            },
            additionalInfo: {
                experience: document.getElementById('experience').value || null,
                training: document.getElementById('training').value || null,
                consent: document.getElementById('consent').checked,
                timestamp: new Date().toISOString()
            }
        };

        try {
            // Send data to Netlify function
            const response = await fetch('/.netlify/functions/saveVolunteer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                volunteerForm.reset();
                volunteerForm.classList.add('hidden');
                successMessage.classList.remove('hidden');
                successMessage.scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error(result.error || 'Failed to save data');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting form: ' + error.message);
        }
    });
});