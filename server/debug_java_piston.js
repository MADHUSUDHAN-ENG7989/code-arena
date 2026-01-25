const axios = require('axios');

const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

const code = `
import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        return new int[]{0, 1};
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Main");
        Solution s = new Solution();
        int[] res = s.twoSum(new int[]{2,7}, 9);
        System.out.println(res[0] + " " + res[1]);
    }
}
`;

const runPiston = async (filename) => {
    console.log(`\n--- Running with filename: ${filename} ---`);
    try {
        const response = await axios.post(PISTON_API_URL, {
            language: 'java',
            version: '15.0.2',
            files: [
                {
                    name: filename,
                    content: code
                }
            ],
            stdin: ""
        });
        console.log("Stdout:", response.data.run.stdout);
        console.log("Stderr:", response.data.run.stderr);
        console.log("Output:", response.data.run.output);
    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) console.error(error.response.data);
    }
};

(async () => {
    // Test explicit Main.java
    console.log("Starting Main.java test...");
    await runPiston('Main.java');
    console.log("Finished Main.java test.");
})();
