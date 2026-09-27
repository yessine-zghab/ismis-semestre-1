#include <stdio.h>
#include <stdlib.h>

int main()
{
    int n;int t[10];
    saisir(&n);
    remplir(t,n);


    int s;
    int p;

    s=somme(t,n);
    printf("la somme est: %d\n",s);
    printf("le produit est %d\n",produit(t,n));
    printf("la moiyenne est %.2f\n",((float)s/n));

    return 0;
}
void saisir(int* n){
    do{
        printf("donner un nombre positive: ");
        scanf("%d",n);
    }while(n<=0);
}
void remplir(int* t,int n)
{
    for (int i=0;i<n;i++){
        printf("donner t[%d]: ", i);
        scanf("%d",t[i]);
    }
}
void somme(int* t,int n,int* s,int* p)
{
    *s=0;
    for(int i=0;i<n;i++){
        *s=*s+t[i];
        *p=*p*t[i];

    }
}
