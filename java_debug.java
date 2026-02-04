
import java.util.*;
import java.io.*;
import java.util.stream.*;

class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder inputBuilder = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            inputBuilder.append(line).append("\n");
        }
        String input = inputBuilder.toString().trim();
        if (input.isEmpty()) return;
        
        String[] lines = input.replace("\\n", "\n").split("\n");
        Solution solution = new Solution();
String s = lines[0].trim();
string result = solution.decodeString(s);
System.out.println(result);
    }
}

class Solution {
    public String decodeString(String s) {
        // Your code here
    }
    return "";
}