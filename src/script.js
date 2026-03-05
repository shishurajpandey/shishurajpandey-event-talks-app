// Placeholder for talks data - will be populated by generate-site.js
let talksData = [];

document.addEventListener('DOMContentLoaded', () => {
    const scheduleContainer = document.getElementById('schedule');
    const searchInput = document.getElementById('category-search');

    function formatTime(date) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    function renderSchedule(filter = '') {
        scheduleContainer.innerHTML = '<h2>Event Schedule</h2>'; // Clear existing schedule

        let filteredTalks = talksData;
        if (filter) {
            filter = filter.toLowerCase();
            filteredTalks = talksData.filter(item => {
                if (item.type === 'talk') {
                    return item.category.some(cat => cat.toLowerCase().includes(filter));
                }
                return false;
            });
        }

        filteredTalks.forEach(item => {
            if (item.type === 'talk') {
                const talkElement = document.createElement('div');
                talkElement.classList.add('talk');
                talkElement.innerHTML = `
                    <h3>${item.title}</h3>
                    <div class="talk-meta">
                        <span>Time: ${formatTime(item.startTime)} - ${formatTime(item.endTime)}</span>
                        <span>Speakers: ${item.speakers.join(', ')}</span>
                    </div>
                    <div class="talk-categories">
                        ${item.category.map(cat => `<span class="${cat.toLowerCase().includes(filter) && filter ? 'highlight' : ''}">${cat}</span>`).join('')}
                    </div>
                    <p class="talk-description">${item.description}</p>
                `;
                scheduleContainer.appendChild(talkElement);
            } else if (item.type === 'break') {
                const breakElement = document.createElement('div');
                breakElement.classList.add('break');
                breakElement.innerHTML = `
                    <h3>${item.title}</h3>
                    <p>Time: ${formatTime(item.startTime)} - ${formatTime(item.endTime)}</p>
                `;
                scheduleContainer.appendChild(breakElement);
            }
        });
    }

    searchInput.addEventListener('input', (event) => {
        renderSchedule(event.target.value);
    });

    // Initial render
    renderSchedule();
});
