public class Main {
    public static void main(String[] args) {
        for(int i=0; i<1000000; i++) {
            System.out.print("Output line " + i + ": ");
            for(int j=0; j<100; j++){ 
                System.out.print("a"); 
            }
            System.out.println();
        }
    }
}