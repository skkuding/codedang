public class Main {
    public static void main(String[] args) {
        // flood stdout until output limit or time limit kills this
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 100000; i++) {
            sb.append("AAAAAAAAAA");
        }
        String chunk = sb.toString();
        while (true) {
            System.out.println(chunk);
        }
    }
}
