#include <stdio.h>
#include <stdlib.h>

void initialisation (int* t);
void impression(int* t,int m);

int main()
{
    int t[13];
    int m;
    initialisation(t);

    do
    {
        printf("Donner une moin entre 1 et 12 pour connaitre combien de jours: ");
        scanf("%d",&m);
    }while(m > 12 || m < 1);
    impression(t,m);
    return 0;
}

void initialisation (int* t){
    for(int i = 1;i < 13; i++){
        if (i == 2)
            t[i]=28;
        else{
            if ((i%2==0 && i <= 7) || (i%2!=0 && i > 7)){
            t[i]=30;
            }
            else
                t[i]=31;
        }

    }
}

void impression(int* t,int m){
    printf("le nombre de jours dans le moin %d est %d\n",m,t[m]);
}
