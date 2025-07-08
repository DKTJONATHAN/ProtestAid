// DOM Elements
const volunteerGrid = document.getElementById('volunteerGrid');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const retryButton = document.getElementById('retryButton');
const alertsContainer = document.getElementById('alertsContainer');
const lastAttemptTime = document.getElementById('lastAttemptTime');

// Filter Elements
const countyFilter = document.getElementById('countyFilter');
const serviceFilter = document.getElementById('serviceFilter');
const availabilityFilter = document.getElementById('availabilityFilter');

// Volunteer Data
let volunteers = [];
let lastUpdateTimestamp = null;
let retryCount = 0;
const MAX_RETRIES = 3;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadVolunteerData();

    // Set up event listeners for filters
    countyFilter.addEventListener('change', filterVolunteers);
    serviceFilter.addEventListener('change', filterVolunteers);
    availabilityFilter.addEventListener('change', filterVolunteers);

    // Retry button
    retryButton.addEventListener('click', () => {
        retryCount = 0;
        loadVolunteerData();
    });
});

// Main data loading function
async function loadVolunteerData() {
    try {
        showLoading();
        updateLastAttemptTime();

        // Try to fetch from primary source
        let response = await fetchWithTimeout('/.netlify/functions/volunteers', {}, 8000);
        let result = await response.json();

        if (!response.ok) throw new Error(result.error || 'Function failed');

        volunteers = Array.isArray(result.data) ? result.data : [];
        lastUpdateTimestamp = result.timestamp || new Date().toISOString();

        // Add metadata if missing
        volunteers = volunteers.map(volunteer => ({
            ...volunteer,
            lastActive: volunteer.lastActive || getRandomLastActive(),
            distance: volunteer.distance || getRandomDistance()
        }));

        filterVolunteers();
        showDataStatus('success', `Data loaded from ${result.source || 'primary source'}`);

    } catch (error) {
        console.error('Data load failed:', error);
        
        // Fall back to local data
        if (window.emergencyVolunteers && window.emergencyVolunteers.length > 0) {
            volunteers = window.emergencyVolunteers;
            filterVolunteers();
            showDataStatus('error', 'Using emergency backup data');
        } else {
            showError('All data sources failed');
        }
    } finally {
        hideLoading();
    }
}

// Fetch with timeout
async function fetchWithTimeout(resource, options = {}, timeout = 8000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(resource, {
        ...options,
        signal: controller.signal  
    });

    clearTimeout(id);
    return response;
}

// Filter volunteers based on selections
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

// Display volunteers in the grid
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
            </div>
        `;
        volunteerGrid.appendChild(card);
    });
}

// Helper functions
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
    const baseClass = "service-tag";
    const typeClass = service ? `${service}-tag` : "other-tag";
    return `${baseClass} ${typeClass}`;
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
    const baseClass = "availability-badge";
    const availabilityClass = availability ? availability.replace(' ', '-') : "unknown";
    return `${baseClass} ${availabilityClass}`;
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
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// UI State Management
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
    const colors = {
        success: 'green',
        warning: 'yellow',
        error: 'red'
    };

    const icon = {
        success: 'check-circle',
        warning: 'exclamation-triangle',
        error: 'times-circle'
    };

    const alert = document.createElement('div');
    alert.className = `bg-${colors[type]}-50 border-l-4 border-${colors[type]}-400 p-4 mb-4 fade-in`;
    alert.innerHTML = `
        <div class="flex items-center">
            <div class="flex-shrink-0 text-${colors[type]}-400">
                <i class="fas fa-${icon[type]}"></i>
            </div>
            <div class="ml-3">
                <p class="text-sm text-${colors[type]}-700">
                    ${message} <span class="text-xs opacity-75">(${new Date().toLocaleTimeString()})</span>
                </p>
            </div>
        </div>
    `;

    alertsContainer.insertBefore(alert, alertsContainer.firstChild);

    setTimeout(() => {
        alert.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => alert.remove(), 300);
    }, 15000);
}