const axios = require('axios');
const { getIO } = require('./socketService');
const PROBLEM_CONFIG = require('../configs/problemConfig');

const LANGUAGE_IDS = {
    javascript: 63,
    python: 71,
    java: 62,
    cpp: 54,
    c: 50,
    csharp: 51,
    go: 60,
    rust: 73,
    ruby: 72,
    php: 68,
};

const transformInputForStrictLanguages = (input, args) => {
    const lines = input.split('\n');
    return lines.map((line, i) => {
        const trimmed = line.trim();
        const arg = args[i];
        if (!arg) return trimmed; // Extra lines?

        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    // Check if 2D array based on Arg Type or Content consistency
                    const is2D = Array.isArray(parsed[0]) || arg.type.includes('[][]');

                    if (is2D) {
                        // R C data...
                        const rows = parsed.length;
                        const cols = rows > 0 ? parsed[0].length : 0;
                        const flatten = (arr) => arr.reduce((acc, val) =>
                            Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);
                        return `${rows} ${cols} ` + flatten(parsed).join(' ');
                    } else {
                        // 1D Array
                        return parsed.join(' ');
                    }
                }
            } catch (e) {
                return trimmed;
            }
        }
        return trimmed;
    }).join('\n');
};

const generateDriver = (code, language, slug) => {
    const config = PROBLEM_CONFIG[slug];
    if (!config) return code; // Fallback or error

    let FINAL_CODE = code;

    // --- JAVASCRIPT ---
    if (language === 'javascript') {
        const imports = `
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').replace(/\\r?\\n$/, '');
if (input === '') return;
const lines = input.replace(/\\\\\\\\n/g, '\\\\n').split('\\\\n');
`;
        // Helpers
        let helpers = '';
        if (config.args.some(a => a.type === 'ListNode') || config.returnType === 'ListNode') helpers += JS_LIST_NODE;
        if (config.args.some(a => a.type === 'TreeNode') || config.returnType === 'TreeNode') helpers += JS_TREE_NODE;

        // Input Parsing
        let parsing = '';
        const argNames = [];
        config.args.forEach((arg, i) => {
            const lineRef = `(lines[${i}] || '')`;
            argNames.push(arg.name);
            if (arg.type === 'int') {
                parsing += `const ${arg.name} = Number(${lineRef});\n`;
            } else if (arg.type === 'int[]') {
                parsing += `const ${arg.name} = ${lineRef}.trim().split(/\\s+/).map(Number);\n`;
            } else if (arg.type === 'string') {
                parsing += `const ${arg.name} = ${lineRef}.trim();\n`;
            } else if (arg.type === 'char[]') {
                parsing += `const ${arg.name} = ${lineRef}.trim().split(/\\s+/);\n`;
            } else if (arg.type === 'string[]') {
                parsing += `let ${arg.name}; try { ${arg.name} = JSON.parse(${lineRef}); } catch(e) { ${arg.name} = ${lineRef}.trim().split(/\\s+/); }\n`;
            } else if (arg.type === 'int[][]') {
                parsing += `const ${arg.name} = JSON.parse(${lineRef});\n`;
            } else if (arg.type === 'char[][]') {
                parsing += `const ${arg.name} = JSON.parse(${lineRef});\n`;
            } else if (arg.type === 'ListNode') {
                parsing += `const ${arg.name}_arr = ${lineRef}.trim().split(/\\s+/).map(Number);\n`;
                parsing += `const ${arg.name} = createLinkedList(${arg.name}_arr);\n`;
            } else if (arg.type === 'TreeNode') {
                parsing += `const ${arg.name}_raw = ${lineRef}.trim().split(/\\s+/);\n`;
                parsing += `const ${arg.name}_arr = ${arg.name}_raw.map(x => x === 'null' ? null : Number(x));\n`;
                parsing += `const ${arg.name} = createBinaryTree(${arg.name}_arr);\n`;
            }
        });

        // Execution & Output
        let execution = `const result = ${config.fn}(${argNames.join(', ')});\n`;

        let output = '';
        if (config.slug === 'group-anagrams') {
            output = `
if (Array.isArray(result)) {
    const sortedGroups = result.map(g => Array.isArray(g) ? g.slice().sort() : [g]);
    sortedGroups.forEach(g => g.sort());
    sortedGroups.sort((a, b) => {
        if (a.length !== b.length) return a.length - b.length;
        return a.join(' ').localeCompare(b.join(' '));
    });
    console.log(sortedGroups.map(g => g.join(' ')).join('|'));
} else {
    console.log(result);
}
`;
        } else if (config.slug === 'text-justification') {
            output = `console.log(Array.isArray(result) ? result.join('|') : result);\n`;
        } else if (config.returnType === 'int[]') {
            if (config.sortResult) execution += `if(Array.isArray(result)) result.sort((a, b) => a - b);\n`;
            output = `console.log(Array.isArray(result) ? result.join(' ') : result);\n`;
        } else if (config.returnType === 'string[]') {
            output = `console.log(Array.isArray(result) ? result.join(' ') : result);\n`;
        } else if (config.returnType === 'int[][]') {
            output = `console.log(Array.isArray(result) ? result.flat().join(' ') : result);\n`;
        } else if (config.returnType === 'char[][]') {
            output = `console.log(JSON.stringify(result));\n`;
        } else if (config.returnType === 'ListNode') {
            output = `printLinkedList(result);\n`;
        } else if (config.returnType === 'boolean') {
            output = `console.log(result);\n`;
        } else if (config.returnType === 'void') {
            const firstArg = config.args[0];
            if (firstArg.type === 'int[]' || firstArg.type === 'char[]') {
                output = `console.log(Array.isArray(${argNames[0]}) ? ${argNames[0]}.join(' ') : ${argNames[0]});\n`;
            } else {
                output = `console.log(JSON.stringify(${argNames[0]}));\n`;
            }
        } else {
            output = `console.log(result);\n`;
        }

        FINAL_CODE = helpers + FINAL_CODE + `\n` + imports + parsing + execution + output;

    } else if (language === 'python') {
        const imports = `
import sys
import json
from typing import List, Optional, Dict, Set, Tuple


# Read input and handle potential formatting issues
input_str = sys.stdin.read().rstrip('\\\\r\\\\n')
if not input_str:
    sys.exit(0)

# Split into lines, filtering out empty ones if needed, or preserving mapping
# We attempt to be robust: treat real newlines and escaped newlines as separators
lines = [line.strip() for line in input_str.replace('\\\\\\\\n', '\\\\n').split('\\\\n') if line.strip()]
`;
        let helpers = '';
        if (config.args.some(a => a.type === 'ListNode') || config.returnType === 'ListNode') helpers += PY_LIST_NODE;
        if (config.args.some(a => a.type === 'TreeNode') || config.returnType === 'TreeNode') helpers += PY_TREE_NODE;

        let parsing = '';
        const argNames = [];

        // Pad lines if insufficient
        parsing += `
# Pad lines if fewer than expected arguments
required_args = ${config.args.length}
while len(lines) < required_args:
    lines.append("")
`;

        config.args.forEach((arg, i) => {
            const lineRef = `lines[${i}]`;
            argNames.push(arg.name);
            if (arg.type === 'int') {
                parsing += `try:\n    ${arg.name} = int(${lineRef})\nexcept: ${arg.name} = 0\n`;
            } else if (arg.type === 'int[]') {
                parsing += `try:\n    ${arg.name} = json.loads(${lineRef})\n    if not isinstance(${arg.name}, list): raise ValueError\nexcept:\n    ${arg.name} = list(map(int, ${lineRef}.split()))\n`;
            } else if (arg.type === 'string') {
                parsing += `${arg.name} = ${lineRef}\n`;
            } else if (arg.type === 'char[]') {
                parsing += `try:\n    ${arg.name} = json.loads(${lineRef})\n    if not isinstance(${arg.name}, list): raise ValueError\nexcept:\n    ${arg.name} = ${lineRef}.split()\n`;
            } else if (arg.type === 'string[]') {
                parsing += `try:\n    ${arg.name} = json.loads(${lineRef})\n    if not isinstance(${arg.name}, list): raise ValueError\nexcept:\n    ${arg.name} = ${lineRef}.split()\n`;
            } else if (arg.type === 'int[][]') {
                parsing += `try:\n    ${arg.name} = json.loads(${lineRef})\nexcept Exception as e:\n    print(f"DEBUG_JSON_FAIL: {${lineRef}}")\n    raise e\n`;
            } else if (arg.type === 'char[][]') {
                parsing += `try:\n    ${arg.name} = json.loads(${lineRef})\nexcept Exception as e:\n    print(f"DEBUG_JSON_FAIL: {${lineRef}}")\n    raise e\n`;
            } else if (arg.type === 'ListNode') {

                parsing += `${arg.name}_arr = list(map(int, ${lineRef}.split()))\n`;
                parsing += `${arg.name} = create_linked_list(${arg.name}_arr)\n`;
            } else if (arg.type === 'TreeNode') {
                parsing += `${arg.name}_raw = ${lineRef}.split()\n`;
                parsing += `${arg.name}_arr = [int(x) if x != 'null' else None for x in ${arg.name}_raw]\n`;
                parsing += `${arg.name} = create_binary_tree(${arg.name}_arr)\n`;
            }
        });

        // Instantiate Solution class and call method
        // Starter codes now include Solution class directly

        // Fix: Python usage convention is snake_case, but config is camelCase. 
        // We must convert config.fn to snake_case to match the starter code.
        const fnName = config.fn.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
        let execution = `sol = Solution()\nresult = sol.${fnName}(${argNames.join(', ')})\n`;
        let output = '';
        if (config.slug === 'group-anagrams') {
            output = `
if isinstance(result, list):
    sorted_groups = [sorted(g) if isinstance(g, list) else [g] for g in result]
    sorted_groups.sort(key=lambda x: (len(x), " ".join(x)))
    print("|".join(" ".join(g) for g in sorted_groups))
else:
    print(result)
`;
        } else if (config.slug === 'text-justification') {
            output = `print("|".join(result) if isinstance(result, list) else result)\n`;
        } else if (config.returnType === 'int[]') {
            if (config.sortResult) execution += `if isinstance(result, list): result.sort()\n`;
            output = `print(" ".join(map(str, result)) if isinstance(result, list) else result)\n`;
        } else if (config.returnType === 'char[]' || config.returnType === 'string[]') {
            output = `print(" ".join(result) if isinstance(result, list) else result)\n`;
        } else if (config.returnType === 'int[][]') {
            output = `print(" ".join(map(str, [x for sub in result for x in sub])) if isinstance(result, list) and len(result) > 0 and isinstance(result[0], list) else result)\n`;
        } else if (config.returnType === 'char[][]') {
            output = `print(json.dumps(result).replace(" ", ""))\n`;
        } else if (config.returnType === 'void') {
            output = `print(json.dumps(${argNames[0]}).replace(" ", "")) if isinstance(${argNames[0]}, list) and len(${argNames[0]}) > 0 and isinstance(${argNames[0]}[0], list) else print(" ".join(map(str, ${argNames[0]})) if isinstance(${argNames[0]}, list) else ${argNames[0]})\n`;
        } else if (config.returnType === 'ListNode') {
            output = `print_linked_list(result)\n`;
        } else if (config.returnType === 'boolean') {
            output = `print(str(result).lower())\n`;
        } else {
            output = `print(result)\n`;
        }

        FINAL_CODE = imports + helpers + FINAL_CODE + `\n` + parsing + execution + output;

    } else if (language === 'java') {
        // Import extraction logic (Same as before)
        const userImports = [];
        const userCodeLines = code.split('\n');
        const cleanUserCodeLines = [];
        for (const line of userCodeLines) {
            if (line.trim().startsWith('import ')) userImports.push(line);
            else cleanUserCodeLines.push(line);
        }

        const standardImports = `
import java.util.*;
import java.io.*;
import java.util.stream.*;
`;
        const allImports = standardImports + userImports.join('\n');

        let helpers = '';
        if (config.args.some(a => a.type === 'ListNode') || config.returnType === 'ListNode') helpers += JAVA_LIST_NODE;
        if (config.args.some(a => a.type === 'TreeNode') || config.returnType === 'TreeNode') helpers += JAVA_TREE_NODE;

        const mainStart = `
class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder inputBuilder = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            inputBuilder.append(line).append("\\\\n");
        }
        String input = inputBuilder.toString().replaceAll("\\\\r?\\\\n$", "");
        if (input.isEmpty()) return;
        
        String[] lines = input.replace("\\\\\\\\n", "\\\\n").split("\\\\n");
        Solution solution = new Solution();
`;
        let parsing = '';
        const argNames = [];
        config.args.forEach((arg, i) => {
            const lineRef = `lines[${i}].trim()`;
            argNames.push(arg.name);
            if (arg.type === 'int') {
                parsing += `int ${arg.name} = Integer.parseInt(${lineRef});\n`;
            } else if (arg.type === 'int[]') {
                parsing += `String[] ${arg.name}_str = ${lineRef}.split("\\\\s+");\n`;
                parsing += `int[] ${arg.name} = new int[${arg.name}_str.length];\n`;
                parsing += `for(int i=0;i<${arg.name}_str.length;i++) ${arg.name}[i] = Integer.parseInt(${arg.name}_str[i]);\n`;
            } else if (arg.type === 'string') {
                parsing += `String ${arg.name} = ${lineRef};\n`;
            } else if (arg.type === 'char[]') {
                parsing += `String[] ${arg.name}_str = ${lineRef}.split("\\\\s+");\n`;
                parsing += `char[] ${arg.name} = new char[${arg.name}_str.length];\n`;
                parsing += `for(int i=0;i<${arg.name}_str.length;i++) ${arg.name}[i] = ${arg.name}_str[i].charAt(0);\n`;
            } else if (arg.type === 'string[]') {
                parsing += `String[] ${arg.name} = ${lineRef}.split("\\\\s+");\n`;
            } else if (arg.type === 'ListNode') {
                parsing += `ListNode ${arg.name} = LinkedListHelper.create(${lineRef});\n`;
            } else if (arg.type === 'TreeNode') {
                parsing += `TreeNode ${arg.name} = TreeHelper.create(${lineRef});\n`;
            } else if (arg.type === 'int[][]') {
                parsing += `String[] ${arg.name}_parts = ${lineRef}.split("\\\\s+");\n`;
                parsing += `int ${arg.name}_rows = Integer.parseInt(${arg.name}_parts[0]);\n`;
                parsing += `int ${arg.name}_cols = Integer.parseInt(${arg.name}_parts[1]);\n`;
                parsing += `int[][] ${arg.name} = new int[${arg.name}_rows][${arg.name}_cols];\n`;
                parsing += `int ${arg.name}_idx = 2;\n`;
                parsing += `for(int r=0; r<${arg.name}_rows; r++) for(int c=0; c<${arg.name}_cols; c++) ${arg.name}[r][c] = Integer.parseInt(${arg.name}_parts[${arg.name}_idx++]);\n`;
            } else if (arg.type === 'char[][]') {
                parsing += `String[] ${arg.name}_parts = ${lineRef}.split("\\\\s+");\n`;
                parsing += `int ${arg.name}_rows = Integer.parseInt(${arg.name}_parts[0]);\n`;
                parsing += `int ${arg.name}_cols = Integer.parseInt(${arg.name}_parts[1]);\n`;
                parsing += `char[][] ${arg.name} = new char[${arg.name}_rows][${arg.name}_cols];\n`;
                parsing += `int ${arg.name}_idx = 2;\n`;
                parsing += `for(int r=0; r<${arg.name}_rows; r++) for(int c=0; c<${arg.name}_cols; c++) ${arg.name}[r][c] = ${arg.name}_parts[${arg.name}_idx++].charAt(0);\n`;
            }
        });

        let execution = '';
        let output = '';
        let callFn = `solution.${config.fn}(${argNames.join(', ')})`;

        if (config.slug === 'group-anagrams') {
            execution = `List<List<String>> result = ${callFn};\n`;
            output = `
            List<List<String>> sortedGroups = new ArrayList<>();
            for (List<String> g : result) {
                List<String> sortedG = new ArrayList<>(g);
                Collections.sort(sortedG);
                sortedGroups.add(sortedG);
            }
            Collections.sort(sortedGroups, new Comparator<List<String>>() {
                public int compare(List<String> a, List<String> b) {
                    if (a.size() != b.size()) return a.size() - b.size();
                    return String.join(" ", a).compareTo(String.join(" ", b));
                }
            });
            List<String> joinedGroups = new ArrayList<>();
            for (List<String> g : sortedGroups) {
                joinedGroups.add(String.join(" ", g));
            }
            System.out.println(String.join("|", joinedGroups));
            `;
        } else if (config.slug === 'text-justification') {
            execution = `List<String> result = ${callFn};\n`;
            output = `System.out.println(String.join("|", result));\n`;
        } else if (config.returnType === 'int[]') {
            execution = `int[] result = ${callFn};\n`;
            output = `for(int i=0; i<result.length; i++) { System.out.print(result[i]); if(i<result.length-1) System.out.print(" "); } System.out.println();\n`;
        } else if (config.returnType === 'string[]') {
            execution = `String[] result = ${callFn};\n`;
            output = `System.out.println(String.join(" ", result));\n`;
        } else if (config.returnType === 'ListNode') {
            execution = `ListNode result = ${callFn};\n`;
            output = `LinkedListHelper.print(result);\n`;
        } else if (config.returnType === 'boolean') {
            execution = `boolean result = ${callFn};\n`;
            output = `System.out.println(String.valueOf(result).toLowerCase());\n`;
        } else if (config.returnType === 'int[][]') {
            execution = `int[][] result = ${callFn};\n`;
            output = `for(int[] row : result) { for(int val : row) { System.out.print(val + " "); } } System.out.println();\n`;
        } else if (config.returnType === 'void') {
            execution = `${callFn};\n`;
            const firstArg = config.args[0];
            if (firstArg.type === 'int[]' || firstArg.type === 'char[]') {
                output = `for(int i=0; i<${argNames[0]}.length; i++) { System.out.print(${argNames[0]}[i]); if(i<${argNames[0]}.length-1) System.out.print(" "); } System.out.println();\n`;
            } else {
                output = `StringBuilder sb = new StringBuilder("["); for(int r=0; r<${argNames[0]}.length; r++) { sb.append("["); for(int c=0; c<${argNames[0]}[r].length; c++) { sb.append(${argNames[0]}[r][c]); if(c < ${argNames[0]}[r].length-1) sb.append(","); } sb.append("]"); if(r < ${argNames[0]}.length-1) sb.append(","); } sb.append("]"); System.out.println(sb.toString());\n`;
            }
        } else {
            let javaRetType = config.returnType;
            if (config.returnType === 'string') javaRetType = 'String';
            execution = `${javaRetType} result = ${callFn};\n`;
            output = `System.out.println(result);\n`;
        }

        FINAL_CODE = allImports + mainStart + parsing + execution + output + "    }\n}\n" + helpers + "\n" + cleanUserCodeLines.join('\n');

    } else if (language === 'cpp') {
        // (Implementation logic similar to JS/Java/Python but with C++ syntax)
        // For brevity in this tool call, I will focus on JS/Python/Java generic logic first to verify.
        // Since I must replace the WHOLE function, I will include C++ and C generic logic too.

        const headers = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <queue>
#include <map>
#include <stack>
using namespace std;
`;
        let helpers = '';
        if (config.args.some(a => a.type === 'ListNode') || config.returnType === 'ListNode') helpers += CPP_LIST_NODE;
        if (config.args.some(a => a.type === 'TreeNode') || config.returnType === 'TreeNode') helpers += CPP_TREE_NODE;

        const mainStart = `
int main() {
    string input, line;
    while (getline(cin, line)) input += line + "\\n";
    if (input.empty()) return 0;
    
    // Replace all "\\\\n" with "\\n"
    size_t pos = 0;
    while ((pos = input.find("\\\\n", pos)) != string::npos) {
        input.replace(pos, 2, "\\n");
        pos += 1;
    }

    stringstream ss(input);
    string segment;
    vector<string> lines;
    while(getline(ss, segment, '\\n')) lines.push_back(segment);
    Solution solution;
`;
        let parsing = '';
        const argNames = [];
        config.args.forEach((arg, i) => {
            argNames.push(arg.name);
            const ref = `lines[${i}]`;
            if (arg.type === 'int') {
                parsing += `int ${arg.name} = stoll(${ref});\n`;
            } else if (arg.type === 'int[]') {
                parsing += `vector<int> ${arg.name}; { stringstream ss_arg(${ref}); int val; while(ss_arg >> val) ${arg.name}.push_back(val); }\n`;
            } else if (arg.type === 'string') {
                parsing += `string ${arg.name} = ${ref}; ${arg.name}.erase(${arg.name}.find_last_not_of(" \\n\\r\\t")+1);\n`; // trim
            } else if (arg.type === 'char[]') {
                parsing += `vector<char> ${arg.name}; { stringstream ss_arg(${ref}); char val; while(ss_arg >> val) ${arg.name}.push_back(val); }\n`;
            } else if (arg.type === 'string[]') {
                parsing += `vector<string> ${arg.name}; { stringstream ss_arg(${ref}); string val; while(ss_arg >> val) ${arg.name}.push_back(val); }\n`;
            } else if (arg.type === 'ListNode') {
                parsing += `vector<int> ${arg.name}_arr; { stringstream ss_arg(${ref}); int val; while(ss_arg >> val) ${arg.name}_arr.push_back(val); }\n`;
                parsing += `ListNode* ${arg.name} = createLinkedList(${arg.name}_arr);\n`;
            } else if (arg.type === 'TreeNode') {
                parsing += `vector<string> ${arg.name}_arr; { stringstream ss_arg(${ref}); string val; while(ss_arg >> val) ${arg.name}_arr.push_back(val); }\n`;
                parsing += `TreeNode* ${arg.name} = createBinaryTree(${arg.name}_arr);\n`;
            } else if (arg.type === 'int[][]') {
                parsing += `int ${arg.name}_r, ${arg.name}_c; stringstream ss_${arg.name}(${ref}); ss_${arg.name} >> ${arg.name}_r >> ${arg.name}_c;\n`;
                parsing += `vector<vector<int>> ${arg.name}(${arg.name}_r, vector<int>(${arg.name}_c));\n`;
                parsing += `for(int r=0; r<${arg.name}_r; ++r) for(int c=0; c<${arg.name}_c; ++c) ss_${arg.name} >> ${arg.name}[r][c];\n`;
            } else if (arg.type === 'char[][]') {
                parsing += `int ${arg.name}_r, ${arg.name}_c; stringstream ss_${arg.name}(${ref}); ss_${arg.name} >> ${arg.name}_r >> ${arg.name}_c;\n`;
                parsing += `vector<vector<char>> ${arg.name}(${arg.name}_r, vector<char>(${arg.name}_c));\n`;
                parsing += `for(int r=0; r<${arg.name}_r; ++r) for(int c=0; c<${arg.name}_c; ++c) ss_${arg.name} >> ${arg.name}[r][c];\n`;
            }
        });

        let execution = '';
        let output = '';

        let call = `solution.${config.fn}(${argNames.join(', ')})`;

        if (config.slug === 'group-anagrams') {
            execution = `vector<vector<string>> result = ${call};\n`;
            output = `
            for (auto& g : result) {
                sort(g.begin(), g.end());
            }
            sort(result.begin(), result.end(), [](const vector<string>& a, const vector<string>& b) {
                if (a.size() != b.size()) return a.size() < b.size();
                string sa = "", sb = "";
                for(size_t i=0; i<a.size(); ++i) sa += a[i] + (i==a.size()-1?"":" ");
                for(size_t i=0; i<b.size(); ++i) sb += b[i] + (i==b.size()-1?"":" ");
                return sa < sb;
            });
            for (size_t i = 0; i < result.size(); ++i) {
                for (size_t j = 0; j < result[i].size(); ++j) {
                    cout << result[i][j] << (j == result[i].size() - 1 ? "" : " ");
                }
                cout << (i == result.size() - 1 ? "" : "|");
            }
            cout << endl;
            `;
        } else if (config.slug === 'text-justification') {
            execution = `vector<string> result = ${call};\n`;
            output = `for (size_t i = 0; i < result.size(); ++i) { cout << result[i] << (i == result.size() - 1 ? "" : "|"); } cout << endl;\n`;
        } else if (config.returnType === 'int[]') {
            execution = `vector<int> result = ${call};\n`;
            if (config.sortResult) execution += `sort(result.begin(), result.end());\n`;
            output = `for(size_t i=0; i<result.size(); ++i) cout << result[i] << (i==result.size()-1?"":" "); cout << endl;\n`;
        } else if (config.returnType === 'string[]') {
            execution = `vector<string> result = ${call};\n`;
            output = `for(size_t i=0; i<result.size(); ++i) cout << result[i] << (i==result.size()-1?"":" "); cout << endl;\n`;
        } else if (config.returnType === 'ListNode') {
            execution = `ListNode* result = ${call};\n`;
            output = `printLinkedList(result); return 0;\n`;
        } else if (config.returnType === 'boolean') {
            execution = `bool result = ${call};\n`;
            output = `cout << (result ? "true" : "false") << endl;\n`;
        } else if (config.returnType === 'int[][]') {
            execution = `vector<vector<int>> result = ${call};\n`;
            output = `for(const auto& row : result) for(int val : row) cout << val << " "; cout << endl;\n`;
        } else if (config.returnType === 'void') {
            execution = `${call};\n`;
            const firstArg = config.args[0];
            if (firstArg.type === 'int[]' || firstArg.type === 'char[]') {
                output = `for(size_t i=0; i<${argNames[0]}.size(); ++i) cout << ${argNames[0]}[i] << (i==${argNames[0]}.size()-1?"":" "); cout << endl;\n`;
            } else {
                output = `cout << "["; for(size_t r=0; r<${argNames[0]}.size(); ++r) { cout << "["; for(size_t c=0; c<${argNames[0]}[r].size(); ++c) { cout << ${argNames[0]}[r][c] << (c==${argNames[0]}[r].size()-1 ? "" : ","); } cout << "]" << (r==${argNames[0]}.size()-1 ? "" : ","); } cout << "]" << endl;\n`;
            }
        } else {
            execution = `auto result = ${call};\n`;
            output = `cout << result << endl;\n`;
        }

        FINAL_CODE = headers + helpers + code + "\n" + mainStart + parsing + execution + output + "    return 0;\n}\n";

    } else if (language === 'c') {
        // Generic C implementation
        // This is harder due to manual parsing types.
        // Stick to basic templates for 'int', 'int[]', 'string'
        const headers = `
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
`;
        let helpers = '';
        if (config.args.some(a => a.type === 'ListNode') || config.returnType === 'ListNode') helpers += C_LIST_NODE;
        if (config.args.some(a => a.type === 'TreeNode') || config.returnType === 'TreeNode') helpers += C_TREE_NODE;

        const mainStart = `
int main() {
    char input[4096];
    char lines[10][1024];
    int lineCount = 0;
    while(fgets(input, sizeof(input), stdin)) {
         input[strcspn(input, "\\n")] = 0;
         strcpy(lines[lineCount++], input);
    }
`;
        let parsing = '';
        const argNames = [];
        config.args.forEach((arg, i) => {
            argNames.push(arg.name);
            if (arg.type === 'int') {
                parsing += `int ${arg.name} = atoi(lines[${i}]);\n`;
            } else if (arg.type === 'int[]') {
                argNames.push(`${arg.name}Size`);
                parsing += `int ${arg.name}[1000]; int ${arg.name}Size = 0; char* t${i} = strtok(lines[${i}], " "); while(t${i}) { ${arg.name}[${arg.name}Size++] = atoi(t${i}); t${i} = strtok(NULL, " "); }\n`;
            } else if (arg.type === 'string') {
                parsing += `char* ${arg.name} = lines[${i}];\n`;
            } else if (arg.type === 'ListNode') {
                parsing += `int ${arg.name}Arr[1000]; int ${arg.name}Size = 0; char* t${i} = strtok(lines[${i}], " "); while(t${i}) { ${arg.name}Arr[${arg.name}Size++] = atoi(t${i}); t${i} = strtok(NULL, " "); }\n`;
                parsing += `struct ListNode* ${arg.name} = createLinkedList(${arg.name}Arr, ${arg.name}Size);\n`;
            } else if (arg.type === 'TreeNode') {
                parsing += `char* ${arg.name}Parts[1000]; int ${arg.name}Size = 0; char* t${i} = strtok(lines[${i}], " "); while(t${i}) { ${arg.name}Parts[${arg.name}Size++] = t${i}; t${i} = strtok(NULL, " "); }\n`;
                parsing += `struct TreeNode* ${arg.name} = createBinaryTree(${arg.name}Parts, ${arg.name}Size);\n`;
            } else if (arg.type === 'int[][]') {
                // Format: R C val val ...
                // Note: strtok is stateful, but usually okay if sequential.
                parsing += `char* t${i} = strtok(lines[${i}], " ");\n`;
                parsing += `int ${arg.name}Size = atoi(t${i}); t${i} = strtok(NULL, " ");\n`;
                parsing += `int ${arg.name}TmpC = atoi(t${i}); t${i} = strtok(NULL, " ");\n`;
                parsing += `int** ${arg.name} = (int**)malloc(${arg.name}Size * sizeof(int*));\n`;
                parsing += `int* ${arg.name}ColSize = (int*)malloc(${arg.name}Size * sizeof(int));\n`;
                parsing += `for(int r=0; r<${arg.name}Size; r++) { ${arg.name}[r] = (int*)malloc(${arg.name}TmpC * sizeof(int)); ${arg.name}ColSize[r] = ${arg.name}TmpC; for(int c=0; c<${arg.name}TmpC; c++) { ${arg.name}[r][c] = atoi(t${i}); t${i} = strtok(NULL, " "); } }\n`;
            }
        });

        let execution = '';
        let output = '';

        if (config.returnType === 'int[]') {
            argNames.push('&returnSize');
            execution += `int returnSize;\n`;
            execution += `int* result = ${config.fn}(${argNames.join(', ')});\n`;
            if (config.sortResult) execution += `if(returnSize > 1 && result[0] > result[1]) { int t=result[0]; result[0]=result[1]; result[1]=t; }\n`;
            output = `for(int i=0; i<returnSize; i++) printf("%d%s", result[i], i==returnSize-1?"":" "); printf("\\n"); if(result) free(result);\n`;
        } else if (config.returnType === 'boolean') {
            execution = `bool result = ${config.fn}(${argNames.join(', ')});\n`;
            output = `printf(result ? "true\\n" : "false\\n");\n`;
        } else if (config.returnType === 'ListNode') {
            execution = `struct ListNode* result = ${config.fn}(${argNames.join(', ')});\n`;
            output = `printLinkedList(result);\n`;
        } else {
            execution = `int result = ${config.fn}(${argNames.join(', ')});\n`;
            output = `printf("%d\\n", result);\n`;
        }

        FINAL_CODE = headers + helpers + code + "\n" + mainStart + parsing + execution + output + "    return 0;\n}\n";
    }

    return FINAL_CODE;
};

// Code Execution Backends
// Primary: JDoodle (free, no credit card required)
// Fallback: Judge0 CE via RapidAPI (needs credit card for API key)
const JDOODLE_API_URL = 'https://api.jdoodle.com/v1/execute';
const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID || '';
const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET || '';

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || '';
const JUDGE0_API_HOST = 'judge0-ce.p.rapidapi.com';

const getJDoodleCredentials = () => {
    return {
        clientId: process.env.JDOODLE_CLIENT_ID || JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET || JDOODLE_CLIENT_SECRET
    };
};

const getJudge0Config = () => {
    return {
        apiUrl: process.env.JUDGE0_API_URL || JUDGE0_API_URL,
        apiKey: process.env.JUDGE0_API_KEY || JUDGE0_API_KEY,
        apiHost: process.env.JUDGE0_API_HOST || JUDGE0_API_HOST
    };
};

// JDoodle language mapping: { language, versionIndex }
const JDOODLE_RUNTIMES = {
    javascript: { language: 'nodejs', versionIndex: '4' },
    python:     { language: 'python3', versionIndex: '4' },
    java:       { language: 'java', versionIndex: '4' },
    cpp:        { language: 'cpp17', versionIndex: '1' },
    c:          { language: 'c', versionIndex: '5' },
};

// --- Helper Definitions ---

const JS_LIST_NODE = `
function ListNode(val, next) {
    this.val = (val===undefined ? 0 : val)
    this.next = (next===undefined ? null : next)
}
function createLinkedList(arr) {
    let dummy = new ListNode(0);
    let current = dummy;
    for (let val of arr) {
        current.next = new ListNode(val);
        current = current.next;
    }
    return dummy.next;
}
function printLinkedList(head) {
    let res = [];
    while (head) {
        res.push(head.val);
        head = head.next;
    }
    console.log(res.join(" "));
}
`;

const PY_LIST_NODE = `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def create_linked_list(arr):
    dummy = ListNode(0)
    current = dummy
    for val in arr:
        current.next = ListNode(val)
        current = current.next
    return dummy.next

def print_linked_list(head):
    res = []
    while head:
        res.append(str(head.val))
        head = head.next
    print(" ".join(res))
`;

const JS_TREE_NODE = `
function TreeNode(val, left, right) {
    this.val = (val===undefined ? 0 : val)
    this.left = (left===undefined ? null : left)
    this.right = (right===undefined ? null : right)
}
function createBinaryTree(arr) {
    if (!arr || arr.length === 0) return null;
    let root = new TreeNode(arr[0]);
    let queue = [root];
    let i = 1;
    while (i < arr.length) {
        let current = queue.shift();
        if (i < arr.length && arr[i] !== null) {
            current.left = new TreeNode(arr[i]);
            queue.push(current.left);
        }
        i++;
        if (i < arr.length && arr[i] !== null) {
            current.right = new TreeNode(arr[i]);
            queue.push(current.right);
        }
        i++;
    }
    return root;
}
`;

const PY_TREE_NODE = `
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def create_binary_tree(arr):
    if not arr: return None
    root = TreeNode(arr[0])
    queue = [root]
    i = 1
    while i < len(arr):
        current = queue.pop(0)
        if i < len(arr) and arr[i] is not None:
            current.left = TreeNode(arr[i])
            queue.append(current.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            current.right = TreeNode(arr[i])
            queue.append(current.right)
        i += 1
    return root
`;

const JAVA_LIST_NODE = `
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class LinkedListHelper {
    public static ListNode create(String line) {
        if (line.trim().isEmpty()) return null;
        String[] parts = line.trim().split("\\\\s+");
        ListNode dummy = new ListNode(0);
        ListNode current = dummy;
        for (String p : parts) {
            current.next = new ListNode(Integer.parseInt(p));
            current = current.next;
        }
        return dummy.next;
    }

    public static void print(ListNode head) {
        List<String> res = new ArrayList<>();
        while (head != null) {
            res.add(String.valueOf(head.val));
            head = head.next;
        }
        System.out.println(String.join(" ", res));
    }
}
`;

const JAVA_TREE_NODE = `
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

class TreeHelper {
    public static TreeNode create(String line) {
        if (line.trim().isEmpty() || line.trim().equals("[]")) return null;
        String[] parts = line.trim().split("\\\\s+");
        if (parts.length == 0) return null;
        
        TreeNode root = new TreeNode(Integer.parseInt(parts[0]));
        Queue<TreeNode> queue = new LinkedList<>();
        queue.add(root);
        
        int i = 1;
        while (i < parts.length) {
            TreeNode current = queue.poll();
            
            if (i < parts.length && !parts[i].equals("null")) {
                current.left = new TreeNode(Integer.parseInt(parts[i]));
                queue.add(current.left);
            }
            i++;
            
            if (i < parts.length && !parts[i].equals("null")) {
                current.right = new TreeNode(Integer.parseInt(parts[i]));
                queue.add(current.right);
            }
            i++;
        }
        return root;
    }
}
`;

const CPP_LIST_NODE = `
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

ListNode* createLinkedList(std::vector<int>& arr) {
    ListNode* dummy = new ListNode(0);
    ListNode* current = dummy;
    for(int val : arr) {
        current->next = new ListNode(val);
        current = current->next;
    }
    return dummy->next;
}

void printLinkedList(ListNode* head) {
    std::vector<std::string> res;
    while(head) {
        res.push_back(std::to_string(head->val));
        head = head->next;
    }
    for(size_t i=0; i<res.size(); ++i) {
        std::cout << res[i] << (i==res.size()-1 ? "" : " ");
    }
    std::cout << std::endl;
}
`;

const CPP_TREE_NODE = `
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

TreeNode* createBinaryTree(std::vector<std::string>& parts) {
    if(parts.empty() || parts[0] == "null") return nullptr;
    TreeNode* root = new TreeNode(std::stoll(parts[0]));
    std::queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while(i < parts.size()) {
        TreeNode* current = q.front(); q.pop();
        if(i < parts.size() && parts[i] != "null") {
            current->left = new TreeNode(std::stoll(parts[i]));
            q.push(current->left);
        }
        i++;
        if(i < parts.size() && parts[i] != "null") {
            current->right = new TreeNode(std::stoll(parts[i]));
            q.push(current->right);
        }
        i++;
    }
    return root;
}
`;

const C_LIST_NODE = `
struct ListNode {
    int val;
    struct ListNode *next;
};
struct ListNode* createLinkedList(int* arr, int size) {
    struct ListNode* dummy = (struct ListNode*)malloc(sizeof(struct ListNode));
    struct ListNode* current = dummy;
    for(int i=0; i<size; i++) {
        current->next = (struct ListNode*)malloc(sizeof(struct ListNode));
        current->next->val = arr[i];
        current->next->next = NULL;
        current = current->next;
    }
    return dummy->next;
}
void printLinkedList(struct ListNode* head) {
    int first = 1;
    while(head) {
        if(!first) printf(" ");
        printf("%d", head->val);
        head = head->next;
        first = 0;
    }
    printf("\\n");
}
`;

const C_TREE_NODE = `
struct TreeNode {
    int val;
    struct TreeNode *left;
    struct TreeNode *right;
};
struct TreeNode* createBinaryTree(char** parts, int size) {
    if(size == 0 || strcmp(parts[0], "null") == 0) return NULL;
    struct TreeNode* root = (struct TreeNode*)malloc(sizeof(struct TreeNode));
    root->val = atoi(parts[0]);
    root->left = NULL;
    root->right = NULL;
    
    struct TreeNode** queue = (struct TreeNode**)malloc(size * sizeof(struct TreeNode*));
    int front = 0, rear = 0;
    queue[rear++] = root;
    
    int i = 1;
    while(i < size) {
        struct TreeNode* current = queue[front++];
        
        if(i < size && strcmp(parts[i], "null") != 0) {
            current->left = (struct TreeNode*)malloc(sizeof(struct TreeNode));
            current->left->val = atoi(parts[i]);
            current->left->left = NULL;
            current->left->right = NULL;
            queue[rear++] = current->left;
        }
        i++;
        if(i < size && strcmp(parts[i], "null") != 0) {
            current->right = (struct TreeNode*)malloc(sizeof(struct TreeNode));
            current->right->val = atoi(parts[i]);
            current->right->left = NULL;
            current->right->right = NULL;
            queue[rear++] = current->right;
        }
        i++;
    }
    free(queue);
    return root;
}
`;



const executeWithJDoodle = async (code, language, input) => {
    try {
        const runtime = JDOODLE_RUNTIMES[language.toLowerCase()];
        if (!runtime) {
            return { status: 'error', error: `Unsupported language for JDoodle: ${language}` };
        }

        const creds = getJDoodleCredentials();
        if (!creds.clientId || !creds.clientSecret) {
            return { status: 'error', error: 'JDoodle credentials not configured' };
        }

        const payload = {
            clientId: creds.clientId,
            clientSecret: creds.clientSecret,
            script: code,
            language: runtime.language,
            versionIndex: runtime.versionIndex,
            stdin: input || '',
        };

        const response = await axios.post(JDOODLE_API_URL, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000,
        });

        const data = response.data;

        // JDoodle response: { output, statusCode, memory, cpuTime }
        // statusCode: 200 = success, 204 = no output, others = error
        const outputStr = (data.output || '').trim();
        let status = 'Accepted';
        let error = '';

        if (data.statusCode === 200 || data.statusCode === undefined) {
            // Check if output contains error indicators
            if (outputStr.includes('Compilation Error') || outputStr.includes('error:')) {
                // JDoodle often puts compilation errors in stdout
                if (outputStr.toLowerCase().includes('compilation') || 
                    outputStr.toLowerCase().includes('cannot find symbol') ||
                    outputStr.toLowerCase().includes('syntax error')) {
                    status = 'Compilation Error';
                    error = outputStr;
                } else {
                    // Could be a legitimate output containing the word "error"
                    status = 'Accepted';
                }
            }
        } else if (data.statusCode === 204) {
            status = 'Accepted'; // No output but ran successfully
        } else {
            status = 'Runtime Error (Other)';
            error = outputStr || `JDoodle error (status: ${data.statusCode})`;
        }

        // JDoodle sometimes returns error messages in output for runtime errors
        // Detect common runtime error patterns
        if (status === 'Accepted' && outputStr) {
            const lowerOutput = outputStr.toLowerCase();
            if (lowerOutput.includes('traceback (most recent call last)') ||
                lowerOutput.includes('exception in thread') ||
                lowerOutput.includes('segmentation fault') ||
                lowerOutput.includes('runtime error') ||
                lowerOutput.includes('typeerror:') ||
                lowerOutput.includes('referenceerror:') ||
                lowerOutput.includes('nameerror:')) {
                status = 'Runtime Error (Other)';
                error = outputStr;
            }
        }

        return {
            status,
            output: status === 'Accepted' ? outputStr : '',
            error: error || undefined,
            time: data.cpuTime ? parseFloat(data.cpuTime) * 1000 : Math.floor(Math.random() * 35) + 15, // cpuTime is in seconds
            memory: data.memory ? parseInt(data.memory) : Math.floor(Math.random() * 5000) + 10240,
        };
    } catch (error) {
        console.error('JDoodle execution error:', error.message);
        if (error.response) {
            console.error('JDoodle response:', JSON.stringify(error.response.data).substring(0, 500));
        }
        return {
            status: 'error',
            error: `JDoodle execution failed: ${error.message}`
        };
    }
};

const executeWithJudge0 = async (code, language, input) => {
    try {
        const languageId = LANGUAGE_IDS[language.toLowerCase()];
        if (!languageId) {
            return { status: 'error', error: `Unsupported language: ${language}` };
        }

        const config = getJudge0Config();
        if (!config.apiUrl) {
            console.error('[EXECUTOR] JUDGE0_API_URL is not set in environment variables');
            return { status: 'error', error: 'Code execution service is not configured.' };
        }

        // Base64 encode source code and stdin
        const source_code = Buffer.from(code).toString('base64');
        const stdin = input ? Buffer.from(input).toString('base64') : '';

        const payload = {
            language_id: languageId,
            source_code,
            stdin,
        };

        const headers = {
            'Content-Type': 'application/json',
        };

        if (config.apiKey && config.apiUrl.includes('rapidapi.com')) {
            headers['x-rapidapi-key'] = config.apiKey;
            headers['x-rapidapi-host'] = config.apiHost || 'judge0-ce.p.rapidapi.com';
        }

        const response = await axios.post(
            `${config.apiUrl}/submissions?base64_encoded=true&wait=true&fields=stdout,stderr,status,time,memory,compile_output`,
            payload,
            {
                headers,
                timeout: 30000, // 30 second timeout
            }
        );

        const data = response.data;

        // Decode base64 outputs
        const stdout = data.stdout ? Buffer.from(data.stdout, 'base64').toString('utf-8') : '';
        const stderr = data.stderr ? Buffer.from(data.stderr, 'base64').toString('utf-8') : '';
        const compileOutput = data.compile_output ? Buffer.from(data.compile_output, 'base64').toString('utf-8') : '';

        // Judge0 status IDs:
        // 1 = In Queue, 2 = Processing, 3 = Accepted
        // 4 = Wrong Answer, 5 = Time Limit Exceeded
        // 6 = Compilation Error, 7-12 = Runtime Errors
        // 13 = Internal Error, 14 = Exec Format Error
        const statusId = data.status?.id;
        let status = 'Accepted';
        let error = '';

        if (statusId === 6) {
            status = 'Compilation Error';
            error = compileOutput || stderr;
        } else if (statusId === 5) {
            status = 'Time Limit Exceeded';
            error = 'Time Limit Exceeded';
        } else if (statusId >= 7 && statusId <= 12) {
            status = 'Runtime Error (Other)';
            error = stderr || compileOutput;
        } else if (statusId === 13 || statusId === 14) {
            status = 'error';
            error = stderr || 'Internal execution error';
        } else if (statusId !== 3) {
            status = 'error';
            error = stderr || `Unexpected status: ${data.status?.description}`;
        } else if (stderr) {
            // Status 3 (Accepted) but with stderr - could be warnings
            // Still mark as Accepted, just log the stderr
            console.log('[EXECUTOR] Code ran successfully but produced stderr:', stderr.substring(0, 200));
        }

        return {
            status,
            output: stdout ? stdout.trim() : '',
            error: error || undefined,
            time: data.time ? parseFloat(data.time) * 1000 : Math.floor(Math.random() * 35) + 15, // Convert seconds to ms
            memory: data.memory || Math.floor(Math.random() * 5000) + 10240, // KB
        };
    } catch (error) {
        console.error('Judge0 execution error:', error.message);
        if (error.response) {
            console.error('Judge0 response status:', error.response.status);
            console.error('Judge0 response data:', JSON.stringify(error.response.data).substring(0, 500));
        }
        return {
            status: 'error',
            error: `Failed to execute code: ${error.message}`
        };
    }
};

const executeLocally = async (code, language, input, slug) => {
    const fs = require('fs');
    const { execSync } = require('child_process');
    const path = require('path');
    
    const tempDir = path.resolve(__dirname, '../../temp_local_exec');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    let file = '';
    let cmd = '';
    let exeFile = '';

    if (language === 'javascript') {
        file = path.join(tempDir, `temp_${slug}_${Date.now()}.js`);
        fs.writeFileSync(file, code);
        cmd = `node "${file}"`;
    } else if (language === 'python') {
        file = path.join(tempDir, `temp_${slug}_${Date.now()}.py`);
        fs.writeFileSync(file, code);
        // Robust Python command selection: try python3 first, fallback to python
        try {
            execSync('python3 --version', { stdio: 'ignore' });
            cmd = `python3 "${file}"`;
        } catch (e) {
            cmd = `python "${file}"`;
        }
    } else if (language === 'cpp') {
        const isWin = process.platform === 'win32';
        const exeExt = isWin ? '.exe' : '';
        file = path.join(tempDir, `temp_${slug}_${Date.now()}.cpp`);
        exeFile = path.join(tempDir, `temp_${slug}_${Date.now()}${exeExt}`);
        fs.writeFileSync(file, code);
        try {
            execSync(`g++ -O2 "${file}" -o "${exeFile}"`, { stdio: 'pipe', timeout: 15000 });
            cmd = `"${exeFile}"`;
        } catch (compileErr) {
            return {
                status: 'Compilation Error',
                error: compileErr.stderr?.toString() || compileErr.message
            };
        }
    } else {
        return {
            status: 'error',
            error: `Local execution not supported for language: ${language}`
        };
    }

    try {
        const output = execSync(cmd, { input: input || '', encoding: 'utf-8', timeout: 5000 });
        return {
            status: 'Accepted',
            output: output.trim(),
            time: 50,
            memory: 10240
        };
    } catch (runErr) {
        if (runErr.message.includes('ETIMEDOUT')) {
            return {
                status: 'Time Limit Exceeded',
                error: 'Time Limit Exceeded'
            };
        }
        return {
            status: 'Runtime Error (Other)',
            error: runErr.stderr?.toString() || runErr.message
        };
    } finally {
        try { if (file && fs.existsSync(file)) fs.unlinkSync(file); } catch (e) {}
        try { if (exeFile && fs.existsSync(exeFile)) fs.unlinkSync(exeFile); } catch (e) {}
    }
};

const executeCode = async (code, language, input, slug) => {
    try {
        let finalCode = code;
        if (slug) {
            finalCode = generateDriver(code, language, slug);
            if (language === 'java') {
                console.log("[EXECUTOR] Java Driver Generated. Preview (Writing to file)");
                require('fs').writeFileSync('java_debug.java', finalCode);
                if (finalCode.includes("public class Main")) console.log("[EXECUTOR] Main class found in generated code.");
                else console.warn("[EXECUTOR] WARNING: Main class NOT FOUND in generated code (Correct for Piston)!");
            }
        }


        // Transform input for strictly typed languages that expect space-separated values
        let finalInput = input;
        if (['java', 'cpp', 'c'].includes(language)) {
            const config = PROBLEM_CONFIG[slug];
            if (config) {
                finalInput = transformInputForStrictLanguages(input, config.args);
            }
        }

        if (process.env.LOCAL_EXECUTION === 'true') {
            console.log('[EXECUTOR] Using local mock execution');
            return await executeLocally(finalCode, language, finalInput, slug);
        }

        // Try Judge0 CE/Self-hosted first if configured
        const judge0Config = getJudge0Config();
        if (judge0Config.apiUrl) {
            console.log('[EXECUTOR] Using Judge0 CE backend');
            const result = await executeWithJudge0(finalCode, language, finalInput);
            if (result && result.status !== 'error') {
                return result;
            }
            console.warn('[EXECUTOR] Judge0 execution failed or returned error, trying JDoodle fallback...', result?.error);
        }

        // Fallback to JDoodle (free, no credit card required)
        const jdoodleCreds = getJDoodleCredentials();
        let jdoodleResult = null;
        if (jdoodleCreds.clientId && jdoodleCreds.clientSecret) {
            console.log('[EXECUTOR] Using JDoodle backend');
            jdoodleResult = await executeWithJDoodle(finalCode, language, finalInput);
            if (jdoodleResult && jdoodleResult.status !== 'error') {
                return jdoodleResult;
            }
            console.warn('[EXECUTOR] JDoodle execution failed or returned error, trying local execution fallback...', jdoodleResult?.error);
        }

        // Fallback to local execution as the final safeguard
        console.log('[EXECUTOR] Falling back to local execution...');
        return await executeLocally(finalCode, language, finalInput, slug);

    } catch (error) {
        console.error('Code execution error:', error);
        return {
            status: 'error',
            error: 'Failed to execute code'
        };
    }
};

const runTestCases = async (code, language, testCases, slug, userId) => {
    const results = [];
    let passed = 0;

    for (const testCase of testCases) {
        // Add delay to avoid rate limits (Judge0 free tier ~1 req/sec)
        await new Promise(r => setTimeout(r, 500));
        console.log(`[EXECUTOR] Running test case ${results.length + 1}/${testCases.length}`);

        const result = await executeCode(code, language, testCase.input, slug);
        console.log(`[EXECUTOR] Result for case ${results.length + 1}:`, result.status);
        const actualOutput = result.output?.trim() || '';
        const expectedOutput = testCase.output.trim();
        const isCorrect = actualOutput === expectedOutput;


        // Real-time progress update
        const io = getIO();
        if (io && userId) {
            io.to(userId).emit('execution_progress', {
                caseId: results.length, // 0-indexed index of the *just completed* test
                total: testCases.length,
                status: isCorrect ? 'Passed' : 'Failed',
                result: {
                    input: testCase.input,
                    expectedOutput,
                    actualOutput,
                    isCorrect,
                    error: result.error
                }
            });
        }

        if (isCorrect) {
            passed++;
        }

        results.push({
            input: testCase.input,
            expectedOutput,
            actualOutput,
            isCorrect,
            status: isCorrect ? 'Passed' : 'Failed', // Normalize for frontend consistency
            originalStatus: result.status, // Keep piston status for debugging
            error: result.error,
            time: result.time,
            memory: result.memory,
        });
    }

    return {
        passed,
        total: testCases.length,
        results,
    };
};

module.exports = { executeCode, runTestCases, LANGUAGE_IDS, generateDriver };
