try {
    const q = require('./new_questions');
    console.log('Successfully loaded new_questions.js');
    console.log('Count:', q.length);
} catch (e) {
    console.error('Error loading new_questions.js:', e);
}
