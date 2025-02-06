const tournamentStates = {
    all: {
        activeTeams: [],
        groups: Array(6).fill().map(() => []),
        matches: [],
        teamStats: {},
        isFirstGeneration: true,
        numCourts: 6,
        courtNames: {}
    },
    light: {
        activeTeams: [],
        groups: [[]],
        matches: [],
        teamStats: {},
        isFirstGeneration: true,
        numCourts: 3,
        courtNames: {}
    },
    hard: {
        activeTeams: [],
        groups: [[]],
        matches: [],
        teamStats: {},
        isFirstGeneration: true,
        numCourts: 3,
        courtNames: {}
    }
};

let currentTournamentType = 'all';
// Default teams
const defaultTeams = {
    all: [
        // Group A
        "Kotryna & Julija",
        "Brukštienė & Grigaitytė",
        "Ivanova & Plaščynskaitė",
        "Vaiva & Fausta",
        
        // Group B
        "Goda & Julija",
        "Rimgailė & Laima",
        "JuliAna",
        "Ramalė & Julia",
        
        // Group C
        "Gadelkytė & Vaisėtaitė",
        "Bakšytė & Trečiokaitė",
        "Musteikienė & Vileikytė",
        "Savostenok & Šaparauskaitė",
        
        // Group D
        "Ieva & Rūta",
        "Raupelienė & Žalytė",
        "Aistė & Karolina",
        "Milevskaja & Pečkaitė",
        
        // Group E
        "Veda & Agnė",
        "Linos Mokykla",
        "Lyskoit & Suchockaitė",
        "Petrauskė & Drungilienė",
        
        // Group F
        "Teisininkai",
        "Blokelis",
        "Giliun & Vaikutytė",
        "Abukauskaitė & Dzičkovska"
    ],
    light: [
        "Kotryna & Julija",
        "Brukštienė & Grigaitytė",
        "JuliAna",
        "Ramalė & Julia",
        "Musteikienė & Vileikytė",
        "Ieva & Rūta",
        "Raupelienė & Žalytė",
        "Aistė & Karolina",
        "Milevskaja & Pečkaitė",
        "Veda & Agnė",
        "Teisininkai",
        "Blokelis"
    ],
    hard: [
        "Ivanova & Plaščynskaitė",
        "Vaiva & Fausta",
        "Goda & Julija",
        "Rimgailė & Laima",
        "Gadelkytė & Vaisėtaitė",
        "Bakšytė & Trečiokaitė",
        "Savostenok & Šaparauskaitė",
        "Linos Mokykla",
        "Lyskoit & Suchockaitė",
        "Petrauskė & Drungilienė",
        "Giliun & Vaikutytė",
        "Abukauskaitė & Dzičkovska"
    ]
};

const fixedGroups = [
    [ // Group A
        "Kotryna & Julija",
        "Brukštienė & Grigaitytė",
        "Ivanova & Plaščynskaitė",
        "Vaiva & Fausta"
    ],
    [ // Group B
        "Goda & Julija",
        "Rimgailė & Laima",
        "JuliAna",
        "Ramalė & Julia"
    ],
    [ // Group C
        "Gadelkytė & Vaisėtaitė",
        "Bakšytė & Trečiokaitė",
        "Musteikienė & Vileikytė",
        "Savostenok & Šaparauskaitė"
    ],
    [ // Group D
        "Ieva & Rūta",
        "Raupelienė & Žalytė",
        "Aistė & Karolina",
        "Milevskaja & Pečkaitė"
    ],
    [ // Group E
        "Veda & Agnė",
        "Linos Mokykla",
        "Lyskoit & Suchockaitė",
        "Petrauskė & Drungilienė"
    ],
    [ // Group F
        "Teisininkai",
        "Blokelis",
        "Giliun & Vaikutytė",
        "Abukauskaitė & Dzičkovska"
    ]
];

const ruleModalHTML = `
<div id="add-rule-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Add Match Rule</h3>
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Team Position</label>
                <select id="rule-team-position" class="w-full p-2 border rounded">
                    <option value="team1">Team 1</option>
                    <option value="team2">Team 2</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Source Match</label>
                <select id="rule-source-match" class="w-full p-2 border rounded">
                    <!-- Options will be populated dynamically -->
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Team Selection</label>
                <select id="rule-type" class="w-full p-2 border rounded">
                    <option value="winner">Winner</option>
                    <option value="loser">Loser</option>
                </select>
            </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
            <button onclick="closeRuleModal()" class="px-4 py-2 text-gray-600 hover:text-gray-800 rounded">
                Cancel
            </button>
            <button onclick="saveMatchRule()" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Save Rule
            </button>
        </div>
    </div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', ruleModalHTML);

let activeTeams = [];
let groups = Array(6).fill().map(() => []);
let matches = [];
let teamStats = {};
let isFirstGeneration = true;
let selectedTeam = null;
let selectedGroupIndex = null;
let currentRuleMatch = null;

function initializeTournamentSections() {
    return new Promise(resolve => {
        const fullTemplate = document.getElementById('tournament-section-template');
        const simplifiedTemplate = document.getElementById('tournament-section-template-simplified');

        // Initialize 'all' section with full template
        const allContainer = document.getElementById('all-main-tab');
        allContainer.innerHTML = fullTemplate.innerHTML;
        setupEventListeners(allContainer, 'all');

        // Initialize light and hard sections with simplified template
        ['light', 'hard'].forEach(type => {
            const container = document.getElementById(`${type}-main-tab`);
            container.innerHTML = simplifiedTemplate.innerHTML;
            setupSimplifiedEventListeners(container, type);
        });

        resolve();
    });
}

function showRuleModal(type, matchIndex) {
    if (!type || !tournamentStates[type]) {
        console.warn('Invalid tournament type:', type);
        return;
    }

    const modal = document.getElementById('add-rule-modal');
    const sourceMatchSelect = document.getElementById('rule-source-match');
    
    // Set current values
    currentRuleMatch = matchIndex;
    currentTournamentType = type;

    // Populate source match options
    const state = tournamentStates[type];
    sourceMatchSelect.innerHTML = state.matches
        .map((match, index) => {
            if (index === matchIndex) return ''; // Don't allow self-reference
            if (!match.matchNumber) return ''; // Skip matches without numbers
            return `<option value="${match.matchNumber}">Match ${match.matchNumber}</option>`;
        })
        .filter(Boolean)
        .join('');

    modal.classList.remove('hidden');
}

function closeRuleModal() {
    const modal = document.getElementById('add-rule-modal');
    modal.classList.add('hidden');
}

function saveMatchRule() {
    if (!currentRuleMatch || !currentTournamentType) {
        console.warn('No current match or tournament type selected');
        return;
    }

    const state = tournamentStates[currentTournamentType];
    const match = state.matches[currentRuleMatch];
    const teamPosition = document.getElementById('rule-team-position').value;
    const sourceMatch = document.getElementById('rule-source-match').value;
    const ruleType = document.getElementById('rule-type').value;

    // Initialize rules object if it doesn't exist
    if (!match.rules) {
        match.rules = {
            team1Rule: null,
            team2Rule: null
        };
    }

    const rule = {
        sourceMatch: parseInt(sourceMatch),
        type: ruleType
    };

    if (teamPosition === 'team1') {
        match.rules.team1Rule = rule;
    } else {
        match.rules.team2Rule = rule;
    }

    // Apply rules immediately
    applyMatchRules(currentTournamentType);
    
    // Close modal and save state
    closeRuleModal();
    updateMatchesDisplay(currentTournamentType);
    saveToLocalStorage();
}


function applyMatchRules(type) {
    if (!type) {
        console.warn('Tournament type is required');
        return;
    }

    const state = tournamentStates[type];
    if (!state || !state.matches) {
        console.warn(`No valid state or matches found for type: ${type}`);
        return;
    }

    let rulesApplied = false;

    state.matches.forEach(match => {
        if (!match.rules) {
            match.rules = {
                team1Rule: null,
                team2Rule: null
            };
            return;
        }

        if (match.rules.team1Rule) {
            const sourceMatch = state.matches.find(m => m.matchNumber === match.rules.team1Rule.sourceMatch);
            if (sourceMatch && sourceMatch.team1 && sourceMatch.team2 && 
                sourceMatch.score1 !== null && sourceMatch.score2 !== null && 
                sourceMatch.score1 !== sourceMatch.score2) {
                const winner = sourceMatch.score1 > sourceMatch.score2 ? sourceMatch.team1 : sourceMatch.team2;
                const loser = sourceMatch.score1 > sourceMatch.score2 ? sourceMatch.team2 : sourceMatch.team1;
                match.team1 = match.rules.team1Rule.type === 'winner' ? winner : loser;
                rulesApplied = true;
            }
        }

        if (match.rules.team2Rule) {
            const sourceMatch = state.matches.find(m => m.matchNumber === match.rules.team2Rule.sourceMatch);
            if (sourceMatch && sourceMatch.team1 && sourceMatch.team2 && 
                sourceMatch.score1 !== null && sourceMatch.score2 !== null && 
                sourceMatch.score1 !== sourceMatch.score2) {
                const winner = sourceMatch.score1 > sourceMatch.score2 ? sourceMatch.team1 : sourceMatch.team2;
                const loser = sourceMatch.score1 > sourceMatch.score2 ? sourceMatch.team2 : sourceMatch.team1;
                match.team2 = match.rules.team2Rule.type === 'winner' ? winner : loser;
                rulesApplied = true;
            }
        }
    });

    if (rulesApplied) {
        updateMatchesDisplay(type);
        updateStandings(type);
        saveToLocalStorage();
    }
}

function updateMatchTime(type, matchIndex, newTime) {
    const state = tournamentStates[type];
    if (!state || !state.matches[matchIndex]) return;

    // Get the court number and match duration
    const currentMatch = state.matches[matchIndex];
    const courtNumber = currentMatch.court;
    const matchDuration = 20; // 20 minutes per match

    // Set the new time for the current match
    const newStartTime = new Date(`2025-02-01T${newTime}`);
    currentMatch.startTime = newStartTime;

    // Get and sort all matches in the same court
    const courtMatches = state.matches
        .filter(m => m.court === courtNumber)
        .sort((a, b) => state.matches.indexOf(a) - state.matches.indexOf(b));

    // Find the index of the current match
    const courtMatchIndex = courtMatches.findIndex(m => m === currentMatch);

    // Update all subsequent matches to be +20 minutes * their distance from the changed match
    for (let i = courtMatchIndex + 1; i < courtMatches.length; i++) {
        const minutesToAdd = (i - courtMatchIndex) * matchDuration;
        const newMatchTime = new Date(newStartTime);
        newMatchTime.setMinutes(newMatchTime.getMinutes() + minutesToAdd);
        courtMatches[i].startTime = newMatchTime;
    }

    saveToLocalStorage();
    updateMatchesDisplay(type);
}

function setupSimplifiedEventListeners(container, type) {
    // Tab navigation
    container.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            showSubTab(type, action);
        });
    });

    // Team management toggle
    container.querySelector('.toggle-team-management').addEventListener('click', () => {
        toggleTeamManagement(type);
    });

    // Action buttons
    container.querySelector('.random-scores-button').addEventListener('click', () => {
        generateRandomScores(type);
    });
}

function setupEventListeners(container, type) {
    // Tab navigation
    container.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            showSubTab(type, action);
        });
    });

    // Team management toggle
    container.querySelector('.toggle-team-management').addEventListener('click', () => {
        toggleTeamManagement(type);
    });

    // Add team button
    container.querySelector('.add-team-btn').addEventListener('click', () => {
        addTeam(type);
    });

    // Action buttons
    container.querySelector('.generate-button').addEventListener('click', () => {
        toggleTournament(type);
    });

    container.querySelector('.random-scores-button').addEventListener('click', () => {
        generateRandomScores(type);
    });

    container.querySelector('.clear-button').addEventListener('click', () => {
        clearTournamentData(type);
    });

    // Enter key for new team input
    container.querySelector('.new-team-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTeam(type);
        }
    });
}

function splitIntoLightAndHard() {
    const allTeams = tournamentStates.all.activeTeams;
    const allStats = tournamentStates.all.teamStats;
    
    // Sort teams by wins and then point differential
    const sortedTeams = allTeams.sort((a, b) => {
        if (allStats[b].wins !== allStats[a].wins) {
            return allStats[b].wins - allStats[a].wins;
        }
        return allStats[b].differential - allStats[a].differential;
    });

    const midpoint = Math.ceil(sortedTeams.length / 2);
    const hardTeams = sortedTeams.slice(0, midpoint);
    const lightTeams = sortedTeams.slice(midpoint);

    // Update light and hard states
    tournamentStates.light.activeTeams = lightTeams;
    tournamentStates.hard.activeTeams = hardTeams;

    // Reset groups for light and hard
    tournamentStates.light.groups = [[]];
    tournamentStates.hard.groups = [[]];

    // Distribute teams to groups
    distributeTeamsToGroups(tournamentStates.light);
    distributeTeamsToGroups(tournamentStates.hard);

    // Generate new matches for light and hard
   // generateMatches('light');
   // generateMatches('hard');

    // Update displays
    updateGroupsDisplay('light');
    updateGroupsDisplay('hard');
    updateMatchesDisplay('light');
    updateMatchesDisplay('hard');
    updateStandings('light');
    updateStandings('hard');

    // Save to local storage
    saveToLocalStorage();
}

function distributeTeamsToGroups(state) {
    state.groups[0] = [...state.activeTeams];
}

function updateLightHardStandings() {
    const lightContainer = document.querySelector('.light-standings');
    const hardContainer = document.querySelector('.hard-standings');

    if (!lightContainer || !hardContainer) {
        console.warn('Light or Hard standings containers not found. Skipping update.');
        return;
    }

    if (typeof getTeamStandings === 'function') {
        const standings = getTeamStandings();
        
        if (standings.light && standings.light.length > 0) {
            lightContainer.innerHTML = standings.light.map((team, index) => `
                <div class="p-2 bg-gray-100 rounded">
                    ${index + 1}. ${team}
                </div>
            `).join('');
        } else {
            lightContainer.innerHTML = '<div class="p-2">No teams in Light division</div>';
        }
        
        if (standings.hard && standings.hard.length > 0) {
            hardContainer.innerHTML = standings.hard.map((team, index) => `
                <div class="p-2 bg-gray-100 rounded">
                    ${index + 1}. ${team}
                </div>
            `).join('');
        } else {
            hardContainer.innerHTML = '<div class="p-2">No teams in Hard division</div>';
        }
    } else {
        console.error('Function getTeamStandings is not defined');
    }
}

function getTeamStandings() {
    const lightTeams = tournamentStates.light.activeTeams;
    const hardTeams = tournamentStates.hard.activeTeams;
    
    return {
        light: lightTeams,
        hard: hardTeams
    };
}

function distributeTeamsToGroups(state) {
    let teamIndex = 0;
    for (let i = 0; i < state.activeTeams.length; i++) {
    state.groups[teamIndex].push(state.activeTeams[i]);
    teamIndex = (teamIndex + 1) % state.groups.length;
    }
}

// Add these new functions at the top of your script section
function showMainTab(type) {
    currentTournamentType = type;
    
    // Update tab buttons
    document.querySelectorAll('[id$="-main-button"]').forEach(button => {
        button.classList.remove('active-tab');
    });
    document.getElementById(`${type}-main-button`).classList.add('active-tab');

    // Show selected content
    document.querySelectorAll('.main-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${type}-main-tab`).classList.add('active');

    // Update displays
    updateTeamsList(type);
    updateGroupsDisplay(type);
    updateMatchesDisplay(type);
    updateStandings(type);
}

function updateGroupStandings(container, state) {
    // Clear existing content
    container.innerHTML = '';
    
    // Get group template
    const groupTemplate = document.getElementById('group-template');
    const teamRowTemplate = document.getElementById('team-row-template');
    
    // For each group
    state.groups.forEach((groupTeams, groupIndex) => {
        // Skip empty groups
        if (groupTeams.length === 0) return;
        
        // Clone group template
        const groupElement = groupTemplate.content.cloneNode(true);
        
        // Set group number
        groupElement.querySelector('h4').textContent = `Group ${groupIndex + 1}`;
        
        const teamContainer = groupElement.querySelector('.space-y-2');
        
        // Get team stats and sort by wins then differential
        const groupStats = groupTeams
            .map(team => ({
                team,
                ...state.teamStats[team]
            }))
            .sort((a, b) => b.wins - a.wins || b.differential - a.differential);
            
        // Add each team row
        groupStats.forEach((stats, index) => {
            const teamRow = teamRowTemplate.content.cloneNode(true);
            const row = teamRow.querySelector('.grid');
            
            // Format differential with + sign for positive numbers
            const diffText = stats.differential > 0 ? `+${stats.differential}` : stats.differential;
            
            // Replace template variables
            row.innerHTML = row.innerHTML
                .replace('{rank}', index + 1)
                .replace('{team}', stats.team)
                .replace('{wins}', stats.wins)
                .replace('{scored}', stats.pointsScored)
                .replace('{conceded}', stats.pointsConceded)
                .replace('{differential}', diffText);
                
            teamContainer.appendChild(row);
        });
        
        container.appendChild(groupElement);
    });
}

function showSubTab(type, tabName) {
    const mainTab = document.getElementById(`${type}-main-tab`);
    
    // Update tab buttons
    mainTab.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active-tab');
    });
    mainTab.querySelector(`[data-action="${tabName}"]`).classList.add('active-tab');

    // Show selected content
    mainTab.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    mainTab.querySelector(`[data-content="${tabName}"]`).classList.add('active');

    // Update standings if necessary
    if (tabName === 'standings') {
        updateStandings(type);
    }
}

function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show the selected tab content
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Remove the active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active-tab');
    });

    // Add the active class to the selected tab button
    document.getElementById(`${tabName}-button`).classList.add('active-tab');

    // Update standings if the standings tab is selected
    if (tabName === 'standings') {
        updateStandings();
    }
}

function toggleTeamManagement(type) {
    const mainTab = document.getElementById(`${type}-main-tab`);
    const section = mainTab.querySelector('.team-management-section');
    const button = mainTab.querySelector('.toggle-team-management');
    
    if (section.classList.contains('hidden')) {
        section.classList.remove('hidden');
        button.textContent = 'Hide Team Management';
    } else {
        section.classList.add('hidden');
        button.textContent = 'Show Team Management';
    }
}

function generateGroups(type) {
    const state = tournamentStates[type];
    
    if (type === 'all') {
        // Keep existing logic for 'all' tournament type
        state.groups = [...fixedGroups];
    } else {
        // For 'light' and 'hard', put all teams in a single group
        state.groups = [state.activeTeams];
    }

    generateMatches(type);
    updateGroupsDisplay(type);
    updateMatchesDisplay(type);
    updateStandings(type);
}

function getMatchHtml(type, match, overallMatchIndex, availableTeams) {
    const state = tournamentStates[type];
    if (!state) return '';

    return `
        <div class="bg-gray-50 p-3 rounded-lg relative shadow">
            <div class="flex justify-between items-center text-sm text-gray-600 mb-2">
                <span>Court ${match.court}</span>
                <input 
                    type="time" 
                    value="${match.startTime.toTimeString().substring(0, 5)}" 
                    onchange="updateMatchTime('${type}', ${overallMatchIndex}, this.value)"
                    class="border rounded p-1 text-sm"
                >
            </div>
            <div class="space-y-3">
                <div class="flex items-center gap-2">
                    <select
                        class="flex-grow text-sm font-medium border rounded p-1"
                        onchange="updateMatchTeams('${type}', ${overallMatchIndex}, this.value, '${match.team2}')"
                    >
                        <option value="" ${!match.team1 ? 'selected' : ''}>Select team</option>
                        ${availableTeams.map(team => `
                            <option value="${team}" ${team === match.team1 ? 'selected' : ''}>
                                ${team}
                            </option>
                        `).join('')}
                    </select>
                    <input
                        type="number"
                        min="0"
                        value="${match.score1}"
                        onchange="updateScore('${type}', ${overallMatchIndex}, this.value, null)"
                        class="text-center w-20 border rounded p-1"
                        placeholder="Score"
                    >
                </div>
                <div class="flex items-center gap-2">
                    <select
                        class="flex-grow text-sm font-medium border rounded p-1"
                        onchange="updateMatchTeams('${type}', ${overallMatchIndex}, '${match.team1}', this.value)"
                    >
                        <option value="" ${!match.team2 ? 'selected' : ''}>Select team</option>
                        ${availableTeams.map(team => `
                            <option value="${team}" ${team === match.team2 ? 'selected' : ''}>
                                ${team}
                            </option>
                        `).join('')}
                    </select>
                    <input
                        type="number"
                        min="0"
                        value="${match.score2}"
                        onchange="updateScore('${type}', ${overallMatchIndex}, null, this.value)"
                        class="text-center w-20 border rounded p-1"
                        placeholder="Score"
                    >
                </div>
                <input
                    type="text"
                    value="${match.comment || ''}"
                    onchange="updateMatchComment('${type}', ${overallMatchIndex}, this.value)"
                    class="w-full border rounded p-1 text-sm"
                    placeholder="Add a comment (optional)"
                >
                <div class="flex justify-end space-x-2 mt-2">
                    <button
                        onclick="setMatchUnplayed('${type}', ${overallMatchIndex})"
                        class="text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                    >
                        Reset Match
                    </button>
                    <button
                        onclick="removeMatch('${type}', ${overallMatchIndex})"
                        class="text-sm bg-red-500 text-white hover:bg-red-600 px-2 py-1 rounded"
                    >
                        Remove Match
                    </button>
                </div>
            </div>
        </div>
    `;
}


function removeMatch(type, matchIndex) {
    const state = tournamentStates[type];
    
    // Remove the match from the matches array
    state.matches.splice(matchIndex, 1);
    
    // Update displays
    updateMatchesDisplay(type);
    updateStandings(type);
    saveToLocalStorage();
}

function createNewMatch(type, courtNumber) {
    const state = tournamentStates[type];
    const startTime = new Date();
    startTime.setHours(9, 0, 0, 0);

    // Find the last match in this court to set proper start time
    const courtMatches = state.matches.filter(m => m.court === courtNumber);
    if (courtMatches.length > 0) {
        const lastMatch = courtMatches[courtMatches.length - 1];
        const newTime = new Date(lastMatch.startTime);
        newTime.setMinutes(newTime.getMinutes() + 20);
        startTime.setTime(newTime.getTime());
    }

    const newMatch = {
        court: courtNumber,
        team1: "",
        team2: "",
        score1: 0,
        score2: 0,
        startTime: startTime,
        comment: "",
        matchNumber: state.matches.length + 1 // Add default match number
    };

    state.matches.push(newMatch);
    updateMatchesDisplay(type);
    saveToLocalStorage();
}

function updateMatchTeams(type, matchIndex, team1, team2) {
    const state = tournamentStates[type];
    const match = state.matches[matchIndex];
    
    if (!match) return;
    
    // Reset scores when teams change
    match.team1 = team1;
    match.team2 = team2;
    match.score1 = 0;
    match.score2 = 0;
    
    updateMatchesDisplay(type);
    updateStandings(type);
    saveToLocalStorage();
}

function setMatchUnplayed(type, matchIndex) {
    const state = tournamentStates[type];
    const match = state.matches[matchIndex];
    
    if (!match) return;

    // Store original teams to update stats if needed
    const originalTeam1 = match.team1;
    const originalTeam2 = match.team2;
    const originalScore1 = match.score1;
    const originalScore2 = match.score2;

    // Reset match data
    match.score1 = 0;
    match.score2 = 0;

    // Update team stats if necessary
    if (originalTeam1 && originalTeam2 && (originalScore1 > 0 || originalScore2 > 0)) {
        updateTeamStats(type, originalTeam1, originalTeam2, -originalScore1, -originalScore2);
    }

    updateMatchesDisplay(type);
    updateStandings(type);

    match.team1 = '';
    match.team2 = '';
    saveToLocalStorage();
}

function updateTeamStats(type, team1, team2, score1, score2) {
    const state = tournamentStates[type];
    if (!state || !state.teamStats) {
        console.warn(`Invalid state or teamStats for type: ${type}`);
        return;
    }

    // Initialize stats objects if they don't exist
    [team1, team2].forEach(team => {
        if (!state.teamStats[team]) {
            state.teamStats[team] = {
                wins: 0,
                pointsScored: 0,
                pointsConceeded: 0,
                differential: 0
            };
        }
    });

    // Update team 1 stats
    state.teamStats[team1].pointsScored += score1;
    state.teamStats[team1].pointsConceeded += score2;
    if (score1 > score2) {
        state.teamStats[team1].wins += 1;
    }

    // Update team 2 stats
    state.teamStats[team2].pointsScored += score2;
    state.teamStats[team2].pointsConceeded += score1;
    if (score2 > score1) {
        state.teamStats[team2].wins += 1;
    }

    // Update differentials
    state.teamStats[team1].differential = 
        state.teamStats[team1].pointsScored - state.teamStats[team1].pointsConceeded;
    state.teamStats[team2].differential = 
        state.teamStats[team2].pointsScored - state.teamStats[team2].pointsConceeded;

    // Ensure wins and points don't go below 0
    [team1, team2].forEach(team => {
        state.teamStats[team].wins = Math.max(0, state.teamStats[team].wins);
        state.teamStats[team].pointsScored = Math.max(0, state.teamStats[team].pointsScored);
        state.teamStats[team].pointsConceeded = Math.max(0, state.teamStats[team].pointsConceeded);
    });
}

// Also need to update the setMatchUnplayed function to properly use this
function setMatchUnplayed(type, matchIndex) {
    const state = tournamentStates[type];
    const match = state.matches[matchIndex];
    
    if (!match) return;

    // Store original values to update stats
    const originalTeam1 = match.team1;
    const originalTeam2 = match.team2;
    const originalScore1 = match.score1;
    const originalScore2 = match.score2;

    // If there were scores, subtract them from team stats
    if (originalTeam1 && originalTeam2 && (originalScore1 > 0 || originalScore2 > 0)) {
        updateTeamStats(type, originalTeam1, originalTeam2, -originalScore1, -originalScore2);
    }

    // Reset match data
    match.score1 = 0;
    match.score2 = 0;
    match.team1 = '';
    match.team2 = '';

    // Update displays
    updateMatchesDisplay(type);
    updateStandings(type);
    saveToLocalStorage();
}

function toggleTournament(type) {
    const state = tournamentStates[type];

    if (state.isFirstGeneration) {
    state.activeTeams = [...defaultTeams[type]];
    state.isFirstGeneration = false;
    }

    state.teamStats = {};
    state.activeTeams.forEach(team => {
    state.teamStats[team] = {
        wins: 0,
        pointsScored: 0,
        pointsConceded: 0,
        differential: 0
    };
    });

    generateGroups(type);
    updateTeamsList(type);
    updateGroupsDisplay(type);
    updateMatchesDisplay(type);
    updateStandings(type);

    // Reset light and hard divisions when starting a new 'all' tournament
    if (type === 'all') {
    ['light', 'hard'].forEach(divType => {
        tournamentStates[divType] = {
            activeTeams: [],
            groups: [[]],
            matches: [],
            teamStats: {},
            isFirstGeneration: true
        };
        updateGroupsDisplay(divType);
        updateMatchesDisplay(divType);
        updateStandings(divType);
    });
    }

    saveToLocalStorage();
}

function addTeam(type) {
const mainTab = document.getElementById(`${type}-main-tab`);
const input = mainTab.querySelector('.new-team-input');
const teamName = input.value.trim();

if (teamName && !tournamentStates[type].activeTeams.includes(teamName)) {
    tournamentStates[type].activeTeams.push(teamName);
    input.value = '';
    updateTeamsList(type);
    initializeTeamStats(type);
    generateGroups(type);
    saveToLocalStorage();
}
}

function initializeTeamStats(type) {
const state = tournamentStates[type];
if (!state) return;

state.teamStats = {};
state.activeTeams.forEach(team => {
    state.teamStats[team] = {
        wins: 0,
        pointsScored: 0,
        pointsConceded: 0,
        differential: 0
    };
});
}

function reshuffleTeams(type) {
const state = tournamentStates[type];
const numCourts = type === 'all' ? 6 : 3;

let teams = [...state.activeTeams];
for (let i = teams.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [teams[i], teams[j]] = [teams[j], teams[i]];
}
state.activeTeams = teams;

const teamsPerGroup = Math.floor(teams.length / numCourts);
const extraTeams = teams.length % numCourts;

state.groups = Array(numCourts).fill().map((_, index) => {
    const startIndex = index * teamsPerGroup + Math.min(index, extraTeams);
    const groupSize = teamsPerGroup + (index < extraTeams ? 1 : 0);
    return teams.slice(startIndex, startIndex + groupSize);
});

initializeTeamStats(type);
updateTeamsList(type);
updateGroupsDisplay(type);
generateMatches(type);
updateMatchesDisplay(type);
updateStandings(type);
saveToLocalStorage();
}

function removeTeam(type, teamName) {
    const state = tournamentStates[type];
    
    // Remove from active teams
    state.activeTeams = state.activeTeams.filter(team => team !== teamName);
    
    // Remove from groups
    state.groups = state.groups.map(group => 
        group.filter(team => team !== teamName)
    );
    
    // Remove matches involving this team
    state.matches = state.matches.filter(match => 
        match.team1 !== teamName && match.team2 !== teamName
    );
    
    // Remove team stats
    delete state.teamStats[teamName];
    
    // Update displays
    updateTeamsList(type);
    updateGroupsDisplay(type);
    updateMatchesDisplay(type);
    updateStandings(type);
    saveToLocalStorage();
}
function updateTeamsList(type) {
    const mainTab = document.getElementById(`${type}-main-tab`);
    if (!mainTab) {
        console.warn(`Main tab for ${type} not found`);
        return;
    }

    const container = mainTab.querySelector('.teams-list');
    if (!container) {
        console.warn(`Teams list container for ${type} not found`);
        return;
    }
    
    container.innerHTML = tournamentStates[type].activeTeams.map(team => `
        <div class="flex justify-between items-center p-2 bg-gray-100 rounded">
            <span class="flex-grow">${team}</span>
            <button 
                onclick="removeTeam('${type}', '${team}')" 
                class="text-red-500 hover:text-red-700 px-2"
            >×</button>
        </div>
    `).join('');
}

function generateRandomScores(type) {
    const state = tournamentStates[type];
    state.matches.forEach(match => {
        while (true) {
            const score1 = Math.floor(Math.random() * 22);
            const score2 = Math.floor(Math.random() * 22);

            if ((score1 === 21 && score1 - score2 >= 2) || 
                (score2 === 21 && score2 - score1 >= 2)) {
                match.score1 = score1;
                match.score2 = score2;
                break;
            }
        }
    });

    updateMatchesDisplay(type);
    updateStandings(type);
    saveToLocalStorage();
    }

    function generateMatches(type) {
        if (!type || !tournamentStates[type]) return;
    
        const state = tournamentStates[type];
        state.matches = [];
        const matchDuration = 20;
    
        if (type === 'all') {
            // Keep existing logic for 'all' tournament type
            state.groups.forEach((group, courtIndex) => {
                if (group.length >= 2) {
                    for (let i = 0; i < group.length; i++) {
                        for (let j = i + 1; j < group.length; j++) {
                            state.matches.push({
                                court: courtIndex + 1,
                                team1: group[i],
                                team2: group[j],
                                score1: 0,
                                score2: 0,
                                startTime: new Date()
                            });
                        }
                    }
                }
            });
        } else {
            // For 'light' and 'hard', create round-robin matches for single group
            const teams = state.groups[0];
            for (let i = 0; i < teams.length; i++) {
                for (let j = i + 1; j < teams.length; j++) {
                    state.matches.push({
                        court: 1, // All matches on single court
                        team1: teams[i],
                        team2: teams[j],
                        score1: 0,
                        score2: 0,
                        startTime: new Date()
                    });
                }
            }
        }
    
        // Set match times
        const startTime = new Date();
        startTime.setHours(9, 0, 0, 0);
    
        state.matches.forEach((match, index) => {
            const matchTime = new Date(startTime);
            matchTime.setMinutes(matchTime.getMinutes() + (index * matchDuration));
            match.startTime = new Date(matchTime);
        });
    }
    function updateGroupsDisplay(type) {
        const mainTab = document.getElementById(`${type}-main-tab`);
        const container = mainTab.querySelector('.groups-container');
        const state = tournamentStates[type];
    
        if (type === 'all') {
            // Keep existing display logic for 'all' tournament type
            container.innerHTML = state.groups.map((groupTeams, groupIndex) => `
                <div class="border rounded-lg p-4">
                    <h3 class="font-semibold mb-2">Court ${groupIndex + 1}</h3>
                    <ul class="space-y-2">
                        ${groupTeams.map(team => `
                            <li class="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span>${team}</span>
                                <button 
                                    onclick="showSwitchTeamModal('${team}', ${groupIndex})" 
                                    class="text-blue-500 hover:text-blue-700 text-sm px-2 py-1 rounded border border-blue-500 hover:border-blue-700"
                                >
                                    Switch Group
                                </button>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `).join('');
        } else {
            const allRankings = getAllRankings(tournamentStates.all.teamStats);
            container.innerHTML = `
            <div class="border rounded-lg p-4 col-span-full">
                <h3 class="font-semibold mb-2">${type.charAt(0).toUpperCase() + type.slice(1)} Division Teams</h3>
                <ul class="space-y-2 teams-list"> 
                ${state.activeTeams.map(team => {
                    const previousRank = allRankings[team];
                    const stats = tournamentStates.all.teamStats[team];
                    return `
                        <li class="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div class="flex items-center gap-4">
                                <span class="font-medium">${team}</span>
                                <span class="text-sm text-gray-600">
                                    (Previous rank: #${previousRank}, ${stats.wins} wins, Diff: ${stats.differential > 0 ? '+' : ''}${stats.differential})
                                </span>
                                
                            </div>
                            <button
                        onclick="switchTeamDivision('${type}', '${team}')"
                        class="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                        Move to ${type === 'light' ? 'Hard' : 'Light'}
                    </button>
                        </li>
                    `;
                }).join('')}
                </ul>
            </div>
            `;
            
        }
    }

    function switchTeamDivision(fromType, team) {
        const toType = fromType === 'light' ? 'hard' : 'light';
        
        // Remove team from current division
        tournamentStates[fromType].activeTeams = tournamentStates[fromType].activeTeams.filter(t => t !== team);
        tournamentStates[fromType].groups[0] = tournamentStates[fromType].groups[0].filter(t => t !== team);
        
        // Add team to new division
        tournamentStates[toType].activeTeams.push(team);
        tournamentStates[toType].groups[0].push(team);
        
        // Move team stats
        if (tournamentStates[fromType].teamStats[team]) {
          tournamentStates[toType].teamStats[team] = tournamentStates[fromType].teamStats[team];
          delete tournamentStates[fromType].teamStats[team];
        }
        
        // Update displays
        updateGroupsDisplay('light');
        updateGroupsDisplay('hard');
        updateMatchesDisplay('light');
        updateMatchesDisplay('hard');
        updateStandings('light');
        updateStandings('hard');
        
        // Save to local storage
        saveToLocalStorage();
      }

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function updateMatchesDisplay(type) {
    const mainTab = document.getElementById(`${type}-main-tab`);
    if (!mainTab) return;
    
    const container = mainTab.querySelector('.matches-container');
    if (!container) return;
    
    const state = tournamentStates[type];
    if (!state || !state.matches) return;

    const courtSections = {};
    state.matches.forEach(match => {
        if (!courtSections[match.court]) {
            courtSections[match.court] = [];
        }
        courtSections[match.court].push(match);
    });

    container.innerHTML = `
    ${type !== 'all' ? `
    <div class="flex justify-end mb-4">
        <button 
            onclick="addCourt('${type}')"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
            Add New Court
        </button>
    </div>
    ` : ''}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${Array.from({ length: state.numCourts }, (_, i) => i + 1).map(courtNumber => `
            <div class="court-section">
                <div class="flex justify-between items-center mb-4">
                    <div class="flex items-center gap-2">
                        <input
                            type="text"
                            value="${state.courtNames[courtNumber] || `Court ${courtNumber}`}"
                            onchange="updateCourtName('${type}', ${courtNumber}, this.value)"
                            class="border rounded px-2 py-1 text-sm w-40"
                        >
                    </div>
                    <button 
                        onclick="createNewMatch('${type}', ${courtNumber})"
                        class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                    >
                        Add Match
                    </button>
                </div>
                <div class="space-y-4">
                    ${(courtSections[courtNumber] || []).map((match) => {
                        const overallMatchIndex = state.matches.findIndex(m => m === match);
                        return getSimplifiedMatchHtml(type, match, overallMatchIndex, state.activeTeams);
                    }).join('')}
                </div>
            </div>
        `).join('')}
    </div>
`;
}


function getSimplifiedMatchHtml(type, match, overallMatchIndex, availableTeams) {
    // Ensure rules object exists
    if (!match.rules) {
        match.rules = {
            team1Rule: null,
            team2Rule: null
        };
    }

    const ruleInfo = [];
    if (match.rules.team1Rule) {
        const ruleType = match.rules.team1Rule.type === 'winner' ? 'Winner' : 'Loser';
        ruleInfo.push(`
            <div class="flex justify-between items-center">
                <span>Team 1: ${ruleType} of Match ${match.rules.team1Rule.sourceMatch}</span>
                <button 
                    onclick="removeRule('${type}', ${overallMatchIndex}, 'team1')"
                    class="text-red-500 hover:text-red-700 text-sm px-2"
                >
                    ×
                </button>
            </div>
        `);
    }
    if (match.rules.team2Rule) {
        const ruleType = match.rules.team2Rule.type === 'winner' ? 'Winner' : 'Loser';
        ruleInfo.push(`
            <div class="flex justify-between items-center">
                <span>Team 2: ${ruleType} of Match ${match.rules.team2Rule.sourceMatch}</span>
                <button 
                    onclick="removeRule('${type}', ${overallMatchIndex}, 'team2')"
                    class="text-red-500 hover:text-red-700 text-sm px-2"
                >
                    ×
                </button>
            </div>
        `);
    }

    const ruleDisplay = ruleInfo.length > 0 
        ? `<div class="text-sm text-gray-600 mt-2 p-2 bg-gray-100 rounded space-y-1">
             ${ruleInfo.join('')}
           </div>`
        : '';

    return `
        <div class="bg-gray-50 p-3 rounded-lg relative shadow">
            <div class="flex justify-between items-center text-sm text-gray-600 mb-2">
                <div class="flex items-center gap-2">
                    <span>Match</span>
                    <input 
                        type="number" 
                        value="${match.matchNumber}"
                        min="1"
                        onchange="updateMatchNumber('${type}', ${overallMatchIndex}, this.value)"
                        class="w-16 border rounded p-1 text-sm"
                    >
                </div>
                <input 
                    type="time" 
                    value="${match.startTime.toTimeString().substring(0, 5)}" 
                    onchange="updateMatchTime('${type}', ${overallMatchIndex}, this.value)"
                    class="border rounded p-1 text-sm"
                >
            </div>
            <div class="space-y-3">
                <div class="flex items-center gap-2">
                    <select
                        class="flex-grow text-sm font-medium border rounded p-1"
                        onchange="updateMatchTeams('${type}', ${overallMatchIndex}, this.value, '${match.team2}')"
                        ${match.rules.team1Rule ? 'disabled' : ''}
                    >
                        <option value="" ${!match.team1 ? 'selected' : ''}>Select team</option>
                        ${availableTeams.map(team => `
                            <option value="${team}" ${team === match.team1 ? 'selected' : ''}>
                                ${team}
                            </option>
                        `).join('')}
                    </select>
                    <input
                        type="number"
                        min="0"
                        value="${match.score1}"
                        onchange="updateScore('${type}', ${overallMatchIndex}, this.value, null)"
                        class="text-center w-20 border rounded p-1"
                        placeholder="Score"
                    >
                </div>
                <div class="flex items-center gap-2">
                    <select
                        class="flex-grow text-sm font-medium border rounded p-1"
                        onchange="updateMatchTeams('${type}', ${overallMatchIndex}, '${match.team1}', this.value)"
                        ${match.rules.team2Rule ? 'disabled' : ''}
                    >
                        <option value="" ${!match.team2 ? 'selected' : ''}>Select team</option>
                        ${availableTeams.map(team => `
                            <option value="${team}" ${team === match.team2 ? 'selected' : ''}>
                                ${team}
                            </option>
                        `).join('')}
                    </select>
                    <input
                        type="number"
                        min="0"
                        value="${match.score2}"
                        onchange="updateScore('${type}', ${overallMatchIndex}, null, this.value)"
                        class="text-center w-20 border rounded p-1"
                        placeholder="Score"
                    >
                </div>
                ${ruleDisplay}
                <input
                    type="text"
                    value="${match.comment || ''}"
                    onchange="updateMatchComment('${type}', ${overallMatchIndex}, this.value)"
                    class="w-full border rounded p-1 text-sm"
                    placeholder="Add a comment (optional)"
                >
                <div class="flex justify-end space-x-2 mt-2">
                    <button
                        onclick="showRuleModal('${type}', ${overallMatchIndex})"
                        class="text-sm bg-blue-500 text-white hover:bg-blue-600 px-2 py-1 rounded"
                    >
                        Add Rule
                    </button>
                    <button
                        onclick="setMatchUnplayed('${type}', ${overallMatchIndex})"
                        class="text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                    >
                        Reset Match
                    </button>
                    <button
                        onclick="removeMatch('${type}', ${overallMatchIndex})"
                        class="text-sm bg-red-500 text-white hover:bg-red-600 px-2 py-1 rounded"
                    >
                        Remove Match
                    </button>
                </div>
            </div>
        </div>
    `;
}


function updateMatchNumber(type, matchIndex, newNumber) {
    const state = tournamentStates[type];
    if (!state || !state.matches[matchIndex]) return;

    state.matches[matchIndex].matchNumber = parseInt(newNumber);
    saveToLocalStorage();
}

function updateCourtName(type, courtNumber, newName) {
    const state = tournamentStates[type];
    state.courtNames[courtNumber] = newName;
    saveToLocalStorage();
}

function addCourt(type) {
    const state = tournamentStates[type];
    state.numCourts++;
    saveToLocalStorage();
    updateMatchesDisplay(type);
}

function updateScore(type, matchIndex, score1, score2) {
    const state = tournamentStates[type];
    const match = state.matches[matchIndex];

    if (!match) return;

    if (match.team1 === '' || match.team2 === '') return;

    if (score1 !== null) match.score1 = parseInt(score1) || 0;
    if (score2 !== null) match.score2 = parseInt(score2) || 0;

    [match.team1, match.team2].forEach(team => {
        if (!state.teamStats[team]) {
            state.teamStats[team] = { wins: 0, pointsScored: 0, pointsConceded: 0, differential: 0 };
        }
    });

    state.teamStats[match.team1].pointsScored += match.score1;
    state.teamStats[match.team1].pointsConceded += match.score2;
    state.teamStats[match.team2].pointsScored += match.score2;
    state.teamStats[match.team2].pointsConceded += match.score1;

    if (match.score1 > match.score2) {
        state.teamStats[match.team1].wins += 1;
    } else if (match.score2 > match.score1) {
        state.teamStats[match.team2].wins += 1;
    }

    [match.team1, match.team2].forEach(team => {
        state.teamStats[team].differential = 
            state.teamStats[team].pointsScored - state.teamStats[team].pointsConceded;
    });

    updateMatchesDisplay(type);
    updateStandings(type);
    saveToLocalStorage();
    applyMatchRules(type);
}

function updateStandings(type) {
    const mainTab = document.getElementById(`${type}-main-tab`);
    if (!mainTab) return;

    const winsContainer = mainTab.querySelector('.wins-standings');
    const diffContainer = mainTab.querySelector('.differential-standings');
    const groupsContainer = mainTab.querySelector('.group-standings');
    if (!winsContainer || !diffContainer || !groupsContainer) return;

    const state = tournamentStates[type];
    if (!state) return;

    // Initialize stats for all active teams
    state.activeTeams.forEach(team => {
        if (!state.teamStats[team]) {
            state.teamStats[team] = {
                wins: 0,
                pointsScored: 0,
                pointsConceeded: 0,
                differential: 0
            };
        }
    });

    // Reset and recalculate stats for all teams involved in matches
    const teamsInMatches = new Set();
    state.matches.forEach(match => {
        if (match.team1) teamsInMatches.add(match.team1);
        if (match.team2) teamsInMatches.add(match.team2);
    });

    [...teamsInMatches].forEach(team => {
        if (!state.teamStats[team]) {
            state.teamStats[team] = {
                wins: 0,
                pointsScored: 0,
                pointsConceeded: 0,
                differential: 0
            };
        } else {
            // Reset existing stats
            state.teamStats[team] = {
                wins: 0,
                pointsScored: 0,
                pointsConceeded: 0,
                differential: 0
            };
        }
    });

    // Calculate all stats
    state.matches.forEach(match => {
        if (!match.team1 || !match.team2) return; // Skip matches without both teams assigned

        if (match.score1 !== null && match.score2 !== null) {
            state.teamStats[match.team1].pointsScored += match.score1;
            state.teamStats[match.team1].pointsConceeded += match.score2;
            state.teamStats[match.team2].pointsScored += match.score2;
            state.teamStats[match.team2].pointsConceeded += match.score1;

            if (match.score1 > match.score2) {
                state.teamStats[match.team1].wins += 1;
            } else if (match.score2 > match.score1) {
                state.teamStats[match.team2].wins += 1;
            }
        }
    });

    // Calculate differentials
    Object.keys(state.teamStats).forEach(team => {
        state.teamStats[team].differential = 
            state.teamStats[team].pointsScored - state.teamStats[team].pointsConceeded;
    });

    // Sort by wins first, then by point differential
    const winsSorted = Object.entries(state.teamStats)
        .sort(([, a], [, b]) => {
            if (b.wins !== a.wins) {
                return b.wins - a.wins;
            }
            return b.differential - a.differential;
        });

    // Update wins standings
    winsContainer.innerHTML = winsSorted.map(([team, stats], index) => `
        <div class="flex justify-between items-center p-2 bg-gray-100 rounded">
            <span>${index + 1}. ${team}</span>
            <div class="flex items-center gap-4">
                <span class="font-semibold">${stats.wins} wins</span>
                <span class="text-sm">
                    (Diff: ${stats.differential > 0 ? '+' : ''}${stats.differential})
                </span>
            </div>
        </div>
    `).join('');

    // Sort by differential only for differential standings
    const diffSorted = Object.entries(state.teamStats)
        .sort(([, a], [, b]) => b.differential - a.differential);

    // Update differential standings
    diffContainer.innerHTML = diffSorted.map(([team, stats], index) => `
        <div class="grid grid-cols-4 items-center p-2 bg-gray-100 rounded gap-2">
            <span>${index + 1}. ${team}</span>
            <span class="text-green-600">Scored: ${stats.pointsScored}</span>
            <span class="text-red-600">Conceded: ${stats.pointsConceeded}</span>
            <span class="font-semibold text-right">
                Diff: ${stats.differential > 0 ? '+' : ''}${stats.differential}
            </span>
        </div>
    `).join('');

    // Update group standings
    groupsContainer.innerHTML = state.groups.map((groupTeams, groupIndex) => {
        const groupStats = groupTeams
            .map(team => ({
                team,
                ...state.teamStats[team]
            }))
            .sort((a, b) => {
                if (b.wins !== a.wins) {
                    return b.wins - a.wins;
                }
                return b.differential - a.differential;
            });

        if (groupTeams.length === 0) return ''; // Skip empty groups

        return `
            <div class="bg-white rounded-lg p-4 border mb-4">
                <h3 class="font-semibold mb-2">Group ${groupIndex + 1}</h3>
                ${groupStats.map((stats, index) => `
                    <div class="flex justify-between items-center p-2 bg-gray-100 rounded">
                        <span>${index + 1}. ${stats.team}</span>
                        <span class="font-semibold">${stats.wins} wins</span>
                        <span class="text-green-600">Scored: ${stats.pointsScored}</span>
                        <span class="text-red-600">Conceded: ${stats.pointsConceeded}</span>
                        <span class="font-semibold text-right">
                            Diff: ${stats.differential > 0 ? '+' : ''}${stats.differential}
                        </span>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

function showSwitchTeamModal(team, currentGroupIndex) {
    selectedTeam = team;
    selectedGroupIndex = currentGroupIndex;

    const modal = document.getElementById('switch-team-modal');
    const teamSpan = document.getElementById('selected-team');
    const groupSelect = document.getElementById('new-group-select');

    teamSpan.textContent = team;

    // Populate group options
    groupSelect.innerHTML = groups.map((group, index) => 
        index !== currentGroupIndex ? 
        `<option value="${index}">Court ${index + 1}</option>` : 
        ''
    ).join('');

    modal.classList.remove('hidden');
}

function closeSwitchTeamModal() {
    const modal = document.getElementById('switch-team-modal');
    modal.classList.add('hidden');
    selectedTeam = null;
    selectedGroupIndex = null;
}

function getAllRankings(teamStats) {
    if (!teamStats) return {};

    // Sort teams by wins and then point differential
    const sortedTeams = Object.entries(teamStats)
        .sort(([, a], [, b]) => {
            if (b.wins !== a.wins) {
                return b.wins - a.wins;
            }
            return b.differential - a.differential;
        });

    // Create a ranking map
    const rankings = {};
    sortedTeams.forEach(([team], index) => {
        rankings[team] = index + 1;
    });

    return rankings;
}

function switchTeamGroup() {
    if (!selectedTeam || !currentTournamentType) return;

    const newGroupIndex = parseInt(document.getElementById('new-group-select').value);
    const state = tournamentStates[currentTournamentType];

    state.groups[selectedGroupIndex] = state.groups[selectedGroupIndex].filter(team => team !== selectedTeam);
    state.groups[newGroupIndex].push(selectedTeam);

    generateMatches(currentTournamentType);
    updateGroupsDisplay(currentTournamentType);
    updateMatchesDisplay(currentTournamentType);
    updateStandings(currentTournamentType);
    saveToLocalStorage();

    closeSwitchTeamModal();
}

function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('moteru-turnyras');
        if (!savedData) return false;

        const loadedData = JSON.parse(savedData);

        ['all', 'light', 'hard'].forEach(type => {
            // First check if the main tab exists before trying to update
            const mainTab = document.getElementById(`${type}-main-tab`);
            if (!mainTab) return; // Skip this iteration if tab doesn't exist

            // Initialize state
            if (!loadedData[type]) {
                loadedData[type] = {
                    activeTeams: [],
                    groups: Array(type === 'all' ? 6 : 3).fill().map(() => []),
                    matches: [],
                    teamStats: {},
                    isFirstGeneration: true,
                    numCourts: type === 'all' ? 6 : 3,
                    courtNames: {}
                };
            }

            // Ensure match data is properly initialized
            const matches = (loadedData[type].matches || []).map(match => ({
                court: match.court,
                team1: match.team1 || '', // Convert null to empty string
                team2: match.team2 || '', // Convert null to empty string
                score1: match.score1 || 0,
                score2: match.score2 || 0,
                startTime: new Date(match.startTime),
                comment: match.comment || '',
                matchNumber: match.matchNumber || (index + 1) ,
                rules: {
                    team1Rule: match.rules?.team1Rule || null,
                    team2Rule: match.rules?.team2Rule || null
                }
            }));

            tournamentStates[type] = {
                ...loadedData[type],
                matches: matches,
                teamStats: loadedData[type].teamStats || {},
                numCourts: loadedData[type].numCourts || (type === 'all' ? 6 : 3),
                courtNames: loadedData[type].courtNames || {}
            };

            // Only update displays if the containers exist
            if (mainTab.querySelector('.teams-list')) updateTeamsList(type);
            if (mainTab.querySelector('.groups-container')) updateGroupsDisplay(type);
            if (mainTab.querySelector('.matches-container')) updateMatchesDisplay(type);
            if (mainTab.querySelector('.wins-standings')) updateStandings(type);
        });

        return true;
    } catch (error) {
        console.error('Error loading saved data:', error);
        return false;
    }
}

function removeRule(type, matchIndex, teamPosition) {
    const state = tournamentStates[type];
    const match = state.matches[matchIndex];
    
    if (!match || !match.rules) return;
    
    if (teamPosition === 'team1') {
        match.rules.team1Rule = null;
    } else if (teamPosition === 'team2') {
        match.rules.team2Rule = null;
    }
    
    updateMatchesDisplay(type);
    saveToLocalStorage();
}

function updateDisplay(type) {
    const mainTab = document.getElementById(`${type}-main-tab`);
    if (!mainTab) return;
    
    updateTeamsList(type);
    updateGroupsDisplay(type);
    updateMatchesDisplay(type);
    updateStandings(type);
}

function saveToLocalStorage() {
    const dataToSave = {};
    Object.entries(tournamentStates).forEach(([type, state]) => {
        dataToSave[type] = {
            ...state,
            matches: state.matches.map(match => ({
                ...match,
                startTime: match.startTime.toISOString(),
                matchNumber: match.matchNumber,
                rules: match.rules || { team1Rule: null, team2Rule: null }  // Ensure rules are saved
            })),
            numCourts: state.numCourts || (type === 'all' ? 6 : 3),
            courtNames: state.courtNames || {}
        };
    });

    localStorage.setItem('moteru-turnyras', JSON.stringify(dataToSave));
}
function clearTournamentData() {
    ['all', 'light', 'hard'].forEach(type => {
        tournamentStates[type] = {
            activeTeams: [],
            groups: Array(type === 'all' ? 6 : 3).fill().map(() => []),
            matches: [],
            teamStats: {},
            isFirstGeneration: true,
            numCourts: type === 'all' ? 6 : 3,
            courtNames: {}
        };

        updateTeamsList(type);
        updateGroupsDisplay(type);
        updateMatchesDisplay(type);
        updateStandings(type);
    });

    saveToLocalStorage();
}

function createNewMatch(type, courtNumber) {
    const state = tournamentStates[type];
    const startTime = new Date();
    startTime.setHours(9, 0, 0, 0);

    const courtMatches = state.matches.filter(m => m.court === courtNumber);
    if (courtMatches.length > 0) {
        const lastMatch = courtMatches[courtMatches.length - 1];
        const newTime = new Date(lastMatch.startTime);
        newTime.setMinutes(newTime.getMinutes() + 20);
        startTime.setTime(newTime.getTime());
    }

    const newMatch = {
        court: courtNumber,
        team1: "",
        team2: "",
        score1: 0,
        score2: 0,
        startTime: startTime,
        comment: "",
        matchNumber: state.matches.length + 1,
        rules: {
            team1Rule: null, // { sourceMatch: number, type: 'winner'|'loser' }
            team2Rule: null
        }
    };

    state.matches.push(newMatch);
    updateMatchesDisplay(type);
    saveToLocalStorage();
}


function updateMatchComment(type, matchIndex, comment) {
    const state = tournamentStates[type];
    const match = state.matches[matchIndex];
    if (!match) return;
    
    match.comment = comment;
    saveToLocalStorage();
}

function exportTournamentData() {
    const data = {
        tournamentStates,
        currentTournamentType
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tournament_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importTournamentData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Restore dates for matches
            Object.keys(data.tournamentStates).forEach(type => {
                data.tournamentStates[type].matches = data.tournamentStates[type].matches.map(match => ({
                    ...match,
                    startTime: new Date(match.startTime)
                }));
            });

            // Update global state
            Object.assign(tournamentStates, data.tournamentStates);
            currentTournamentType = data.currentTournamentType;

            // Update displays
            showMainTab(currentTournamentType);
            ['all', 'light', 'hard'].forEach(type => {
                updateTeamsList(type);
                updateGroupsDisplay(type);
                updateMatchesDisplay(type);
                updateStandings(type);
            });

            saveToLocalStorage();
            alert('Tournament data imported successfully');
        } catch (error) {
            console.error('Error importing data:', error);
            alert('Error importing tournament data');
        }
    };
    reader.readAsText(file);
}

document.addEventListener('DOMContentLoaded', async () => {
    // First initialize the tournament sections
    await initializeTournamentSections();

    // Add a small delay to ensure DOM elements are ready
    setTimeout(() => {
        // Then try to load saved data
        const loaded = loadFromLocalStorage();
        if (!loaded) {
            // If no saved data, initialize new tournaments
            Object.keys(tournamentStates).forEach(type => {
                toggleTournament(type);
            });
        }

        // Set up split button event listener
        const splitButton = document.getElementById('split-teams-button');
        if (splitButton) {
            splitButton.addEventListener('click', () => {
                if (typeof splitIntoLightAndHard === 'function') {
                    splitIntoLightAndHard();
                    updateLightHardStandings();
                } else {
                    console.error('Function splitIntoLightAndHard is not defined');
                }
            });
        }
    }, 100); // Small delay to ensure DOM is ready
});