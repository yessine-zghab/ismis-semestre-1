#include <stdio.h>
#include <stdlib.h>

int main()
{
    int a,b;
    saisir(&a);
    saisir(&b);
    printf("%d",pgcd(a,b));
}
int saisir(int* a)
{
    do{
        printf("saisir un entier: ");
        scanf("%d",a);
    }while(a<=0);

}
int pgcd(int a, int b){
    while(a!=b){
        if (a>b){
            a=a-b;
        }
        else
            b=b-a;
    }
    return a;
}
