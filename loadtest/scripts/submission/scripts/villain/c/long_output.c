#include <stdio.h>
int main() {
    for(int i=0; i<1000000; i++) {
        printf("Output line %d: ", i);
        for(int j=0; j<100; j++){ 
            printf("a"); 
        }
        printf("\\n");
    }
    return 0;
}