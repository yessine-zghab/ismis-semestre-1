#include <stdio.h>

void remplir(int* t);
int max(int* t);
int main() {
    int t[7],m;

    remplir(t);


    // Affichage pour vérifier
    for (int i = 0; i < 7; i++) {
        printf("%d ", t[i]);
    }
    m=max(t);
    printf("\n %d",m);
    return 0;
}

void remplir(int* t) {
    for (int i = 0; i < 7; i++) {
        do {
            printf("Saisir un entier positif : ");
            scanf("%d", &t[i]);
        } while (t[i] <= 0);
    }
}
int max(int* t){
    int m=t[0];
    for(int i=1;i<7;i++){
        if(t[i]>m){
            m=t[i];
        }
    }
    return m;



}
