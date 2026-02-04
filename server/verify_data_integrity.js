const { allQuestions } = require('./add_all_54_final');

// Helper to normalize input lines
const parseInput = (input) => {
    // Handle empty input explicitly
    if (input === '' || input === '""') return [''];
    return input.replace(/\\n/g, '\n').trim().split('\n').map(l => l.trim());
};

let errors = [];
let warnings = [];

console.log(`Starting verification of ${allQuestions.length} questions...`);

allQuestions.forEach((q, idx) => {
    const qPrefix = `[Q${idx + 1}: ${q.title}]`;

    if (!q.meta) {
        // warnings.push(`${qPrefix} No metadata found (might be old 10 questions). Skipping deep verification.`);
        return;
    }

    const { args } = q.meta;
    const { testCases } = q;

    if (!testCases || testCases.length === 0) {
        errors.push(`${qPrefix} No test cases found.`);
        return;
    }

    testCases.forEach((tc, tcIdx) => {
        const lines = parseInput(tc.input);

        // 1. Check Argument Count
        if (lines.length !== args.length) {
            // Special handling for some inputs that might be on one line?
            // Usually we expect 1 line per argument.
            if (args.length === 1 && lines.length > 1) {
                // Maybe array on multiple lines? Unlikely based on format.
                errors.push(`${qPrefix} TC#${tcIdx}: Arg count mismatch. Expected ${args.length} (${args.map(a => a.name).join(',')}), got ${lines.length} lines.`);
            } else if (lines.length < args.length) {
                errors.push(`${qPrefix} TC#${tcIdx}: Missing inputs. Expected ${args.length}, got ${lines.length}.`);
            }
        }

        // 2. Validate Types (Basic Heuristics)
        args.forEach((arg, i) => {
            const line = lines[i];
            if (!line) return;

            if (arg.type === 'int') {
                if (!/^-?\d+$/.test(line)) {
                    errors.push(`${qPrefix} TC#${tcIdx} Arg '${arg.name}' (${arg.type}): Invalid format '${line}'. Expected integer.`);
                }
            } else if (arg.type === 'boolean') {
                if (!/^(true|false)$/i.test(line)) {
                    errors.push(`${qPrefix} TC#${tcIdx} Arg '${arg.name}' (${arg.type}): Invalid format '${line}'. Expected boolean.`);
                }
            }
            // For arrays, checking is looser because space-separated can vary.
        });
    });
});

console.log('\nVerification Complete.');
if (errors.length > 0) {
    console.error(`\nFound ${errors.length} ERRORS:`);
    errors.forEach(e => console.error(e));
    process.exit(1);
} else {
    console.log('No structural errors found.');
    process.exit(0);
}
