#include <stdio.h>

void remplir(char* t);
void inverse(char* t);
void afficher(char* t);

int main() {
    char t[7];

    remplir(t);
    for (int i = 0; i < 7; i++) {
        printf("%c", t[i]);
    }
    inverse(t);
    afficher(t);


    return 0;
}

void remplir(char* t) {
    for (int i = 0; i < 7; i++) {

            printf("Saisir un caractere : ");
            scanf(" %c", &t[i]);

    }
}
void inverse(char* t){
    char aux;
    for (int i = 0; i < 3; i++) {
      aux=t[i];
      t[i]=t[6-i];
      t[6-i]=aux;

    }


}
void afficher(char* t){
    for (int i = 0; i < 7; i++) {
        printf("%c ", t[i]);
    }

}

