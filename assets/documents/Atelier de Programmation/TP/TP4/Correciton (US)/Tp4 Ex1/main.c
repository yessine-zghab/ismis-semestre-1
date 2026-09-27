#include <stdio.h>
#include <stdlib.h>

int main()
{
    int a,b;
    lire(&a);
    lire(&b);
    printf("a+b= %d\n",somme(a,b));
    printf("a*b= %d\n",produit(a,b));
}
void lire (int* a)
{
    do{
        printf("donner un entier positive a: ");
        scanf("%d",a);
    }while(*a<=0);
}
int somme(int a, int b)
{
    return (a+b);
}
int produit(int a, int b)
{
    return a*b;
}
