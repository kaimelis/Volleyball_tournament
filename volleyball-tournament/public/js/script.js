const tournamentStates = {
    all: {
        activeTeams: [],
        groups: Array(6).fill().map(() => []),
        matches: [],
        bracketMatches: {
            winners: [],
            losers: []
        },
        teamStats: {},
        isFirstGeneration: true
    },
    light: {
        activeTeams: [],
        groups: Array(3).fill().map(() => []),
        matches: [],
        bracketMatches: {
            winners: [],
            losers: []
        },
        teamStats: {},
        isFirstGeneration: true
    },
    hard: {
        activeTeams: [],
        groups: Array(3).fill().map(() => []),
        matches: [],
        bracketMatches: {
            winners: [],
            losers: []
        },
        teamStats: {},
        isFirstGeneration: true
    }
};

let currentTournamentType = 'all';
// Default teams
const defaultTeams = {
    all: [
        "Spike Masters", "Beach Kings", "Sand Storm", "Wave Riders",
        "Net Ninjas", "Coastal Crew", "Sun Setters", "Beach Blast",
        "Sand Devils", "Ocean's 6", "Tidal Force", "Palm Beach",
        "Sandy Aces", "Beach Breakers", "Surf Squad", "Volleyball Vic's",
        "Sea Smashers", "Coast Guards", "Beach Bros", "Sand Stars", 
        "Wave Warriors", "Beach Legends", "Net Nobles", "Sand Sharks"
    ],
    light: [
        "Spike Masters", "Beach Kings", "Sand Storm", "Wave Riders",
        "Net Ninjas", "Coastal Crew", "Sun Setters", "Beach Blast",
        "Sand Devils", "Ocean's 6", "Tidal Force", "Palm Beach"
    ],
    hard: [
        "Sandy Aces", "Beach Breakers", "Surf Squad", "Volleyball Vic's",
        "Sea Smashers", "Coast Guards", "Beach Bros", "Sand Stars", 
        "Wave Warriors", "Beach Legends", "Net Nobles", "Sand Sharks"
    ]
};


let activeTeams = [];
let groups = Array(6).fill().map(() => []);
let matches = [];
let teamStats = {};
let isFirstGeneration = true;
let selectedTeam = null;
let selectedGroupIndex = null;

function initializeTournamentSections() {
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
}

function updateMatchTime(type, matchIndex, newTime) {
    const state = tournamentStates[type];
    if (!state || !state.matches[matchIndex]) return;
    state.matches[matchIndex].startTime = new Date(`2025-02-01T${newTime}`);
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

    container.querySelector('.clear-button').addEventListener('click', () => {
        clearTournamentData(type);
    });

    container.querySelector('.generate-bracket-button').addEventListener('click', () => {
        generateBracket(type);
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

    container.querySelector('.reshuffle-button').addEventListener('click', () => {
        reshuffleTeams(type);
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
    container.querySelector('.generate-bracket-button').addEventListener('click', () => {
        generateBracket(type);
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
    tournamentStates.light.groups = [[], [], []];
    tournamentStates.hard.groups = [[], [], []];

    // Distribute teams to groups
    distributeTeamsToGroups(tournamentStates.light);
    distributeTeamsToGroups(tournamentStates.hard);

    // Generate new matches for light and hard
    generateMatches('light');
    generateMatches('hard');

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
    let teamIndex = 0;
    for (let i = 0; i < state.activeTeams.length; i++) {
        state.groups[teamIndex].push(state.activeTeams[i]);
        teamIndex = (teamIndex + 1) % state.groups.length;
    }
}

function updateLightHardStandings() {
    const lightContainer = document.querySelector('.light-standings');
    const hardContainer = document.querySelector('.hard-standings');

    if (typeof getTeamStandings === 'function') {
        const standings = getTeamStandings();
        lightContainer.innerHTML = standings.light.map((team, index) => `
            <div class="p-2 bg-gray-100 rounded">
                ${index + 1}. ${team}
            </div>
        `).join('');
        
        hardContainer.innerHTML = standings.hard.map((team, index) => `
            <div class="p-2 bg-gray-100 rounded">
                ${index + 1}. ${team}
            </div>
        `).join('');
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

function generateBracket(type) {
    const state = tournamentStates[type];
    const teams = [...state.activeTeams];
    
    // Reset bracket matches
    state.bracketMatches = {
        winners: [],
        losers: []
    };

    // Generate winners bracket first round
    const numTeams = teams.length;
    const firstRoundMatches = Math.pow(2, Math.ceil(Math.log2(numTeams)));
    const byes = firstRoundMatches - numTeams;

    // Shuffle teams
    for (let i = teams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [teams[i], teams[j]] = [teams[j], teams[i]];
    }

    // Create first round matches with byes
    const firstRound = [];
    for (let i = 0; i < firstRoundMatches / 2; i++) {
        if (i < byes / 2) {
            firstRound.push({
                team1: teams[i],
                team2: "BYE",
                score1: null,
                score2: null,
                round: 1,
                matchNumber: i + 1
            });
        } else {
            firstRound.push({
                team1: teams[i],
                team2: teams[teams.length - (i - Math.floor(byes/2)) - 1] || "BYE",
                score1: null,
                score2: null,
                round: 1,
                matchNumber: i + 1
            });
        }
    }

    state.bracketMatches.winners = firstRound;
    updateBracketDisplay(type);
    saveToLocalStorage();
}

function updateBracketScore(type, bracket, matchIndex, score1, score2) {
    const state = tournamentStates[type];
    const match = state.bracketMatches[bracket][matchIndex];

    if (!match) return;

    if (score1 !== null) match.score1 = parseInt(score1) || 0;
    if (score2 !== null) match.score2 = parseInt(score2) || 0;

    // Only process completed matches
    if (match.score1 !== null && match.score2 !== null) {
        const winner = match.score1 > match.score2 ? match.team1 : match.team2;
        const loser = match.score1 > match.score2 ? match.team2 : match.team1;

        if (bracket === 'winners') {
            // Handle winners bracket progression
            const nextRoundMatch = Math.floor((match.matchNumber - 1) / 2) + 1;
            const isFirstTeam = match.matchNumber % 2 === 1;

            let nextMatch = state.bracketMatches.winners.find(m => 
                m.round === match.round + 1 && m.matchNumber === nextRoundMatch
            );

            if (!nextMatch) {
                nextMatch = {
                    round: match.round + 1,
                    matchNumber: nextRoundMatch,
                    team1: isFirstTeam ? winner : null,
                    team2: isFirstTeam ? null : winner,
                    score1: null,
                    score2: null
                };
                state.bracketMatches.winners.push(nextMatch);
            } else {
                if (isFirstTeam) {
                    nextMatch.team1 = winner;
                } else {
                    nextMatch.team2 = winner;
                }
            }

            // Add loser to losers bracket if not BYE
            if (loser !== 'BYE') {
                const loserBracketRound = match.round;
                const loserMatchNumber = state.bracketMatches.losers.length + 1;
                
                // Find or create the appropriate losers bracket match
                let loserMatch = state.bracketMatches.losers.find(m => 
                    m.round === loserBracketRound && 
                    (!m.team1 || !m.team2)
                );

                if (!loserMatch) {
                    loserMatch = {
                        round: loserBracketRound,
                        matchNumber: loserMatchNumber,
                        team1: loser,
                        team2: null,
                        score1: null,
                        score2: null
                    };
                    state.bracketMatches.losers.push(loserMatch);
                } else {
                    if (!loserMatch.team1) {
                        loserMatch.team1 = loser;
                    } else {
                        loserMatch.team2 = loser;
                    }
                }
            }
        } else if (bracket === 'losers') {
            // Handle losers bracket progression
            const nextRoundMatch = Math.floor((match.matchNumber - 1) / 2) + 1;
            let nextMatch = state.bracketMatches.losers.find(m => 
                m.round === match.round + 1 && m.matchNumber === nextRoundMatch
            );

            if (!nextMatch && winner !== 'BYE') {
                nextMatch = {
                    round: match.round + 1,
                    matchNumber: nextRoundMatch,
                    team1: winner,
                    team2: null,
                    score1: null,
                    score2: null
                };
                state.bracketMatches.losers.push(nextMatch);
            } else if (nextMatch && winner !== 'BYE') {
                if (!nextMatch.team1) {
                    nextMatch.team1 = winner;
                } else {
                    nextMatch.team2 = winner;
                }
            }
        }
    }

    updateBracketDisplay(type);
    saveToLocalStorage();
}

function updateBracketDisplay(type) {
    const mainTab = document.getElementById(`${type}-main-tab`);
    const winnersContainer = mainTab.querySelector('.winners-bracket');
    const losersContainer = mainTab.querySelector('.losers-bracket');
    const state = tournamentStates[type];

    // Group matches by round
    const winnerRounds = {};
    state.bracketMatches.winners.forEach(match => {
        if (!winnerRounds[match.round]) {
            winnerRounds[match.round] = [];
        }
        winnerRounds[match.round].push(match);
    });

    const loserRounds = {};
    state.bracketMatches.losers.forEach(match => {
        if (!loserRounds[match.round]) {
            loserRounds[match.round] = [];
        }
        loserRounds[match.round].push(match);
    });

    // Generate winners bracket HTML
    winnersContainer.innerHTML = `
        <div class="mb-6">
            <h3 class="font-semibold mb-4 text-lg">Winners Bracket</h3>
            <div class="flex gap-8">
                ${Object.entries(winnerRounds)
                    .map(([round, matches]) => `
                        <div class="bracket-round">
                            <h4 class="font-semibold mb-2">Round ${round}</h4>
                            ${matches.map((match, idx) => `
                                <div class="bracket-match mb-4 ${match.winner ? 'border-green-500' : ''}">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-sm text-gray-600">Match ${match.matchNumber}</span>
                                    </div>
                                    <div class="space-y-2">
                                        <div class="flex items-center gap-2">
                                            <span class="flex-grow">${match.team1}</span>
                                            <input
                                                type="number"
                                                value="${match.score1 ?? ''}"
                                                onchange="updateBracketScore('${type}', 'winners', ${match.matchNumber-1}, this.value, null)"
                                                class="w-16 text-center border rounded p-1"
                                                ${match.team1 === 'BYE' ? 'disabled' : ''}
                                            >
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <span class="flex-grow">${match.team2}</span>
                                            <input
                                                type="number"
                                                value="${match.score2 ?? ''}"
                                                onchange="updateBracketScore('${type}', 'winners', ${match.matchNumber-1}, null, this.value)"
                                                class="w-16 text-center border rounded p-1"
                                                ${match.team2 === 'BYE' ? 'disabled' : ''}
                                            >
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
            </div>
        </div>`;

    // Generate losers bracket HTML
    losersContainer.innerHTML = `
        <div>
            <h3 class="font-semibold mb-4 text-lg">Losers Bracket</h3>
            <div class="flex gap-8">
                ${Object.entries(loserRounds)
                    .map(([round, matches]) => `
                        <div class="bracket-round">
                            <h4 class="font-semibold mb-2">Round ${round}</h4>
                            ${matches.map((match, idx) => `
                                <div class="bracket-match mb-4 ${match.winner ? 'border-green-500' : ''}">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-sm text-gray-600">Match ${match.matchNumber}</span>
                                    </div>
                                    <div class="space-y-2">
                                        <div class="flex items-center gap-2">
                                            <span class="flex-grow">${match.team1}</span>
                                            <input
                                                type="number"
                                                value="${match.score1 ?? ''}"
                                                onchange="updateBracketScore('${type}', 'losers', ${match.matchNumber-1}, this.value, null)"
                                                class="w-16 text-center border rounded p-1"
                                            >
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <span class="flex-grow">${match.team2}</span>
                                            <input
                                                type="number"
                                                value="${match.score2 ?? ''}"
                                                onchange="updateBracketScore('${type}', 'losers', ${match.matchNumber-1}, null, this.value)"
                                                class="w-16 text-center border rounded p-1"
                                            >
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
            </div>
        </div>`;
}

function generateGroups(type) {
const state = tournamentStates[type];
const numCourts = type === 'all' ? 6 : 3;

// Create empty groups array with proper number of courts
state.groups = Array(numCourts).fill().map(() => []);

// Shuffle active teams
const shuffledTeams = [...state.activeTeams].sort(() => Math.random() - 0.5);

// Calculate teams per group
const teamsPerGroup = Math.ceil(shuffledTeams.length / numCourts);

// Distribute teams
shuffledTeams.forEach((team, index) => {
    const groupIndex = Math.floor(index / teamsPerGroup);
    if (groupIndex < numCourts) {
        state.groups[groupIndex].push(team);
    }
});

generateMatches(type);
updateGroupsDisplay(type);
updateMatchesDisplay(type);
updateStandings(type);
}

function getMatchHtml(type, match, overallMatchIndex, groupTeams) {
    return `
        <div class="bg-gray-50 p-3 rounded-lg relative">
            <div class="flex justify-between text-sm text-gray-600 mb-2">
                <span>Court ${match.court}</span>
                <input 
                    type="time" 
                    value="${match.startTime.toTimeString().substring(0, 5)}" 
                    onchange="updateMatchTime('${type}', ${overallMatchIndex}, this.value)"
                    class="border rounded p-1 text-sm"
                >
            </div>
            <div class="space-y-2">
                <div class="flex items-center gap-2 whitespace-nowrap overflow-hidden">
                    <select
                        class="flex-grow text-sm font-medium overflow-hidden text-ellipsis border rounded p-1"
                        onchange="updateMatchTeams('${type}', ${overallMatchIndex}, this.value, '${match.team2}')"
                    >
                        <option value="" ${match.team1 === "" ? 'selected' : ''}>Select team</option>
                        ${groupTeams.map(team => `
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
                        class="text-center w-20 flex-shrink-0 border rounded p-1"
                        placeholder="Score"
                    >
                </div>
                <div class="flex items-center gap-2 whitespace-nowrap overflow-hidden">
                    <select
                        class="flex-grow text-sm font-medium overflow-hidden text-ellipsis border rounded p-1"
                        onchange="updateMatchTeams('${type}', ${overallMatchIndex}, '${match.team1}', this.value)"
                    >
                        <option value="" ${match.team2 === "" ? 'selected' : ''}>Select team</option>
                        ${groupTeams.map(team => `
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
                        class="text-center w-20 flex-shrink-0 border rounded p-1"
                        placeholder="Score"
                    >
                </div>
                <div class="flex justify-end mt-2">
                    <button
                        onclick="setMatchUnplayed('${type}', ${overallMatchIndex})"
                        class="text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded mr-2"
                    >
                        Set as Unplayed
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
        newTime.setMinutes(newTime.getMinutes() + 20); // 20 minute intervals
        startTime.setTime(newTime.getTime());
    }

    // Create new match
    const newMatch = {
        court: courtNumber,
        team1: "",  // Empty string for unassigned
        team2: "",  // Empty string for unassigned
        score1: 0,
        score2: 0,
        startTime: startTime
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
    
    match.team1 = "";
    match.team2 = "";
    match.score1 = 0;
    match.score2 = 0;
    
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
            groups: [[], [], []],
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
    tournamentStates[type].activeTeams = tournamentStates[type].activeTeams.filter(team => team !== teamName);
    updateTeamsList(type);
    initializeTeamStats(type);
    generateGroups(type);
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
    const numCourts = type === 'all' ? 6 : 3;
    state.matches = [];
    const matchesPerGroup = 6;
    const matchDuration = 20;

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

    const startTime = new Date();
    startTime.setHours(9, 0, 0, 0);

    for (let matchIndex = 0; matchIndex < matchesPerGroup; matchIndex++) {
        const matchTime = new Date(startTime);
        matchTime.setMinutes(matchTime.getMinutes() + (matchIndex * matchDuration));

        state.groups.forEach((_, courtIndex) => {
            const courtMatches = state.matches.filter(m => m.court === courtIndex + 1);
            if (matchIndex < courtMatches.length) {
                courtMatches[matchIndex].startTime = new Date(matchTime);
            }
        });
    }
}

function updateGroupsDisplay(type) {
    const mainTab = document.getElementById(`${type}-main-tab`);
    const container = mainTab.querySelector('.groups-container');
    const state = tournamentStates[type];

    // Get rankings from 'all' tournament if we're in light or hard tab
    const allRankings = (type === 'light' || type === 'hard') ? 
        getAllRankings(tournamentStates.all.teamStats) : 
        null;

    container.innerHTML = state.groups.map((group, groupIndex) => `
        <div class="border rounded-lg p-4">
            <h3 class="font-semibold mb-2">Court ${groupIndex + 1}</h3>
            <ul class="space-y-2">
                ${group.map(team => `
                    <li class="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div class="flex items-center gap-2">
                            <span>${team}</span>
                            ${allRankings && allRankings[team] ? 
                                `<span class="text-sm text-gray-600">(All Rank: #${allRankings[team]})</span>` 
                                : ''}
                        </div>
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
    if (!state || !state.groups || !state.matches) return;

    container.innerHTML = `
        <div class="${type === 'all' ? 'full-screen-matches' : ''}">
            ${state.groups.map((groupTeams, groupIndex) => {
                const courtNumber = groupIndex + 1;
                const groupMatches = state.matches.filter(match => match.court === courtNumber);
                
                return `
                    <div class="court-container">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-semibold">Court ${courtNumber}</h3>
                            <button 
                                onclick="createNewMatch('${type}', ${courtNumber})"
                                class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                            >
                                Add Match
                            </button>
                        </div>
                        <div class="text-sm text-gray-600 mb-4">
                            <div class="font-medium mb-1">Teams in this court:</div>
                            ${groupTeams.map(team => `
                                <div class="whitespace-nowrap overflow-hidden text-ellipsis">
                                    ${team}
                                </div>
                            `).join('')}
                        </div>
                        <div class="matches-list">
                            ${groupMatches.map((match) => {
                                const overallMatchIndex = state.matches.findIndex(m => m === match);
                                return getMatchHtml(type, match, overallMatchIndex, groupTeams);
                            }).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function updateScore(type, matchIndex, score1, score2) {
    const state = tournamentStates[type];
    const match = state.matches[matchIndex];

    if (!match) return;

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
}

function updateStandings(type) {
    const mainTab = document.getElementById(`${type}-main-tab`);
    const winsContainer = mainTab.querySelector('.wins-standings');
    const diffContainer = mainTab.querySelector('.differential-standings');
    const groupsContainer = mainTab.querySelector('.group-standings');
    const state = tournamentStates[type];

    // Reset and recalculate stats
    Object.keys(state.teamStats).forEach(team => {
        state.teamStats[team] = {
            wins: 0,
            pointsScored: 0,
            pointsConceeded: 0,
            differential: 0
        };
    });

    // Calculate all stats first
    state.matches.forEach(match => {
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

    // Update group standings with the same sorting logic
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
    const savedData = localStorage.getItem('volleyballTournament');
    if (!savedData) return false;
    
    try {
        const loadedData = JSON.parse(savedData);
        
        ['all', 'light', 'hard'].forEach(type => {
            if (!loadedData[type]) {
                loadedData[type] = {
                    activeTeams: [],
                    groups: Array(type === 'all' ? 6 : 3).fill().map(() => []),
                    matches: [],
                    bracketMatches: {
                        winners: [],
                        losers: []
                    },
                    teamStats: {},
                    isFirstGeneration: true
                };
            }

            tournamentStates[type] = {
                ...loadedData[type],
                matches: (loadedData[type].matches || []).map(match => ({
                    ...match,
                    startTime: new Date(match.startTime)
                })),
                bracketMatches: loadedData[type].bracketMatches || {
                    winners: [],
                    losers: []
                }
            };
            
            // Defer UI updates to ensure DOM is ready
            setTimeout(() => {
                updateTeamsList(type);
                updateGroupsDisplay(type);
                updateMatchesDisplay(type);
                updateStandings(type);
                updateBracketDisplay(type);
            }, 0);
        });
        
        return true;
    } catch (error) {
        console.error('Error loading saved data:', error);
        return false;
    }
}

function saveToLocalStorage() {
    const dataToSave = {};
    Object.entries(tournamentStates).forEach(([type, state]) => {
    dataToSave[type] = {
        ...state,
        matches: state.matches.map(match => ({
            ...match,
            startTime: match.startTime.toISOString()
        }))
    };
    });

    localStorage.setItem('volleyballTournament', JSON.stringify(dataToSave));
}

function clearTournamentData(type) {
    tournamentStates[type] = {
        activeTeams: [],
        groups: Array(type === 'all' ? 6 : 3).fill().map(() => []),
        matches: [],
        teamStats: {},
        isFirstGeneration: true
    };

    updateTeamsList(type);
    updateGroupsDisplay(type);
    updateMatchesDisplay(type);
    updateStandings(type);
    saveToLocalStorage();
}

document.addEventListener('DOMContentLoaded', () => {
    initializeTournamentSections();
    const loaded = loadFromLocalStorage();
    if (!loaded) {
        Object.keys(tournamentStates).forEach(type => {
            toggleTournament(type);
        });
    }

    const splitButton = document.getElementById('split-teams-button');
    if (splitButton) {
        splitButton.addEventListener('click', function() {
            if (typeof splitIntoLightAndHard === 'function') {
                splitIntoLightAndHard();
                updateLightHardStandings();
            } else {
                console.error('Function splitIntoLightAndHard is not defined');
            }
        });
    } else {
        console.error('Button split-teams-button not found');
    }
});