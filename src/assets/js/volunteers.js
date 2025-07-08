document.addEventListener('DOMContentLoaded', function() {
    // Toggle specialization field
    const serviceRadios = document.querySelectorAll('input[name="serviceType"]');
    const specField = document.getElementById('specializationField');
    
    serviceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            specField.classList.toggle('hidden', this.value !== 'other');
            document.getElementById('specialization').toggleAttribute('required', this.value === 'other');
        });
    });

    // Form submission
    const form = document.getElementById('volunteerForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = {
            fullName: form.fullName.value,
            email: form.email.value,
            phone: form.phone.value,
            location: form.location.value,
            serviceType: form.querySelector('input[name="serviceType"]:checked').value,
            specialization: form.specialization?.value || null,
            emergencyContacts: {
                primary: form.emergencyContact1.value,
                secondary: form.emergencyContact2.value || null
            },
            availability: form.availability.value,
            experience: form.experience.value || null,
            training: form.training.value || null,
            consent: form.consent.checked,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch('/.netlify/functions/volunteers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                form.reset();
                document.getElementById('successMessage').classList.remove('hidden');
            } else {
                throw new Error(await response.text());
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to submit: ' + error.message);
        }
    });
});