const fs = require('fs');
const path = require('path');

const talksData = require('./data/talks.json');

const HTML_TEMPLATE_PATH = path.join(__dirname, 'src', 'index.html');
const CSS_PATH = path.join(__dirname, 'src', 'style.css');
const JS_PATH = path.join(__dirname, 'src', 'script.js');
const OUTPUT_DIR = path.join(__dirname, 'public');
const OUTPUT_HTML_PATH = path.join(OUTPUT_DIR, 'index.html');

async function generateSite() {
    try {
        // Read template and assets
        let htmlContent = fs.readFileSync(HTML_TEMPLATE_PATH, 'utf8');
        const cssContent = fs.readFileSync(CSS_PATH, 'utf8');
        let jsContent = fs.readFileSync(JS_PATH, 'utf8');

        // Calculate schedule
        const fullSchedule = [];
        let currentTime = new Date('2026-03-05T10:00:00'); // Event starts at 10:00 AM on March 5, 2026

        const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000);

        // Add talks and transitions
        for (let i = 0; i < talksData.length; i++) {
            const talk = talksData[i];
            const talkStartTime = new Date(currentTime);
            const talkEndTime = addMinutes(talkStartTime, 60); // Each talk is 1 hour

            fullSchedule.push({
                type: 'talk',
                title: talk.title,
                speakers: talk.speakers,
                category: talk.category,
                description: talk.description,
                startTime: talkStartTime.toISOString(), // Store as ISO string for easy parsing
                endTime: talkEndTime.toISOString()
            });

            currentTime = talkEndTime;

            // Add transition after each talk, except the last one and before lunch
            if (i < talksData.length - 1 && i !== 2) { // 2 is the index of the talk before lunch
                const transitionEndTime = addMinutes(currentTime, 10); // 10-minute transition
                fullSchedule.push({
                    type: 'break',
                    title: 'Transition',
                    startTime: currentTime.toISOString(),
                    endTime: transitionEndTime.toISOString()
                });
                currentTime = transitionEndTime;
            }

            // Insert lunch break after the 3rd talk (index 2)
            if (i === 2) {
                const lunchStartTime = new Date(currentTime);
                const lunchEndTime = addMinutes(lunchStartTime, 60); // 1-hour lunch
                fullSchedule.push({
                    type: 'break',
                    title: 'Lunch Break',
                    startTime: lunchStartTime.toISOString(),
                    endTime: lunchEndTime.toISOString()
                });
                currentTime = lunchEndTime;
            }
        }

        // Inject schedule data into client-side JS
        jsContent = jsContent.replace('let talksData = [];', `let talksData = ${JSON.stringify(fullSchedule.map(item => ({
            ...item,
            // Convert ISO strings back to Date objects in client-side for ease of use
            startTime: `new Date('${item.startTime}')`,
            endTime: `new Date('${item.endTime}')`
        }))).replace(/"new Date\('(.+?)'\)"/g, "new Date('$1')")};`);


        // Embed CSS and JS into HTML
        htmlContent = htmlContent.replace('<!-- Styles will be injected here by generate-site.js -->', `<style>${cssContent}</style>`);
        htmlContent = htmlContent.replace('<!-- Scripts will be injected here by generate-site.js -->', `<script>${jsContent}</script>`);

        // Ensure output directory exists
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR);
        }

        // Write the final HTML file
        fs.writeFileSync(OUTPUT_HTML_PATH, htmlContent, 'utf8');

        console.log(`Successfully generated website at ${OUTPUT_HTML_PATH}`);
    } catch (error) {
        console.error('Error generating site:', error);
    }
}

generateSite();
