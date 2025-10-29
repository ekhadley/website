// Parse and render JSONL logs with collapsible rows
window.addEventListener('load', function() {
    const logContainer = document.querySelector('.log-container');
    const rawContent = logContainer.textContent;
    
    // Clear the container
    logContainer.textContent = '';
    
    // Split into lines and parse each JSONL entry
    const lines = rawContent.trim().split('\n').filter(line => line.trim());
    
    lines.forEach((line, index) => {
        try {
            const logEntry = JSON.parse(line);
            
            // Create row element
            const row = document.createElement('div');
            row.className = 'log-row ' + (index % 2 === 0 ? 'even' : 'odd');
            
            // Create summary section
            const summary = document.createElement('div');
            summary.className = 'log-summary';
            
            // Extract key info for summary
            const timestamp = logEntry.timestamp || logEntry.time || '';
            const level = logEntry.level || logEntry.severity || 'INFO';
            let message = logEntry.message || logEntry.msg || '';
            const eventType = (logEntry.data && logEntry.data.event_type) || '';
            
            // Store level and event type for filtering
            row.dataset.level = level.toLowerCase();
            row.dataset.eventType = eventType;
            
            // For message logs, try to extract the actual message content
            if (level === 'INFO' && logEntry.data && logEntry.data.content) {
                const messageContent = logEntry.data.content;
                message = `${message}: "${messageContent}"`;
            }
            
            // Truncate message to 50 characters
            const maxLength = 50;
            const truncatedMessage = message.length > maxLength 
                ? message.substring(0, maxLength) + '...' 
                : message;
            
            summary.innerHTML = `
                <span class="log-toggle">▶</span>
                <span class="log-timestamp">${escapeHtml(timestamp)}</span>
                <span class="log-level log-level-${level.toLowerCase()}">${escapeHtml(level)}</span>
                <span class="log-message">${escapeHtml(truncatedMessage)}</span>
            `;
            
            // Create expandable data section
            const data = document.createElement('div');
            data.className = 'log-data';
            data.textContent = JSON.stringify(logEntry, null, 2);
            
            // Add click handler for toggle
            summary.addEventListener('click', function() {
                row.classList.toggle('expanded');
                const toggle = summary.querySelector('.log-toggle');
                toggle.textContent = row.classList.contains('expanded') ? '▼' : '▶';
            });
            
            row.appendChild(summary);
            row.appendChild(data);
            logContainer.appendChild(row);
            
        } catch (e) {
            // If parsing fails, show the raw line
            const errorRow = document.createElement('div');
            errorRow.className = 'log-row log-parse-error';
            errorRow.textContent = line;
            logContainer.appendChild(errorRow);
        }
    });
    
    // Initialize stats
    updateStats();
    
    // Set up filter event listeners
    setupFilters();
    
    // Scroll to bottom after rendering
    logContainer.scrollTop = logContainer.scrollHeight;
});

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Apply filters to log rows
function applyFilters() {
    const searchText = document.getElementById('search-input').value.toLowerCase();
    const levelCheckboxes = document.querySelectorAll('.level-checkbox');
    const eventCheckboxes = document.querySelectorAll('.event-checkbox');
    const enabledLevels = new Set();
    const enabledEvents = new Set();
    
    // Get enabled log levels
    levelCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            enabledLevels.add(checkbox.dataset.level);
        }
    });
    
    // Get enabled event types
    eventCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            enabledEvents.add(checkbox.dataset.event);
        }
    });
    
    // Filter rows
    const rows = document.querySelectorAll('.log-row');
    rows.forEach(row => {
        let level = row.dataset.level;
        // Normalize "warning" to "warn"
        if (level === 'warning') level = 'warn';
        
        const eventType = row.dataset.eventType;
        const text = row.textContent.toLowerCase();
        
        const levelMatch = enabledLevels.has(level);
        const eventMatch = !eventType || enabledEvents.has(eventType);
        const searchMatch = searchText === '' || text.includes(searchText);
        
        if (levelMatch && eventMatch && searchMatch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    updateStats();
    
    // Auto-scroll to bottom after filtering
    const logContainer = document.querySelector('.log-container');
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Update stats display
function updateStats() {
    const rows = document.querySelectorAll('.log-row');
    const visibleRows = document.querySelectorAll('.log-row:not([style*="display: none"])');
    
    document.getElementById('visible-count').textContent = `Visible: ${visibleRows.length}`;
    document.getElementById('total-count').textContent = `Total: ${rows.length}`;
}

// Set up filter event listeners
function setupFilters() {
    // Search input
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', applyFilters);
    
    // Level checkboxes
    const levelCheckboxes = document.querySelectorAll('.level-checkbox');
    levelCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
    
    // Event type checkboxes
    const eventCheckboxes = document.querySelectorAll('.event-checkbox');
    eventCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateToggleAllButton();
            applyFilters();
        });
    });
    
    // Clear filters button
    const clearButton = document.getElementById('clear-filters');
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        levelCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        eventCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        updateToggleAllButton();
        applyFilters();
    });
    
    // Toggle all events button
    const toggleAllButton = document.getElementById('toggle-all-events');
    toggleAllButton.addEventListener('click', () => {
        const allChecked = Array.from(eventCheckboxes).every(cb => cb.checked);
        
        eventCheckboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
        });
        
        updateToggleAllButton();
        applyFilters();
    });
    
    // Update toggle all button text based on checkbox state
    updateToggleAllButton();
}

// Update the toggle all button text
function updateToggleAllButton() {
    const eventCheckboxes = document.querySelectorAll('.event-checkbox');
    const toggleAllButton = document.getElementById('toggle-all-events');
    const allChecked = Array.from(eventCheckboxes).every(cb => cb.checked);
    
    toggleAllButton.textContent = allChecked ? 'Deselect All' : 'Select All';
}
