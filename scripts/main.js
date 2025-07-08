// scripts/main.js

// DOM Elements
const volunteerGrid = document.getElementById('volunteerGrid');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const retryButton = document.getElementById('retryButton');
const lastAttemptTime = document.getElementById('lastAttemptTime');
const alertsContainer = document.getElementById('alertsContainer');

// Filter Elements
const countyFilter = document.getElementById('countyFilter');
const serviceFilter = document.getElementById('serviceFilter');
const availabilityFilter = document.getElementById('availabilityFilter');

// Volunteer Data
let volunteers = [];
const MAX_RETRIES = 2;
let retryCount = 0;

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Load local data immediately
    loadLocalData();
    
    // Then try to fetch remote data
    loadRemoteData();

    // Set up event listeners
    countyFilter.addEventListener('change', filterVolunteers);
    serviceFilter.addEventListener('change', filterVolunteers);
    availabilityFilter.addEventListener('change', filterVolunteers);
    retryButton.addEventListener('click', () => {
        retryCount = 0;
        loadRemoteData();
    });
}

// 1. First load local data
function loadLocalData() {
    if (window.emergencyVolunteers && window.emergencyVolunteers.length > 0) {
        volunteers = window.emergencyVolunteers.map(v => ({
            ...v,
            lastActive: v.lastActive || getRandomLastActive(),
            distance: v.distance || getRandomDistance()
        }));
        filterVolunteers();
    }
}

// 2. Then try to fetch remote data
async function loadRemoteData() {
    if (retryCount >= MAX_RETRIES) {
        showDataStatus('error', 'Max retries reached. Using local data.');
        return;
    }

    showLoading();
    retryCount++;
    updateLastAttemptTime();

    try {
        const response = await fetchWithTimeout('/.netlify/functions/volunteers', {}, 3000);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        
        if (Array.isArray(result?.data)) {
            volunteers = result.data.map(v => ({
                ...v,
                lastActive: v.lastActive || getRandomLastActive(),
                distance: v.distance || getRandomDistance()
            }));
            showDataStatus('success', 'Data updated successfully');
        } else {
            throw new Error('Invalid data format');
        }
    } catch (error) {
        console.error('Fetch failed:', error);
        showDataStatus('warning', `Attempt ${retryCount}/${MAX_RETRIES} failed. ${error.message}`);
        
        if (volunteers.length === 0) {
            loadLocalData(); // Fallback if no data exists
        }
    } finally {
        hideLoading();
        filterVolunteers();
    }
}

// Helper Functions
function fetchWithTimeout(url, options, timeout) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
    ]);
}

function filterVolunteers() {
    const county = countyFilter.value;
    const service = serviceFilter.value;
    const availability = availabilityFilter.value;

    const filtered = volunteers.filter(volunteer => {
        return (
            (!county || volunteer.county === county) &&
            (!service || volunteer.service === service) &&
            (!availability || volunteer.availability === availability)
        );
    });

    displayVolunteers(filtered);
}

function displayVolunteers(volunteersToDisplay) {
    volunteerGrid.innerHTML = '';

    if (volunteersToDisplay.length === 0) {
        showEmptyState();
        return;
    }

    hideEmptyState();

    volunteersToDisplay.forEach(volunteer => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-md overflow-hidden card-hover fade-in';
        card.innerHTML = `
            <div class="p-6">
                <!-- Card content remains the same as before -->
                ${generateVolunteerCardHTML(volunteer)}
            </div>
        `;
        volunteerGrid.appendChild(card);
    });
}

function generateVolunteerCardHTML(volunteer) {
    return `
        <div class="flex justify-between items-start">
            <div>
                <h3 class="text-lg font-semibold text-gray-800">${escapeHtml(volunteer.name) || 'Volunteer'}</h3>
                <div class="flex items-center mt-1">
                    <span class="${getServiceClass(volunteer.service)}">
                        ${getServiceName(volunteer.service)}
                    </span>
                    <span class="${getAvailabilityClass(volunteer.availability)} ml-2">
                        ${getAvailabilityName(volunteer.availability)}
                    </span>
                </div>
            </div>
            ${volunteer.phone ? `
            <a href="tel:${volunteer.phone}" class="call-btn h-10 w-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition flex items-center justify-center">
                <i class="fas fa-phone"></i>
            </a>
            ` : ''}
        </div>
        <div class="mt-4">
            ${volunteer.county ? `
            <div class="flex items-center text-sm text-gray-600 mb-2">
                <i class="fas fa-map-marker-alt mr-2"></i>
                <span>${escapeHtml(volunteer.county)}</span>
            </div>
            ` : ''}
            ${volunteer.phone ? `
            <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-phone-alt mr-2"></i>
                <span>${formatPhoneNumber(volunteer.phone)}</span>
            </div>
            ` : ''}
        </div>
        ${volunteer.message ? `
        <div class="mt-4 pt-4 border-t border-gray-100">
            <p class="text-sm text-gray-600">${escapeHtml(volunteer.message)}</p>
        </div>
        ` : ''}
        <div class="mt-4 flex justify-between items-center text-xs text-gray-400">
            <span>Last active: ${volunteer.lastActive || 'Recently'}</span>
            <span>${volunteer.distance || 'Nearby'}</span>
        </div>
    `;
}

// Utility Functions
function getServiceName(service) {
    const services = { 
        medic: "Medical", 
        legal: "Legal", 
        logistics: "Logistics",
        counseling: "Counseling" 
    };
    return services[service] || "Helper";
}

function getServiceClass(service) {
    return `service-tag ${service}-tag`;
}

function getAvailabilityName(availability) {
    const options = { 
        "full-time": "Immediate", 
        "on-call": "On Call", 
        "part-time": "Available" 
    };
    return options[availability] || "Available";
}

function getAvailabilityClass(availability) {
    return `availability-badge ${availability}`;
}

function getRandomLastActive() {
    const options = ['Today', 'Yesterday', 'This week', 'Recently'];
    return options[Math.floor(Math.random() * options.length)];
}

function getRandomDistance() {
    return `${Math.floor(Math.random() * 20) + 1}km away`;
}

function formatPhoneNumber(phone) {
    return phone.replace(/(\d{3})(\d{3})(\d{3,4})/, '$1 $2 $3');
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// UI State Functions
function showLoading() {
    loadingState.classList.remove('hidden');
    emptyState.classList.add('hidden');
    errorState.classList.add('hidden');
}

function hideLoading() {
    loadingState.classList.add('hidden');
}

function showEmptyState() {
    emptyState.classList.remove('hidden');
    errorState.classList.add('hidden');
}

function hideEmptyState() {
    emptyState.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorState.classList.remove('hidden');
}

function updateLastAttemptTime() {
    lastAttemptTime.textContent = new Date().toLocaleTimeString();
}

function showDataStatus(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert-${type} p-4 mb-4 rounded fade-in`;
    alert.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${getStatusIcon(type)} mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    alertsContainer.prepend(alert);
    setTimeout(() => alert.remove(), 5000);
}

function getStatusIcon(type) {
    return {
        success: 'check-circle',
        warning: 'exclamation-triangle',
        error: 'times-circle'
    }[type];
}