#include <iostream>
using namespace std;

int main() {
    for(int i=0; i<1000000; i++) {
        cout << "Output line " << i << ": ";
        for(int j=0; j<100; j++){ 
            cout << "a"; 
        }
        cout << endl;
    }
    return 0;
}