try {
    console.log("Attempting to require ./server/add_all_54_final");
    const mod = require('./server/add_all_54_final');
    console.log("Success! Loaded questions:", mod.allQuestions ? mod.allQuestions.length : "undefined");
    console.log("Attempting to require ./server/src/services/codeExecutor");
    const executor = require('./server/src/services/codeExecutor');
    console.log("Success! Loaded executor:", !!executor.executeCode);
} catch (e) {
    console.error("FAILURE:");
    console.error(e);
}
