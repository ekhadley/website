// Lazy loading log viewer with scroll-to-load functionality

// State management
const state = {
    currentOffset: 0,
    isLoading: false,
    hasMore: true,
    totalLines: 0,
    chunkSize: 100,
    allRows: [], // Store all rendered rows for filtering
    isFirstLoad: true // Track if this is the very first chunk load
};

// Initialize on page load
window.addEventListener('load', function() {
    const logContainer = document.querySelector('.log-container');

    // Add loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading-indicator';
    loadingIndicator.style.cssText = 'padding: 15px; text-align: center; color: #888; display: none;';
    loadingIndicator.textContent = 'Loading more logs...';
    logContainer.insertBefore(loadingIndicator, logContainer.firstChild);

    // Load initial chunk
    loadLogChunk();

    // Set up scroll listener for lazy loading
    logContainer.addEventListener('scroll', handleScroll);

    // Set up filter event listeners
    setupFilters();
});

// Load a chunk of logs from the API
async function loadLogChunk() {
    if (state.isLoading || !state.hasMore) {
        return;
    }

    state.isLoading = true;
    showLoadingIndicator(true);

    try {
        const response = await fetch(`/api/friglogs/chunk?offset=${state.currentOffset}&limit=${state.chunkSize}`);
        const data = await response.json();

        if (data.error) {
            console.error('Error loading logs:', data.error);
            showError(data.error);
            return;
        }

        // Update state
        state.hasMore = data.has_more;
        state.totalLines = data.total_lines;

        // Render the new logs
        if (data.lines && data.lines.length > 0) {
            const logContainer = document.querySelector('.log-container');
            const scrollHeightBefore = logContainer.scrollHeight;
            const scrollTopBefore = logContainer.scrollTop;

            // Render logs and prepend to container (older logs go at top)
            const newRows = renderLogLines(data.lines, state.currentOffset);
            const loadingIndicator = document.getElementById('loading-indicator');

            // Insert after loading indicator
            newRows.forEach(row => {
                logContainer.insertBefore(row, loadingIndicator.nextSibling);
            });

            // Update offset for next load
            state.currentOffset += data.lines.length;

            // Preserve scroll position (only if not the first load)
            if (state.isFirstLoad) {
                // First load: scroll to bottom to show newest logs
                logContainer.scrollTop = logContainer.scrollHeight;
                state.isFirstLoad = false;
            } else {
                // Subsequent loads: preserve scroll position
                const scrollHeightAfter = logContainer.scrollHeight;
                logContainer.scrollTop = scrollTopBefore + (scrollHeightAfter - scrollHeightBefore);
            }

            // Update stats
            updateStats();

            // Apply current filters to new rows
            applyFilters();
        }

    } catch (error) {
        console.error('Failed to load log chunk:', error);
        showError('Failed to load logs. Please refresh the page.');
    } finally {
        state.isLoading = false;
        showLoadingIndicator(false);
    }
}

// Handle scroll events for lazy loading
function handleScroll() {
    const logContainer = document.querySelector('.log-container');

    // Load more when scrolling near the top (within 200px)
    if (logContainer.scrollTop < 200 && !state.isLoading && state.hasMore) {
        loadLogChunk();
    }
}

// Render log lines and return array of DOM elements
function renderLogLines(lines, startOffset) {
    const rows = [];

    lines.forEach((line, index) => {
        try {
            const logEntry = JSON.parse(line);

            // Create row element
            const row = document.createElement('div');
            const globalIndex = startOffset + index;
            row.className = 'log-row ' + (globalIndex % 2 === 0 ? 'even' : 'odd');

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

            rows.push(row);
            state.allRows.push(row);

        } catch (e) {
            // If parsing fails, show the raw line
            const errorRow = document.createElement('div');
            errorRow.className = 'log-row log-parse-error';
            errorRow.textContent = line;
            rows.push(errorRow);
            state.allRows.push(errorRow);
        }
    });

    return rows;
}

// Show/hide loading indicator
function showLoadingIndicator(show) {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
        indicator.style.display = show ? 'block' : 'none';
    }
}

// Show error message
function showError(message) {
    const logContainer = document.querySelector('.log-container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'log-parse-error';
    errorDiv.textContent = `Error: ${message}`;
    logContainer.appendChild(errorDiv);
}

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
}

// Update stats display
function updateStats() {
    const rows = document.querySelectorAll('.log-row');
    const visibleRows = document.querySelectorAll('.log-row:not([style*="display: none"])');

    document.getElementById('visible-count').textContent = `Visible: ${visibleRows.length}`;

    // Show loaded/total if we know total
    if (state.totalLines > 0) {
        document.getElementById('total-count').textContent = `Total: ${rows.length} / ${state.totalLines}`;
    } else {
        document.getElementById('total-count').textContent = `Total: ${rows.length}`;
    }
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
