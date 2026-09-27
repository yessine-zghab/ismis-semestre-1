#include <stdio.h>
#include <stdlib.h>


int main()
{
    float a,a_sec;
    int nbrt;
    do
    {
        printf("Donner un côté de triangle >= 1: ");
        scanf("%f", &a);
    } while (a<1);
    a_sec = a;nbrt=1;
    while (a>=1)
    {
        printf("Le triangle A=%.2f peut contenir %d triangle avec A=%.2f\n",a_sec,nbrt,a);
        nbrt*=4;a/=2;
    }
    
    
}