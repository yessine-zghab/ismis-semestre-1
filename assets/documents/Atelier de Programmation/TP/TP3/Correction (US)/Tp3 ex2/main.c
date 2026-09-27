#include <stdio.h>
#include <stdlib.h>

int saisirP(int n);
int factoriel(int n);
int positive();

int main()
{
    int n,p,C_n_p;
    n=positive();
    p=saisirP(n);
    C_n_p=factoriel(n)/(factoriel(p)*factoriel(n-p));
    printf("la resultat est: %d", C_n_p);
    return 0;
}
int positive(){
    int n;
    do{
        printf("donner n: ");
        scanf("%d", &n);
    }while(!(n>0));
    return n;
}
int saisirP(int n){
    int p;
    do{
        printf("donner p (0<=p<=n): ");
        scanf("%d", &p);
    }while(!(p>=0 && p<=n));
    return p;
}

int factoriel(int n){
    if (n==2)
        return 2;
    else
        return factoriel(n-1)*n;
}
