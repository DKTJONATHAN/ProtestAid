document.addEventListener('DOMContentLoaded', () => {
    // Toggle specialization field
    document.querySelectorAll('input[name="serviceType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const field = document.getElementById('specializationField');
            field.classList.toggle('hidden', e.target.value !== 'other');
        });
    });

    // Form submission
    document.getElementById('volunteerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        
        const formData = {
            fullName: form.fullName.value,
            email: form.email.value,
            phone: form.phone.value,
            serviceType: form.querySelector('input[name="serviceType"]:checked').value,
            specialization: form.specialization?.value || null,
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
                alert('Submission failed. Please try again.');
            }
        } catch (error) {
            alert('Network error. Check console for details.');
            console.error(error);
        }
    });
});