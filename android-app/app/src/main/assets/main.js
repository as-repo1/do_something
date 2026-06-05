// State Store Definition
const state = {
	tasks: [],
	filters: {
		status: 'all',     // 'all' | 'active' | 'completed'
		priority: 'all',   // 'all' | 'low' | 'medium' | 'high'
		tag: null          // null | string (specific category)
	},
	sortBy: 'created-desc', // 'created-desc' | 'created-asc' | 'due-asc' | 'due-desc' | 'priority-desc' | 'alphabetical-asc'
	searchQuery: ''
};

// SVG Icon Templates
const ICONS = {
	check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
	edit: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
	save: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/></svg>`,
	delete: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`,
	tag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l5.58-5.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M6 8h.01"/></svg>`,
	calendar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
	flag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`
};

// ----------------------------------------------------
// Local Storage Persistence
// ----------------------------------------------------
function saveToLocalStorage() {
	localStorage.setItem('do_something_tasks', JSON.stringify(state.tasks));
}

function loadFromLocalStorage() {
	const storedTasks = localStorage.getItem('do_something_tasks');
	if (storedTasks) {
		try {
			state.tasks = JSON.parse(storedTasks);
		} catch (e) {
			console.error("Failed to parse stored tasks:", e);
			state.tasks = [];
		}
	} else {
		// Mock data for fresh visitors to showcase features immediately
		state.tasks = [
			{
				id: 'mock-1',
				title: 'Explore the modernised glassmorphic interface ✨',
				completed: false,
				priority: 'high',
				tag: 'Features',
				dueDate: getRelativeDateString(0),
				createdAt: Date.now() - 3600000 * 2
			},
			{
				id: 'mock-2',
				title: 'Toggle light and dark mode in the header 🌙',
				completed: false,
				priority: 'medium',
				tag: 'Style',
				dueDate: getRelativeDateString(1),
				createdAt: Date.now() - 3600000
			},
			{
				id: 'mock-3',
				title: 'Add a new task with due dates and tags below',
				completed: false,
				priority: 'low',
				tag: 'Guide',
				dueDate: '',
				createdAt: Date.now()
			}
		];
		saveToLocalStorage();
	}
}

// Helper: Get date string relative to today (offset in days)
function getRelativeDateString(daysOffset) {
	const date = new Date();
	date.setDate(date.getDate() + daysOffset);
	return date.toISOString().split('T')[0];
}

// ----------------------------------------------------
// Theme Management Helper
// ----------------------------------------------------
function initTheme() {
	const themeSelect = document.getElementById('theme-select');
	
	const getActiveTheme = () => {
		return localStorage.getItem('theme-preference') || 'default';
	};

	const applyTheme = (theme) => {
		if (theme === 'default') {
			document.documentElement.removeAttribute('data-theme');
			document.documentElement.style.colorScheme = ''; // Let CSS resolve light/dark naturally
		} else {
			document.documentElement.setAttribute('data-theme', theme);
			if (theme === 'light') {
				document.documentElement.style.colorScheme = 'light';
			} else {
				document.documentElement.style.colorScheme = 'dark';
			}
		}
		localStorage.setItem('theme-preference', theme);
		if (themeSelect) themeSelect.value = theme;
	};

	// Initialize theme on load
	const initialTheme = getActiveTheme();
	applyTheme(initialTheme);

	// Dropdown Handler
	if (themeSelect) {
		themeSelect.addEventListener('change', (e) => {
			applyTheme(e.target.value);
		});
	}

	// Listen for system theme changes if default is active
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		if (getActiveTheme() === 'default') {
			// CSS handles visual transitions automatically
		}
	});
}

// ----------------------------------------------------
// Utility Helpers
// ----------------------------------------------------
function isOverdue(dueDateString) {
	if (!dueDateString) return false;
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const dueDate = new Date(dueDateString);
	dueDate.setHours(0, 0, 0, 0);
	return dueDate < today;
}

function formatDate(dateString) {
	if (!dateString) return '';
	const date = new Date(dateString);
	// Format to: "MMM DD" or "MMM DD, YYYY" if different year
	const options = { month: 'short', day: 'numeric', timeZone: 'UTC' };
	if (date.getUTCFullYear() !== new Date().getFullYear()) {
		options.year = 'numeric';
	}
	return date.toLocaleDateString(undefined, options);
}

// ----------------------------------------------------
// Dashboard & Stats Calculator
// ----------------------------------------------------
function updateDashboard() {
	const total = state.tasks.length;
	const completed = state.tasks.filter(t => t.completed).length;
	const active = total - completed;
	const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

	// Update text widgets
	document.getElementById('stats-total').textContent = total;
	document.getElementById('stats-active').textContent = active;
	document.getElementById('stats-completed').textContent = completed;
	document.getElementById('completion-percentage').textContent = `${percent}%`;

	// Update circular SVG progress
	const progressCircle = document.getElementById('progress-circle');
	const radius = (progressCircle.r && progressCircle.r.baseVal) ? progressCircle.r.baseVal.value : (parseFloat(progressCircle.getAttribute('r')) || 50);
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (percent / 100) * circumference;
	progressCircle.style.strokeDashoffset = strokeDashoffset;

	// Enable/disable Clear Completed button
	const clearCompletedBtn = document.getElementById('clear-completed-btn');
	clearCompletedBtn.disabled = completed === 0;
}

// ----------------------------------------------------
// Dynamic Categories Panel
// ----------------------------------------------------
function updateCategoriesFilter() {
	const tagsSection = document.getElementById('tags-filter-section');
	const tagsContainer = document.getElementById('category-filter-tags');
	
	// Collect unique tags
	const uniqueTags = new Set();
	state.tasks.forEach(t => {
		if (t.tag && t.tag.trim() !== '') {
			uniqueTags.add(t.tag.trim());
		}
	});

	if (uniqueTags.size === 0) {
		tagsSection.classList.add('hidden');
		return;
	}
	
	tagsSection.classList.remove('hidden');
	tagsContainer.innerHTML = '';

	// Render dynamic tag buttons
	uniqueTags.forEach(tag => {
		const badge = document.createElement('button');
		badge.className = `tag-badge ${state.filters.tag === tag ? 'active' : ''}`;
		badge.textContent = tag;
		badge.addEventListener('click', () => {
			if (state.filters.tag === tag) {
				state.filters.tag = null; // Toggle off
			} else {
				state.filters.tag = tag;
			}
			renderTasks();
			updateCategoriesFilter();
		});
		tagsContainer.appendChild(badge);
	});
}

// ----------------------------------------------------
// Task Filtering & Sorting Logic
// ----------------------------------------------------
function getFilteredAndSortedTasks() {
	return state.tasks
		.filter(task => {
			// Search filter
			if (state.searchQuery) {
				const query = state.searchQuery.toLowerCase();
				if (!task.title.toLowerCase().includes(query) && 
					!(task.tag && task.tag.toLowerCase().includes(query))) {
					return false;
				}
			}

			// Status filter
			if (state.filters.status === 'active' && task.completed) return false;
			if (state.filters.status === 'completed' && !task.completed) return false;

			// Priority filter
			if (state.filters.priority !== 'all' && task.priority !== state.filters.priority) return false;

			// Category Tag filter
			if (state.filters.tag && task.tag !== state.filters.tag) return false;

			return true;
		})
		.sort((a, b) => {
			switch (state.sortBy) {
				case 'created-asc':
					return a.createdAt - b.createdAt;
				case 'due-asc':
					if (!a.dueDate) return 1;
					if (!b.dueDate) return -1;
					return new Date(a.dueDate) - new Date(b.dueDate);
				case 'due-desc':
					if (!a.dueDate) return 1;
					if (!b.dueDate) return -1;
					return new Date(b.dueDate) - new Date(a.dueDate);
				case 'priority-desc':
					const priorityWeight = { high: 3, medium: 2, low: 1 };
					return priorityWeight[b.priority] - priorityWeight[a.priority];
				case 'alphabetical-asc':
					return a.title.localeCompare(b.title);
				case 'created-desc':
				default:
					return b.createdAt - a.createdAt;
			}
		});
}

// Update the filters visual text in the task list header
function updateFilterSummaryText() {
	const summaryEl = document.getElementById('active-filters-summary');
	const parts = [];

	if (state.filters.status !== 'all') {
		parts.push(state.filters.status);
	}
	if (state.filters.priority !== 'all') {
		parts.push(`${state.filters.priority} priority`);
	}
	if (state.filters.tag) {
		parts.push(`category "${state.filters.tag}"`);
	}
	if (state.searchQuery) {
		parts.push(`matching "${state.searchQuery}"`);
	}

	if (parts.length === 0) {
		summaryEl.textContent = 'Showing all tasks';
	} else {
		// Capitalise first word
		const text = `Showing ${parts.join(', ')} tasks`;
		summaryEl.textContent = text.charAt(0).toUpperCase() + text.slice(1);
	}
}

// ----------------------------------------------------
// Main Task List Rendering
// ----------------------------------------------------
function renderTasks() {
	const container = document.getElementById('tasks');
	const emptyState = document.getElementById('tasks-empty-state');
	
	const filteredTasks = getFilteredAndSortedTasks();
	
	container.innerHTML = '';
	updateFilterSummaryText();

	if (filteredTasks.length === 0) {
		emptyState.classList.remove('hidden');
		return;
	}
	emptyState.classList.add('hidden');

	// Create and append elements
	filteredTasks.forEach(task => {
		const taskEl = document.createElement('div');
		taskEl.className = `task priority-${task.priority} ${task.completed ? 'completed' : ''}`;
		taskEl.setAttribute('data-id', task.id);

		// 1. Checkbox Wrapper
		const checkboxWrapper = document.createElement('div');
		checkboxWrapper.className = 'task-checkbox-wrapper';
		const checkbox = document.createElement('button');
		checkbox.className = 'task-checkbox';
		checkbox.ariaLabel = task.completed ? "Mark task active" : "Mark task completed";
		checkbox.innerHTML = ICONS.check;
		checkbox.addEventListener('click', () => toggleTaskCompletion(task.id));
		checkboxWrapper.appendChild(checkbox);
		taskEl.appendChild(checkboxWrapper);

		// 2. Task Content Container
		const contentDiv = document.createElement('div');
		contentDiv.className = 'task-content';

		// Title (Textarea auto-height or single input)
		const titleWrapper = document.createElement('div');
		titleWrapper.className = 'task-title-wrapper';
		const titleInput = document.createElement('input');
		titleInput.type = 'text';
		titleInput.className = 'task-title';
		titleInput.value = task.title;
		titleInput.readOnly = true;
		titleInput.ariaLabel = "Task description";
		titleWrapper.appendChild(titleInput);
		contentDiv.appendChild(titleWrapper);

		// Metadata Sub-row
		const metaDiv = document.createElement('div');
		metaDiv.className = 'task-meta';

		// Priority badge
		const priorityBadge = document.createElement('span');
		priorityBadge.className = `meta-badge badge-priority-${task.priority}`;
		priorityBadge.innerHTML = `${ICONS.flag} <span>${task.priority}</span>`;
		metaDiv.appendChild(priorityBadge);

		// Tag Badge (optional)
		if (task.tag && task.tag.trim() !== '') {
			const tagBadge = document.createElement('span');
			tagBadge.className = 'meta-badge badge-category';
			tagBadge.innerHTML = `${ICONS.tag} <span>${task.tag}</span>`;
			metaDiv.appendChild(tagBadge);
		}

		// Due Date Badge (optional)
		if (task.dueDate) {
			const dueBadge = document.createElement('span');
			const isTaskOverdue = isOverdue(task.dueDate) && !task.completed;
			dueBadge.className = `meta-badge badge-due-date ${isTaskOverdue ? 'overdue' : ''}`;
			dueBadge.innerHTML = `${ICONS.calendar} <span>${formatDate(task.dueDate)}${isTaskOverdue ? ' (Overdue)' : ''}</span>`;
			metaDiv.appendChild(dueBadge);
		}

		contentDiv.appendChild(metaDiv);
		taskEl.appendChild(contentDiv);

		// 3. Actions Button Wrapper
		const actionsDiv = document.createElement('div');
		actionsDiv.className = 'task-actions';

		// Edit Button
		const editBtn = document.createElement('button');
		editBtn.className = 'action-btn edit-btn';
		editBtn.ariaLabel = "Edit task description";
		editBtn.innerHTML = ICONS.edit;
		
		// Setup Edit Handlers
		let isEditing = false;
		const startEditing = () => {
			isEditing = true;
			editBtn.innerHTML = ICONS.save;
			editBtn.ariaLabel = "Save description";
			titleInput.readOnly = false;
			titleInput.focus();
			// Move cursor to end of text
			const len = titleInput.value.length;
			titleInput.setSelectionRange(len, len);
		};

		const saveEditing = () => {
			const newValue = titleInput.value.trim();
			if (newValue !== '' && newValue !== task.title) {
				updateTaskTitle(task.id, newValue);
			} else {
				titleInput.value = task.title; // revert
			}
			isEditing = false;
			editBtn.innerHTML = ICONS.edit;
			editBtn.ariaLabel = "Edit task description";
			titleInput.readOnly = true;
		};

		editBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			if (!isEditing) {
				startEditing();
			} else {
				saveEditing();
			}
		});

		titleInput.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				saveEditing();
			} else if (e.key === 'Escape') {
				titleInput.value = task.title; // Revert
				isEditing = false;
				editBtn.innerHTML = ICONS.edit;
				editBtn.ariaLabel = "Edit task description";
				titleInput.readOnly = true;
			}
		});

		// Delete Button
		const deleteBtn = document.createElement('button');
		deleteBtn.className = 'action-btn delete-btn';
		deleteBtn.ariaLabel = "Delete task";
		deleteBtn.innerHTML = ICONS.delete;
		deleteBtn.addEventListener('click', () => deleteTask(task.id));

		actionsDiv.appendChild(editBtn);
		actionsDiv.appendChild(deleteBtn);
		taskEl.appendChild(actionsDiv);

		container.appendChild(taskEl);
	});
}

// ----------------------------------------------------
// Task Modification Handlers
// ----------------------------------------------------
function addTask(title, priority, tag, dueDate) {
	if (!title || title.trim() === '') {
		return;
	}
	const newTask = {
		id: `task-${Date.now()}`,
		title: title.trim(),
		completed: false,
		priority: priority,
		tag: tag.trim(),
		dueDate: dueDate,
		createdAt: Date.now()
	};

	state.tasks.push(newTask);
	saveToLocalStorage();
	
	// Refresh View
	renderTasks();
	updateDashboard();
	updateCategoriesFilter();
}

function toggleTaskCompletion(id) {
	const task = state.tasks.find(t => t.id === id);
	if (task) {
		task.completed = !task.completed;
		saveToLocalStorage();
		renderTasks();
		updateDashboard();
	}
}

function updateTaskTitle(id, newTitle) {
	const task = state.tasks.find(t => t.id === id);
	if (task) {
		task.title = newTitle;
		saveToLocalStorage();
		renderTasks();
	}
}

function deleteTask(id) {
	state.tasks = state.tasks.filter(t => t.id !== id);
	
	// If the current tag filter has no more tasks, reset tag filter
	if (state.filters.tag && !state.tasks.some(t => t.tag === state.filters.tag)) {
		state.filters.tag = null;
	}
	
	saveToLocalStorage();
	renderTasks();
	updateDashboard();
	updateCategoriesFilter();
}

function clearCompleted() {
	state.tasks = state.tasks.filter(t => !t.completed);
	
	// Reset active tag filter if it's no longer valid
	if (state.filters.tag && !state.tasks.some(t => t.tag === state.filters.tag)) {
		state.filters.tag = null;
	}

	saveToLocalStorage();
	renderTasks();
	updateDashboard();
	updateCategoriesFilter();
}

// ----------------------------------------------------
// Data Migration (Export / Import Backup)
// ----------------------------------------------------
function exportBackup() {
	if (state.tasks.length === 0) {
		alert("You have no tasks to back up!");
		return;
	}
	const json = JSON.stringify(state.tasks, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	
	const date = new Date().toISOString().split('T')[0];
	const a = document.createElement('a');
	a.href = url;
	a.download = `do_something_backup_${date}.json`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

function importBackup(e) {
	const file = e.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = function(event) {
		try {
			const parsed = JSON.parse(event.target.result);
			
			// Validate format
			if (!Array.isArray(parsed)) {
				throw new Error("Backup file must be a JSON array of tasks.");
			}
			
			// Verify structure of tasks
			const cleanTasks = [];
			parsed.forEach((item, index) => {
				if (item && typeof item === 'object' && typeof item.title === 'string') {
					cleanTasks.push({
						id: item.id || `task-imported-${Date.now()}-${index}`,
						title: item.title.trim(),
						completed: !!item.completed,
						priority: ['low', 'medium', 'high'].includes(item.priority) ? item.priority : 'medium',
						tag: typeof item.tag === 'string' ? item.tag.trim() : '',
						dueDate: typeof item.dueDate === 'string' ? item.dueDate : '',
						createdAt: Number(item.createdAt) || Date.now()
					});
				}
			});

			if (cleanTasks.length === 0) {
				alert("No valid tasks found in the backup file.");
				return;
			}

			if (confirm(`Importing will restore ${cleanTasks.length} tasks and overwrite all current tasks. Do you want to continue?`)) {
				state.tasks = cleanTasks;
				saveToLocalStorage();
				renderTasks();
				updateDashboard();
				updateCategoriesFilter();
				alert("Tasks successfully imported!");
			}
		} catch (err) {
			alert("Failed to parse backup file: " + err.message);
		}
		// Reset file input value
		e.target.value = '';
	};
	reader.readAsText(file);
}

// ----------------------------------------------------
// Bind Events and Filters
// ----------------------------------------------------
function bindEvents() {
	// Form Submit Handler
	const form = document.getElementById('new-task-form');
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		
		const titleInput = document.getElementById('new-task-input');
		const prioritySelect = document.getElementById('new-task-priority');
		const tagInput = document.getElementById('new-task-tag');
		const dueInput = document.getElementById('new-task-due');

		const title = titleInput.value;
		const priority = prioritySelect.value;
		const tag = tagInput.value;
		const due = dueInput.value;

		addTask(title, priority, tag, due);

		// Reset fields
		titleInput.value = '';
		tagInput.value = '';
		dueInput.value = '';
		prioritySelect.value = 'medium';
	});

	// Live Search Handler
	const searchInput = document.getElementById('search-tasks');
	searchInput.addEventListener('input', (e) => {
		state.searchQuery = e.target.value;
		renderTasks();
	});

	// Status Filter Buttons
	const statusBtns = document.querySelectorAll('.filter-btn[data-filter]');
	statusBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			statusBtns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			state.filters.status = btn.dataset.filter;
			renderTasks();
		});
	});

	// Priority Filter Buttons
	const priorityBtns = document.querySelectorAll('.filter-btn[data-priority]');
	priorityBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			priorityBtns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			state.filters.priority = btn.dataset.priority;
			renderTasks();
		});
	});

	// Sorting Dropdown Handler
	const sortSelect = document.getElementById('sort-select');
	sortSelect.addEventListener('change', (e) => {
		state.sortBy = e.target.value;
		renderTasks();
	});

	// Clear Completed Button
	const clearCompletedBtn = document.getElementById('clear-completed-btn');
	clearCompletedBtn.addEventListener('click', () => {
		clearCompleted();
	});

	// Backup and Restore Handlers
	const exportBtn = document.getElementById('export-backup-btn');
	if (exportBtn) {
		exportBtn.addEventListener('click', () => {
			exportBackup();
		});
	}

	const importTriggerBtn = document.getElementById('import-backup-btn');
	const importFileInput = document.getElementById('import-backup-file');
	if (importTriggerBtn && importFileInput) {
		importTriggerBtn.addEventListener('click', () => {
			importFileInput.click();
		});
		importFileInput.addEventListener('change', (e) => {
			importBackup(e);
		});
	}
}

// ----------------------------------------------------
// App Initialisation
// ----------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
	initTheme();
	loadFromLocalStorage();
	bindEvents();
	renderTasks();
	updateDashboard();
	updateCategoriesFilter();
});