const fs = require('fs');
const path = require('path');
const newQuestions = require('./new_questions');
const questions20 = require('./questions_20');
const config = require('./src/configs/problemConfig');

function generatePythonStarter(slug) {
    const pb = config[slug];
    if (!pb) {
        console.warn(`[WARN] No config for ${slug}`);
        return null; // Keep original if no config
    }

    const fnName = pb.fn;
    const args = pb.args.map(a => a.name).join(', ');

    // Indentation is important for Python
    return `class Solution:
    def ${fnName}(self, ${args}):
        # Your code here
        pass`;
}

function processQuestions(questions, filename) {
    let updatedCount = 0;
    questions.forEach(q => {
        const newCode = generatePythonStarter(q.slug);
        if (newCode) {
            // Apply Update
            q.starterCode.python = newCode;
            updatedCount++;
        }
    });

    console.log(`Updated ${updatedCount} questions in ${filename}`);

    // Write back to file
    // We construct the file content manually to preserve "module.exports ="
    const content = `const questions = ${JSON.stringify(questions, null, 4)};\n\nmodule.exports = questions;\n`;
    fs.writeFileSync(path.join(__dirname, filename), content, 'utf8');
}

console.log('--- Fixing Python Starter Code ---');
processQuestions(newQuestions, 'new_questions.js');
processQuestions(questions20, 'questions_20.js');
console.log('--- Done ---');
