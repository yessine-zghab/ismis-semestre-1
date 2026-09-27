#include <stdio.h>
#include <stdlib.h>

int main()
{
    int a,b;
    int bit_a;
    int bit_b;
    int identical = 0;
    int different = 0;
    printf("Donner un nombre a between -128 and 127: ");
    scanf("%d", &a);
    printf("Donner un nombre b between -128 and 127: ");
    scanf("%d", &b);
    for(int i = 0;i < 8; i++){
        bit_a = (a >> i) & 1;
        bit_b = (b >> i) & 1;
        if (bit_a == bit_b)
            identical++;
        else
            different++;
    }
    printf("le nombre binaire de a est %08b\n", a);
    printf("le nombre binaire de b est %08b\n", b);
    printf("le nombre total des bit commun est %d\n", identical);
    printf("le nombre total des bit different est %d\n", different);
    return 0;
}
