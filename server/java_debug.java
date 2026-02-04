
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
String[] nums_str = lines[0].trim().split("\\s+");
int[] nums = new int[nums_str.length];
for(int i=0;i<nums_str.length;i++) nums[i] = Integer.parseInt(nums_str[i]);
int[][] result = solution.threeSum(nums);
System.out.println(result);
    }
}

class Solution {
    public int[][] threeSum(int[] nums) {
        // Your code here
    }
}