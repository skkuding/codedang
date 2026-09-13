#include "testlib.h"

int main(int argc, char * argv[]) {
	registerTestlibCmd(argc, argv);

	int oufq = ouf.readInt();
	int ansq = ans.readInt();

	if (ansq > 25)
		quitf(_fail, "Limit is %d, but main solution have made %d queries", 25, ansq);

	if (oufq > 25)
		quitf(_wa, "Limit is %d, but solution have made %d queries", 25, oufq);

    int n = inf.readInt();
    int m = inf.readInt();
	quitf(_ok, "Number %d is guessed successfully (range [1..%d]) with %d queries", n, m, oufq);
}
