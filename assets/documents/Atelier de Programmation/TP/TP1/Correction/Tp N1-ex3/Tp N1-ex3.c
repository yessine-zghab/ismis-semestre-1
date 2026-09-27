#include <stdio.h>
#include <stdlib.h>

int main()
{
    char c;
    short int s;
    int i;
    double d;
    printf("la variable c occupe adresse memoire %p avec une taille de %d", &c, sizeof(c));
    printf("\nla variable s occupe adresse memoire %p avec une taille de %d", &s, sizeof(s));
    printf("\nla variable i occupe adresse memoire %p avec une taille de %d", &i, sizeof(i));
    printf("\nla variable d occupe adresse memoire %p avec une taille de %d", &d, sizeof(d));

}
