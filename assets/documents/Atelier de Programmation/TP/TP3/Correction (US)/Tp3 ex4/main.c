#include <stdio.h>
#include <stdlib.h>
void powforme(int n,int* p, int* test);
int main()
{
    int n,p;
    int test;
    do{
        printf("Donner un entier qui s'écrit sous la forme 2^n: ");
        scanf("%d", &n);
        powforme(n,&p,&test);
    }while(!test);
    printf("Le nombre %d s'écrit sous la forme 2 puissance %d\n",n,p);
    
}

void powforme(int n,int* p, int* test){
    *test=1;*p=0;
    while (*test && n!=1){
        if(n%2!=0)
            *test=0;
        else
            n/=2;*p=*p+1;
    }
}