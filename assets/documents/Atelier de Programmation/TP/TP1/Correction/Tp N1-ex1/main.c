#include <stdio.h>
#include <stdlib.h>

int main()
{
    int n;
    printf("Donner un entier n: ");
    scanf("%d", &n);
    printf("Décimal: n=%d", n);
    printf("\nOctal: n=%o", n);
    printf("\nHexdecimal: n=%x", n);
    return 0;
}
