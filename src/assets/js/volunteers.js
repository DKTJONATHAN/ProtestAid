document.addEventListener('DOMContentLoaded', function() {
    // Toggle specialization field visibility
    const serviceTypeRadios = document.querySelectorAll('input[name="serviceType"]');
    const specializationField = document.getElementById('specializationField');
    
    serviceTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const showField = this.value === 'other';
            specializationField.classList.toggle('hidden', !showField);
            document.getElementById('specialization').toggleAttribute('required', showField);
        });
    });

    // Form submission handler
    const form = document.getElementById('volunteerForm');
    const successMessage = document.getElementById('successMessage');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Prepare form data
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
            experience: form.experience.value,
            training: form.training.value,
            consent: form.consent.checked
        };

        try {
            // Submit to Netlify function
            const response = await fetch('/.netlify/functions/volunteers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                // Show success and reset form
                form.reset();
                form.classList.add('hidden');
                successMessage.classList.remove('hidden');
                window.scrollTo({
                    top: successMessage.offsetTop,
                    behavior: 'smooth'
                });
            } else {
                throw new Error(result.error || 'Submission failed');
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert(`Error: ${error.message}\nPlease try again.`);
        }
    });
});