#include <stdio.h>
#include <stdlib.h>

int main()
{
    char n;
    printf("Saisir un caractere n: ");
    scanf("%c", &n);
    printf("le code ASCII de n=%c est: %u", n, n);
    n=n+5;
    printf("\nle code ASCII de n+5=%c est: %u", n, n);
    return 0;
}
