
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
String[] prices_str = lines[0].trim().split("\\s+");
int[] prices = new int[prices_str.length];
for(int i=0;i<prices_str.length;i++) prices[i] = Integer.parseInt(prices_str[i]);
int result = solution.maxProfit(prices);
System.out.println(result);
    }
}

class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int price : prices) {
            if (price < minPrice) {
                minPrice = price;
            } else if (price - minPrice > maxProfit) {
                maxProfit = price - minPrice;
            }
        }
        return maxProfit;
    }
}