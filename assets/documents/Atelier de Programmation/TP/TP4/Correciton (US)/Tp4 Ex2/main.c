#include <stdio.h>
#include <stdlib.h>

int main()
{
    int a,b,c;
    printf("Donner un entier a: ");
    scanf("%d",&a);
    printf("donner un entier b: ");
    scanf("%d",&b);
    printf("Donner un entier c: ");
    scanf("%d",&c);
    sup(&a,&b);
    sup(&a,&c);
    sup(&b,&c);
    printf("a= %d b= %d c=%d",a,b,c);
    return 0;
}
void sup(int* a,int* b)
{
    int aux;
    if(*a<*b){
        aux=*a;
        *a=*b;
        *b=aux;
    }
}
