#include <stdio.h>
#include <stdlib.h>
int sumdiv(int n);
int main()
{
    int a,b;
    do
    {
        printf("Donner le premier nombre: ");
        scanf("%d",&a);
    } while (a<=0);
    do
    {
        printf("Donner le deuxime nombre: ");
        scanf("%d",&b);
    } while (b<=0);
    if (sumdiv(a)==b && sumdiv(b)==a)
        printf("Le nombre %d et %d sont des amis\n",a,b);
    else
        printf("Le nombre %d et %d ne sont pas des amis\n",a,b);
}

int sumdiv(int n){
    int s=1;
    for (int i=2;i<=n/2;i++)
        if (n%i==0)
            s+=i;
    return s;
}