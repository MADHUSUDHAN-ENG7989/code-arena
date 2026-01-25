try {
    console.log("Starting debug...");
    require('./src/index.js');
} catch (error) {
    console.error("CAUGHT ERROR:");
    console.error(error.message);
    console.error(error.code);
    console.error(error.stack);
}
