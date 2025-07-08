async function submitForm(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="inline-block animate-spin mr-2">
                <i class="fas fa-circle-notch"></i>
            </span>
            Processing...
        `;

        // Collect form data
        const formData = {
            personalInfo: {
                fullName: form.fullName.value,
                email: form.email.value,
                phone: form.phone.value,
                location: form.location.value
            },
            volunteerRole: {
                serviceType: form.querySelector('input[name="serviceType"]:checked').value
            },
            emergencyContacts: {
                primary: form.emergencyContact1.value,
                secondary: form.emergencyContact2.value || null,
                availability: form.availability.value
            },
            additionalInfo: {
                experience: Array.from(form.querySelectorAll('input[name="experience"]:checked')).map(el => el.value),
                certifications: Array.from(form.querySelectorAll('input[name="certifications"]:checked')).map(el => el.value),
                consent: form.consent.checked,
                timestamp: new Date().toISOString()
            }
        };

        // Submit to Netlify function
        const response = await fetch('/.netlify/functions/volunteers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Failed to submit form');
        }

        // Show success
        form.reset();
        form.classList.add('hidden');
        document.getElementById('successMessage').classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        alert('Error submitting form. Please try again.');
        console.error('Submission error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // No need for specialization toggle anymore
});