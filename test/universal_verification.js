const { executeCode } = require('../server/src/services/codeExecutor');

// Mock Problem Config for "Set Matrix Zeroes" (slug: set-matrix-zeroes)
// We need to ensure the server loads the config. 
// Since we are importing executeCode from server, and it imports problemConfig, checks config...
// We must run this script from root so it finds everything? 
// Actually executeCode expects problem configs to be loaded.
// It imports '../configs/problemConfig'.
// Let's assume the environment is set up correctly if we run via 'node test/universal_verification.js' from root.

const TEST_INPUT = '[[1,1,1],[1,0,1],[1,1,1]]';
const EXPECTED_JSON = '[[1,0,1],[0,0,0],[1,0,1]]';
const EXPECTED_FLAT = '1 0 1 0 0 0 1 0 1';

const SOLUTIONS = {
    javascript: `
function setZeroes(matrix) {
    const R = matrix.length;
    const C = matrix[0].length;
    let rows = new Set();
    let cols = new Set();
    for(let r=0; r<R; r++) {
        for(let c=0; c<C; c++) {
            if(matrix[r][c] === 0) {
                rows.add(r);
                cols.add(c);
            }
        }
    }
    for(let r=0; r<R; r++) {
        for(let c=0; c<C; c++) {
            if(rows.has(r) || cols.has(c)) {
                matrix[r][c] = 0;
            }
        }
    }
}
`,
    python: `
class Solution:
    def set_zeroes(self, matrix: List[List[int]]) -> None:
        R, C = len(matrix), len(matrix[0])
        rows, cols = set(), set()
        for r in range(R):
            for c in range(C):
                if matrix[r][c] == 0:
                    rows.add(r)
                    cols.add(c)
        for r in range(R):
            for c in range(C):
                if r in rows or c in cols:
                    matrix[r][c] = 0
`,
    java: `
class Solution {
    public void setZeroes(int[][] matrix) {
        int R = matrix.length;
        int C = matrix[0].length;
        boolean[] rows = new boolean[R];
        boolean[] cols = new boolean[C];
        for(int r=0; r<R; r++) {
            for(int c=0; c<C; c++) {
                if(matrix[r][c] == 0) {
                    rows[r] = true;
                    cols[c] = true;
                }
            }
        }
        for(int r=0; r<R; r++) {
            for(int c=0; c<C; c++) {
                if(rows[r] || cols[c]) {
                    matrix[r][c] = 0;
                }
            }
        }
    }
}
`,
    cpp: `
class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int R = matrix.size();
        int C = matrix[0].size();
        vector<bool> rows(R, false);
        vector<bool> cols(C, false);
        for(int r=0; r<R; ++r) {
            for(int c=0; c<C; ++c) {
                if(matrix[r][c] == 0) {
                    rows[r] = true;
                    cols[c] = true;
                }
            }
        }
        for(int r=0; r<R; ++r) {
            for(int c=0; c<C; ++c) {
                if(rows[r] || cols[c]) {
                    matrix[r][c] = 0;
                }
            }
        }
    }
};
`
};

const normalize = (str) => str.replace(/\s+/g, '').replace(/\n/g, '');

async function runTests() {
    console.log("Starting Universal Verification for 'Set Matrix Zeroes'...");

    let failures = 0;

    for (const [lang, code] of Object.entries(SOLUTIONS)) {
        console.log(`\nTesting ${lang.toUpperCase()}...`);
        try {
            const result = await executeCode(code, lang, TEST_INPUT, 'set-matrix-zeroes');
            console.log(`Status: ${result.status}`);
            console.log(`Output: ${result.output}`);

            let passed = false;
            // Clean output for comparison
            const cleanOutput = normalize(result.output);
            const cleanJson = normalize(EXPECTED_JSON);
            const cleanFlat = normalize(EXPECTED_FLAT);

            if (lang === 'javascript' || lang === 'python') {
                passed = cleanOutput === cleanJson;
            } else {
                passed = cleanOutput.includes(cleanFlat); // Java prints "1 0 1..." check containment in case of extra spaces
            }

            if (passed) {
                console.log("✅ PASS");
            } else {
                console.log("❌ FAIL");
                console.log(`   Expected (Normalized): ${lang === 'javascript' || lang === 'python' ? cleanJson : cleanFlat}`);
                console.log(`   Actual   (Normalized): ${cleanOutput}`);
                failures++;
            }
        } catch (e) {
            console.error(`❌ CRASH: ${e.message}`);
            failures++;
        }
    }

    if (failures === 0) {
        console.log("\nAll tests passed!");
        process.exit(0);
    } else {
        console.error("\nSome tests failed.");
        process.exit(1);
    }
}

runTests();
