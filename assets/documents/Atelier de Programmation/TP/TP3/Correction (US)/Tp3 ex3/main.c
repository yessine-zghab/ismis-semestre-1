#include <stdio.h>
#include <stdlib.h>

int s_binaire();
int verif(int nbr);
int convert_10(int b);
int puissance(int n, int p);

int main()
{
    int b;
    b=s_binaire();
    printf("le binaire %d in decimal est %d\n",b,convert_10(b));
    return 0;
}

int s_binaire(){
    int b;
    do{
        printf("ecrire un nombre binaire <= 8 bits: ");
        scanf("%d",&b);
    }while(!verif(b));
    return b;
}

int verif(int nbr){
    int test,length;
    test=1;length=0;
    while(test && nbr!=0){
        if (nbr%10 != 0 && nbr%10 !=1)
            test=0;
        else{
            length=length+1;
            nbr/=10;
        }
        if (length>8)
            test=0;
    }
    return test;
}

int convert_10(int b){
    int dec,index,i;
    dec=0; index=0;
    do {
        i=b %10;
        b=b/10;
        dec=dec+i*puissance(2,index++);
    }while(b!=0);
    return dec;
}

int puissance(int n, int p){
    for(int i=1; i < p; i++){
        n*=2;
    }
    if (p==0)
        return 1;
    return n;
}
