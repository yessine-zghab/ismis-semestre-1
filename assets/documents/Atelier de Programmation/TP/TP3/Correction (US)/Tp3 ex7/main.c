#include <stdio.h>
#include <stdlib.h>
int armstrong(int n);
int power(int n, int p);
int main()
{
    for(int i=1;i<=1000;i++)
        if (armstrong(i))
            printf("%d est un nombre de Armstrong.\n",i);
}

int armstrong(int n){
    int n_sec=n,s=0;
    while (n)
    {
        s+=power((n%10),3);
        n/=10;
    }
    return (s==n_sec);

}
int power(int n, int p){
    int n_sec=n;
    while (p-1)
    {
        n=n*n_sec;
        p-=1;
    }
    return n;
}