#include <stdio.h>
#include <stdlib.h>
#define length 7

void remplir_t(int* t);
void afficher_t(int* t);
void rotation_t(int* t,int rota);
int main()
{
    int t[length];
    int rota;
    printf("donner un entier: ");
    scanf("%d",&rota);
    remplir_t(t);
    afficher_t(t);
    rotation_t(t,rota);
    afficher_t(t);
    return 0;
}

void remplir_t(int* t){
    for(int i = 0; i < length; i++){
        printf("donner un entier t[%d]: ", i);
        scanf("%d", &t[i]);
    }
}

void afficher_t(int* t){
    for(int i = 0; i < length; i++){
        printf("%d  ",t[i]);
    }
    printf("\n");
}

void rotation_t(int* t,int rota){
    int temp[length];
    for (int i=0; i<length; i++){
        temp[(i+ rota)%length] = t[i];
    }
    for (int i=0; i < length;i++){
        t[i]=temp[i];
    }
}
